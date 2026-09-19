import { z } from "zod";
export const createOpportunityInput = z.object({
    clientId: z.string().min(1), title: z.string().trim().min(3).max(140), description: z.string().trim().max(1500).optional(), source: z.string().trim().min(2).max(80),
    serviceType: z.enum(["WEB_APP", "BACKEND", "AUTOMATION", "INTEGRATION", "AI", "BUG_FIX", "OTHER"]), country: z.string().trim().length(2).default("MX"), currency: z.string().trim().length(3).default("MXN"), estimatedValue: z.coerce.number().positive().max(10000000),
    speiCompatible: z.coerce.boolean().default(false), mercadoPagoCompatible: z.coerce.boolean().default(false), usdtCompatible: z.coerce.boolean().default(false), asyncFriendly: z.coerce.boolean().default(true), spokenEnglishRequired: z.coerce.boolean().default(false), meetingLoad: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]),
    technicalFit: z.coerce.number().int().min(0).max(100), paymentFit: z.coerce.number().int().min(0).max(100), urgencyFit: z.coerce.number().int().min(0).max(100), asyncFit: z.coerce.number().int().min(0).max(100), aiLeverage: z.coerce.number().int().min(0).max(100), clientQuality: z.coerce.number().int().min(0).max(100), deliveryRisk: z.coerce.number().int().min(0).max(100)
});
export type CreateOpportunityInput = z.input<typeof createOpportunityInput>;
