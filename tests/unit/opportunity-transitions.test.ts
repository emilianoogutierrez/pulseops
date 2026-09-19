import { describe, expect, it } from "vitest";
import { canTransitionOpportunity, InvalidOpportunityTransitionError, transitionOpportunity } from "@/domain/opportunities/transitions";
describe("opportunity state machine", () => {
    it("allows the intended sales lifecycle", () => {
        expect(canTransitionOpportunity("QUALIFIED", "CONTACTED")).toBe(true);
        expect(canTransitionOpportunity("QUOTED", "WON")).toBe(true);
        expect(canTransitionOpportunity("DELIVERED", "PAID")).toBe(true);
    });
    it("rejects backwards and arbitrary transitions", () => {
        expect(() => transitionOpportunity("CONTACTED", "PAID")).toThrow(InvalidOpportunityTransitionError);
        expect(canTransitionOpportunity("PAID", "QUALIFIED")).toBe(false);
    });
});
