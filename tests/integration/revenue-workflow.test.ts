import { describe, expect, it } from "vitest";
const databaseAvailable = Boolean(process.env.DATABASE_URL);
describe.skipIf(!databaseAvailable)("persisted revenue workflow", () => {
    it("accepts a sent proposal and creates one project in the same workspace", async () => {
        const [{ prisma }, { acceptProposalService }] = await Promise.all([
            import("../../src/server/db/prisma"),
            import("../../src/server/services/accept-proposal")
        ]);
        const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: "demo-studio" } });
        const proposal = await prisma.proposal.findFirstOrThrow({
            where: { workspaceId: workspace.id, status: "SENT" },
            include: { opportunity: true }
        });
        const result = await acceptProposalService({ workspaceId: workspace.id, role: "OWNER" }, { proposalId: proposal.id, expectedOpportunityVersion: proposal.opportunity.version });
        expect(result.proposal.status).toBe("ACCEPTED");
        const persisted = await prisma.project.findUnique({
            where: { opportunityId: proposal.opportunityId },
            include: { deliverables: true }
        });
        expect(persisted?.workspaceId).toBe(workspace.id);
        expect(Number(persisted?.quotedAmount)).toBe(Number(proposal.price));
        expect(persisted?.deliverables.length).toBeGreaterThan(0);
    });
    it("records an append-only settlement and updates payment state", async () => {
        const [{ prisma }, { recordPaymentSettlementService }] = await Promise.all([
            import("../../src/server/db/prisma"),
            import("../../src/server/services/record-payment-settlement")
        ]);
        const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: "demo-studio" } });
        const payment = await prisma.payment.findFirstOrThrow({ where: { workspaceId: workspace.id, status: "PENDING" } });
        const result = await recordPaymentSettlementService({ workspaceId: workspace.id, role: "OWNER" }, { paymentId: payment.id, amount: Number(payment.amount), externalReference: "INTEGRATION-TEST-PAID" });
        expect(result.payment.status).toBe("PAID");
        expect(result.payment.paidAt).not.toBeNull();
        expect(Number(result.payment.settledAmount)).toBe(Number(payment.amount));
        const ledger = await prisma.paymentSettlement.findMany({ where: { paymentId: payment.id } });
        expect(ledger.length).toBeGreaterThan(0);
        const audit = await prisma.activityEvent.findFirst({ where: { paymentId: payment.id, type: "PAYMENT_SETTLEMENT_RECORDED" } });
        expect(audit).not.toBeNull();
    });
});
describe.skipIf(!databaseAvailable)("operator creation boundaries", () => {
    it("creates a scored opportunity only inside the authenticated workspace", async () => {
        const [{ prisma }, { createOpportunityService }] = await Promise.all([
            import("../../src/server/db/prisma"),
            import("../../src/server/services/create-opportunity")
        ]);
        const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: "demo-studio" } });
        const client = await prisma.client.findFirstOrThrow({ where: { workspaceId: workspace.id } });
        const created = await createOpportunityService({ workspaceId: workspace.id, role: "OWNER" }, {
            clientId: client.id, title: "Integration-test automation", source: "Test fixture", serviceType: "AUTOMATION",
            country: "MX", currency: "MXN", estimatedValue: 9000, speiCompatible: true, mercadoPagoCompatible: false,
            usdtCompatible: false, asyncFriendly: true, spokenEnglishRequired: false, meetingLoad: "LOW",
            technicalFit: 90, paymentFit: 100, urgencyFit: 80, asyncFit: 95, aiLeverage: 85, clientQuality: 80, deliveryRisk: 20
        });
        expect(created.workspaceId).toBe(workspace.id);
        expect(created.qualificationScore).toBeGreaterThan(70);
    });
    it("rejects payment creation for a client outside the workspace boundary", async () => {
        const [{ prisma }, { createPaymentService }] = await Promise.all([
            import("../../src/server/db/prisma"),
            import("../../src/server/services/create-payment")
        ]);
        const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: "demo-studio" } });
        await expect(createPaymentService({ workspaceId: workspace.id, role: "OWNER" }, {
            clientId: "missing-client", method: "SPEI", amount: 1000, currency: "MXN"
        })).rejects.toThrow(/Client not found/);
    });
});
