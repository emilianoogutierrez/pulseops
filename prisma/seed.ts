import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { calculateOpportunityScore } from "../src/domain/opportunities/scoring";
import { hashPassword } from "../src/server/auth/password";
const connectionString = process.env.DATABASE_URL;
if (!connectionString)
    throw new Error("DATABASE_URL is required to seed PulseOps");
if (process.env.PULSEOPS_DEMO_MODE !== "true")
    throw new Error("Set PULSEOPS_DEMO_MODE=true to seed demo data");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
async function main() {
    const demoPassword = process.env.DEMO_PASSWORD || "pulseops-demo-password";
    const workspace = await prisma.workspace.upsert({
        where: { slug: "demo-studio" },
        update: { name: "Northstar Studio", baseCurrency: "MXN", timezone: "America/Mexico_City" },
        create: { name: "Northstar Studio", slug: "demo-studio", baseCurrency: "MXN", timezone: "America/Mexico_City" }
    });
    const passwordHash = await hashPassword(demoPassword);
    const user = await prisma.user.upsert({
        where: { email: "demo@pulseops.local" },
        update: { name: "Demo Operator", passwordHash },
        create: { email: "demo@pulseops.local", name: "Demo Operator", passwordHash }
    });
    await prisma.membership.upsert({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
        update: { role: "OWNER" },
        create: { workspaceId: workspace.id, userId: user.id, role: "OWNER" }
    });
    await prisma.authSession.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.activityEvent.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.paymentSettlement.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.deliverable.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.payment.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.project.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.proposal.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.opportunity.deleteMany({ where: { workspaceId: workspace.id } });
    await prisma.client.deleteMany({ where: { workspaceId: workspace.id } });
    for (const capability of [
        { method: "SPEI" as const, countryScope: "MX", settlementCurrency: "MXN", instructions: "Domestic bank transfer. Record settlement after bank confirmation." },
        { method: "MERCADO_PAGO" as const, countryScope: "MX", settlementCurrency: "MXN", instructions: "External Mercado Pago payment link; PulseOps stores the link and settlement result." },
        { method: "USDT_BINANCE" as const, countryScope: "INTL", settlementCurrency: "USDT", instructions: "International fallback using an operator-owned Binance settlement reference." }
    ]) {
        await prisma.workspacePaymentCapability.upsert({
            where: { workspaceId_method: { workspaceId: workspace.id, method: capability.method } },
            update: capability,
            create: { workspaceId: workspace.id, ...capability }
        });
    }
    const clientData = [
        ["Norte Studio", "Marina Torres", "marina@example.test", "MX", "SPEI", "Founder referral"],
        ["Lumen Commerce", "Diego Vega", "diego@example.test", "MX", "MERCADO_PAGO", "LinkedIn"],
        ["Atlas Labs", "Sofia Reed", "sofia@example.test", "US", "USDT_BINANCE", "Direct email"],
        ["Meridian Legal", "Paula Moreno", "paula@example.test", "MX", "SPEI", "Outbound research"],
        ["Faro Industrial", "Hector Ruiz", "hector@example.test", "MX", "SPEI", "Agency overflow"]
    ] as const;
    const clients = [];
    for (const [companyName, contactName, email, country, preferredPaymentMethod, acquisitionSource] of clientData) {
        clients.push(await prisma.client.create({
            data: { workspaceId: workspace.id, companyName, contactName, email, country, preferredPaymentMethod, acquisitionSource }
        }));
    }
    const opportunityInputs = [
        { title: "Automate lead handoff and enrichment", source: "Founder referral", serviceType: "AUTOMATION", estimatedValue: 8500, country: "MX", speiCompatible: true, mercadoPagoCompatible: true, usdtCompatible: false, asyncFriendly: true, spokenEnglishRequired: false, meetingLoad: "LOW", technicalFit: 96, paymentFit: 100, urgencyFit: 88, asyncFit: 96, aiLeverage: 90, clientQuality: 84, deliveryRisk: 24, stage: "DELIVERING", clientId: clients[0].id },
        { title: "Rebuild operations dashboard", source: "LinkedIn", serviceType: "WEB_APP", estimatedValue: 18000, country: "MX", speiCompatible: true, mercadoPagoCompatible: true, usdtCompatible: false, asyncFriendly: true, spokenEnglishRequired: false, meetingLoad: "MEDIUM", technicalFit: 92, paymentFit: 100, urgencyFit: 76, asyncFit: 82, aiLeverage: 76, clientQuality: 91, deliveryRisk: 34, stage: "QUOTED", clientId: clients[1].id },
        { title: "AI support triage integration", source: "Direct email", serviceType: "AI", estimatedValue: 24000, country: "US", speiCompatible: false, mercadoPagoCompatible: false, usdtCompatible: true, asyncFriendly: true, spokenEnglishRequired: true, meetingLoad: "LOW", technicalFit: 95, paymentFit: 72, urgencyFit: 90, asyncFit: 95, aiLeverage: 98, clientQuality: 88, deliveryRisk: 42, stage: "REPLIED", clientId: clients[2].id },
        { title: "Document workflow automation", source: "Outbound research", serviceType: "AUTOMATION", estimatedValue: 12000, country: "MX", speiCompatible: true, mercadoPagoCompatible: false, usdtCompatible: false, asyncFriendly: true, spokenEnglishRequired: false, meetingLoad: "NONE", technicalFit: 89, paymentFit: 100, urgencyFit: 74, asyncFit: 100, aiLeverage: 82, clientQuality: 80, deliveryRisk: 28, stage: "SCOPING", clientId: clients[3].id },
        { title: "Internal API integration", source: "Agency overflow", serviceType: "INTEGRATION", estimatedValue: 15000, country: "MX", speiCompatible: true, mercadoPagoCompatible: true, usdtCompatible: false, asyncFriendly: true, spokenEnglishRequired: false, meetingLoad: "LOW", technicalFit: 94, paymentFit: 100, urgencyFit: 82, asyncFit: 94, aiLeverage: 70, clientQuality: 92, deliveryRisk: 30, stage: "CONTACTED", clientId: clients[4].id }
    ] as const;
    const opportunities = [];
    for (const input of opportunityInputs) {
        const score = calculateOpportunityScore(input);
        opportunities.push(await prisma.opportunity.create({
            data: {
                workspaceId: workspace.id,
                ...input,
                qualificationScore: score,
                probability: Math.min(90, Math.max(10, score - 15)),
                nextActionAt: new Date(Date.now() + (opportunities.length - 1) * 86400000),
                lastContactAt: new Date(Date.now() - 86400000)
            }
        }));
    }
    await prisma.proposal.create({
        data: {
            workspaceId: workspace.id,
            opportunityId: opportunities[0].id,
            status: "ACCEPTED",
            scope: { summary: "Automate the lead handoff path from normalized intake through CRM delivery with inspectable failure handling.", deliverables: ["Lead normalization", "CRM handoff", "Failure logging"], acceptanceCriteria: ["Incoming lead payloads are normalized deterministically", "Qualified leads are delivered to the configured CRM path", "Failed deliveries create an inspectable error record"], exclusions: ["CRM licensing fees", "Ongoing manual lead entry"] },
            price: 8500,
            deliveryDays: 6,
            revisionLimit: 1,
            sentAt: new Date(Date.now() - 5 * 86400000),
            acceptedAt: new Date(Date.now() - 4 * 86400000)
        }
    });
    await prisma.proposal.create({
        data: {
            workspaceId: workspace.id,
            opportunityId: opportunities[1].id,
            status: "SENT",
            scope: { summary: "Rebuild the operations dashboard with responsive, role-aware views and a deployment-ready handoff.", deliverables: ["Responsive dashboard", "Role-aware data views", "Deployment notes"], acceptanceCriteria: ["Dashboard works at mobile and desktop breakpoints", "Viewer role cannot mutate protected records", "Production build and deployment checklist pass"], exclusions: ["Third-party licensing fees"] },
            price: 18000,
            deliveryDays: 10,
            revisionLimit: 2,
            sentAt: new Date(Date.now() - 86400000),
            expiresAt: new Date(Date.now() + 6 * 86400000)
        }
    });
    const norteProject = await prisma.project.create({
        data: {
            workspaceId: workspace.id,
            clientId: clients[0].id,
            opportunityId: opportunities[0].id,
            name: "Norte automation rollout",
            status: "ACTIVE",
            quotedAmount: 8500,
            collectedAmount: 4250,
            startedAt: new Date(Date.now() - 4 * 86400000),
            dueAt: new Date(Date.now() + 4 * 86400000)
        }
    });
    const paid = await prisma.payment.create({
        data: {
            workspaceId: workspace.id,
            clientId: clients[0].id,
            projectId: norteProject.id,
            method: "SPEI",
            amount: 4250,
            status: "PAID",
            settledAmount: 4250,
            externalReference: "SPEI-DEMO-001",
            paidAt: new Date(Date.now() - 86400000)
        }
    });
    await prisma.deliverable.createMany({
        data: [
            { workspaceId: workspace.id, projectId: norteProject.id, title: "Lead normalization", description: "Incoming payloads normalize deterministically", status: "ACCEPTED", position: 0, acceptedAt: new Date(Date.now() - 2 * 86400000) },
            { workspaceId: workspace.id, projectId: norteProject.id, title: "CRM handoff", description: "Qualified leads reach the configured CRM path", status: "REVIEW", position: 1 },
            { workspaceId: workspace.id, projectId: norteProject.id, title: "Failure logging", description: "Failed deliveries remain inspectable", status: "IN_PROGRESS", position: 2 }
        ]
    });
    await prisma.paymentSettlement.create({
        data: {
            workspaceId: workspace.id,
            paymentId: paid.id,
            amount: 4250,
            externalReference: "SPEI-DEMO-001",
            note: "Demo bank confirmation",
            settledAt: new Date(Date.now() - 86400000)
        }
    });
    await prisma.payment.createMany({
        data: [
            { workspaceId: workspace.id, clientId: clients[1].id, method: "MERCADO_PAGO", amount: 6000, settledAmount: 6000, status: "PAID", externalReference: "MP-DEMO-001", paidAt: new Date(Date.now() - 34 * 86400000) },
            { workspaceId: workspace.id, clientId: clients[4].id, method: "SPEI", amount: 6500, settledAmount: 6500, status: "PAID", externalReference: "SPEI-DEMO-002", paidAt: new Date(Date.now() - 65 * 86400000) },
            { workspaceId: workspace.id, clientId: clients[2].id, method: "USDT_BINANCE", amount: 12000, currency: "MXN", status: "PENDING", externalReference: "BINANCE-PENDING-DEMO", dueAt: new Date(Date.now() + 2 * 86400000) }
        ]
    });
    await prisma.activityEvent.createMany({
        data: [
            { workspaceId: workspace.id, opportunityId: opportunities[0].id, projectId: norteProject.id, type: "PROJECT_ACTIVE", summary: "Norte automation rollout moved into active delivery", actor: "Demo Operator" },
            { workspaceId: workspace.id, opportunityId: opportunities[1].id, type: "PROPOSAL_SENT", summary: "MXN 18,000 proposal sent to Lumen Commerce", actor: "Demo Operator" },
            { workspaceId: workspace.id, opportunityId: opportunities[2].id, type: "CLIENT_REPLIED", summary: "Atlas Labs replied with API constraints", actor: "System" },
            { workspaceId: workspace.id, paymentId: paid.id, projectId: norteProject.id, type: "PAYMENT_MARKED_PAID", summary: "MXN 4,250 received via SPEI", actor: "Demo Operator" }
        ]
    });
    console.log(`PulseOps demo ready. Login: demo@pulseops.local / ${demoPassword}`);
}
main().finally(async () => prisma.$disconnect());
