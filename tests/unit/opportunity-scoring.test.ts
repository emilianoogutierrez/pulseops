import { describe, expect, it } from "vitest";
import { calculateOpportunityScore } from "@/domain/opportunities/scoring";
describe("calculateOpportunityScore", () => {
    it("rewards strong fit and penalizes delivery risk", () => {
        const strong = calculateOpportunityScore({ technicalFit: 95, paymentFit: 100, urgencyFit: 90, asyncFit: 95, aiLeverage: 90, clientQuality: 85, deliveryRisk: 20 });
        const risky = calculateOpportunityScore({ technicalFit: 95, paymentFit: 100, urgencyFit: 90, asyncFit: 95, aiLeverage: 90, clientQuality: 85, deliveryRisk: 90 });
        expect(strong).toBeGreaterThan(risky);
        expect(strong).toBeGreaterThan(75);
    });
    it("clamps malformed score inputs", () => {
        const score = calculateOpportunityScore({ technicalFit: 140, paymentFit: -20, urgencyFit: 50, asyncFit: 50, aiLeverage: 50, clientQuality: 50, deliveryRisk: 0 });
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });
});
