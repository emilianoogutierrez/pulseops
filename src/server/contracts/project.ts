import { z } from "zod";
export const transitionProjectInput = z.object({
    projectId: z.string().min(1),
    expectedVersion: z.number().int().positive(),
    targetStatus: z.enum(["PLANNED", "ACTIVE", "BLOCKED", "REVIEW", "DELIVERED", "CLOSED"])
});
export const transitionDeliverableInput = z.object({
    deliverableId: z.string().min(1),
    targetStatus: z.enum(["PLANNED", "IN_PROGRESS", "REVIEW", "ACCEPTED"])
});
export type TransitionProjectInput = z.infer<typeof transitionProjectInput>;
export type TransitionDeliverableInput = z.infer<typeof transitionDeliverableInput>;
