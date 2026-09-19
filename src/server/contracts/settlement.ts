import { z } from "zod";
export const recordSettlementInput = z.object({
    paymentId: z.string().min(1),
    amount: z.number().positive().max(100000000),
    externalReference: z.string().trim().max(180).optional(),
    note: z.string().trim().max(500).optional()
});
export type RecordSettlementInput = z.infer<typeof recordSettlementInput>;
