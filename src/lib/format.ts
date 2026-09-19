export const mxn = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});
export const compact = new Intl.NumberFormat("es-MX", {
    notation: "compact",
    maximumFractionDigits: 1
});
export const shortDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
});
export function relativeDay(value: Date | string | null): string {
    if (!value)
        return "No follow-up";
    const target = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const day = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
    const diff = Math.round((day - today) / 86400000);
    if (diff === 0)
        return "Today";
    if (diff === 1)
        return "Tomorrow";
    if (diff === -1)
        return "Yesterday";
    return diff > 0 ? `In ${diff} days` : `${Math.abs(diff)} days ago`;
}
