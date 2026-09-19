import { describe, expect, it } from "vitest";
import { choosePreferredPaymentRoute } from "@/domain/payments/routing";
describe("payment routing", () => {
    it("prefers SPEI for Mexico", () => {
        expect(choosePreferredPaymentRoute({ country: "MX", speiEnabled: true, mercadoPagoEnabled: true, usdtEnabled: true })).toBe("SPEI");
    });
    it("falls back to Mercado Pago for Mexico when SPEI is unavailable", () => {
        expect(choosePreferredPaymentRoute({ country: "MX", speiEnabled: false, mercadoPagoEnabled: true, usdtEnabled: true })).toBe("MERCADO_PAGO");
    });
    it("uses USDT as the explicit international fallback", () => {
        expect(choosePreferredPaymentRoute({ country: "US", speiEnabled: true, mercadoPagoEnabled: true, usdtEnabled: true })).toBe("USDT_BINANCE");
    });
});
