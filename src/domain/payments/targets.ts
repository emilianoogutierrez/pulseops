export type PaymentMethod = "SPEI" | "MERCADO_PAGO" | "USDT_BINANCE" | "OTHER";
const MERCADO_PAGO_HOSTS = new Set(["mpago.la", "mpago.mx", "link.mercadopago.com.mx"]);
export function validatePaymentTarget(method: PaymentMethod, paymentUrl?: string | null): void {
    if (!paymentUrl)
        return;
    if (method === "SPEI" || method === "USDT_BINANCE") {
        throw new Error(`${method} payment requests do not accept browser payment URLs`);
    }
    let url: URL;
    try {
        url = new URL(paymentUrl);
    }
    catch {
        throw new Error("Payment URL is invalid");
    }
    if (url.protocol !== "https:")
        throw new Error("Payment URL must use HTTPS");
    if (method === "MERCADO_PAGO" && !MERCADO_PAGO_HOSTS.has(url.hostname.toLowerCase())) {
        throw new Error("Mercado Pago links must use an approved Mercado Pago host");
    }
}
