import { describe, expect, it } from "vitest";
import { assertProposalCanBeAccepted } from "../../src/domain/proposals/lifecycle";
describe("proposal lifecycle", () => {
    it("allows only sent proposals to be accepted", () => {
        expect(() => assertProposalCanBeAccepted("SENT")).not.toThrow();
        for (const state of ["DRAFT", "ACCEPTED", "DECLINED", "EXPIRED"] as const) {
            expect(() => assertProposalCanBeAccepted(state)).toThrow();
        }
    });
});
