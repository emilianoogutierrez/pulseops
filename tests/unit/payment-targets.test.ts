import { describe, expect, it } from "vitest";
import { validatePaymentTarget } from "@/domain/payments/targets";
describe("payment target policy", () => {
    it("accepts documented Mercado Pago link hosts", () => {
        expect(() => validatePaymentTarget("MERCADO_PAGO", "https://mpago.la/2WTWRHT")).not.toThrow();
    });
    it("rejects arbitrary hosts for Mercado Pago", () => {
        expect(() => validatePaymentTarget("MERCADO_PAGO", "https://payments.example.com/demo")).toThrow(/approved/);
    });
    it("keeps SPEI as an external bank-transfer record", () => {
        expect(() => validatePaymentTarget("SPEI", "https://example.com/pay")).toThrow(/do not accept/);
    });
});
