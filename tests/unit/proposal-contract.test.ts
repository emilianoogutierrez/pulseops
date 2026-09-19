import { describe, expect, it } from "vitest";
import { createProposalInput } from "../../src/server/contracts/proposal";
describe("proposal contract", () => {
    it("requires explicit deliverables and acceptance criteria", () => {
        const result = createProposalInput.safeParse({
            opportunityId: "opp-1",
            price: 18000,
            currency: "MXN",
            deliveryDays: 10,
            revisionLimit: 2,
            scope: {
                summary: "Rebuild the operations dashboard with a production-ready handoff.",
                deliverables: ["Responsive dashboard"],
                acceptanceCriteria: ["Production build passes"],
                exclusions: []
            }
        });
        expect(result.success).toBe(true);
    });
    it("rejects a vague proposal with no acceptance criteria", () => {
        const result = createProposalInput.safeParse({
            opportunityId: "opp-1",
            price: 18000,
            currency: "MXN",
            deliveryDays: 10,
            revisionLimit: 2,
            scope: {
                summary: "Do the dashboard work.",
                deliverables: ["Dashboard"],
                acceptanceCriteria: []
            }
        });
        expect(result.success).toBe(false);
    });
});
