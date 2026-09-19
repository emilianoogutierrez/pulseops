import { describe, expect, it } from "vitest";
import { nextPaymentState, remainingPaymentAmount } from "../../src/domain/payments/settlement";
describe("payment settlement", () => {
    it("distinguishes pending, partial and paid states", () => {
        expect(nextPaymentState(1000, 0)).toBe("PENDING");
        expect(nextPaymentState(1000, 250)).toBe("PARTIAL");
        expect(nextPaymentState(1000, 1000)).toBe("PAID");
    });
    it("rejects over-settlement instead of silently over-collecting", () => {
        expect(() => nextPaymentState(1000, 1000.01)).toThrow(/exceed/);
        expect(remainingPaymentAmount(1000, 250)).toBe(750);
    });
});
