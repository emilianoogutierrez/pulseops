import { z } from "zod";
export const createPaymentInput = z.object({ clientId: z.string().min(1), projectId: z.string().optional(), method: z.enum(["SPEI", "MERCADO_PAGO", "USDT_BINANCE", "OTHER"]), amount: z.coerce.number().positive().max(10000000), currency: z.string().length(3).default("MXN"), externalReference: z.string().trim().max(160).optional(), paymentUrl: z.string().url().optional().or(z.literal("")), dueAt: z.coerce.date().optional() });
export type CreatePaymentInput = z.input<typeof createPaymentInput>;
