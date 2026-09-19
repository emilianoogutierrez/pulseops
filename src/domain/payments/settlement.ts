export type PaymentState = "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "REFUNDED";
export function nextPaymentState(total: number, settled: number): PaymentState {
    if (!Number.isFinite(total) || total <= 0)
        throw new Error("Payment total must be positive");
    if (!Number.isFinite(settled) || settled < 0)
        throw new Error("Settled amount cannot be negative");
    if (settled === 0)
        return "PENDING";
    if (settled < total)
        return "PARTIAL";
    if (settled === total)
        return "PAID";
    throw new Error("Settlement cannot exceed payment amount");
}
export function remainingPaymentAmount(total: number, settled: number): number {
    return Math.max(0, Number((total - settled).toFixed(2)));
}
