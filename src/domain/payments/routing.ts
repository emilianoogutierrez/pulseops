export type PaymentRouteInput = {
    country: string;
    speiEnabled: boolean;
    mercadoPagoEnabled: boolean;
    usdtEnabled: boolean;
};
export type PaymentRoute = "SPEI" | "MERCADO_PAGO" | "USDT_BINANCE" | "UNSUPPORTED";
export function choosePreferredPaymentRoute(input: PaymentRouteInput): PaymentRoute {
    if (input.country.toUpperCase() === "MX") {
        if (input.speiEnabled)
            return "SPEI";
        if (input.mercadoPagoEnabled)
            return "MERCADO_PAGO";
    }
    if (input.usdtEnabled)
        return "USDT_BINANCE";
    return "UNSUPPORTED";
}
