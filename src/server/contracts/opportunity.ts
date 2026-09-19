import { z } from "zod";
import { OPPORTUNITY_STAGES } from "@/domain/opportunities/types";
export const transitionOpportunityInput = z.object({
    opportunityId: z.string().min(1),
    expectedVersion: z.number().int().positive(),
    targetStage: z.enum(OPPORTUNITY_STAGES)
});
export type TransitionOpportunityInput = z.infer<typeof transitionOpportunityInput>;
