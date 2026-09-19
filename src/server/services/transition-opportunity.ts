import { prisma } from "@/server/db/prisma";
import { transitionOpportunityInput, type TransitionOpportunityInput } from "@/server/contracts/opportunity";
import { transitionOpportunity } from "@/domain/opportunities/transitions";
import type { OpportunityStage as DomainStage } from "@/domain/opportunities/types";
import type { WorkspaceContext } from "@/server/workspace/context";
import { assertCanMutate } from "@/server/workspace/context";
export class StaleOpportunityError extends Error {
    constructor() {
        super("Opportunity changed before this mutation could be committed");
        this.name = "StaleOpportunityError";
    }
}
export async function transitionOpportunityService(context: WorkspaceContext, rawInput: TransitionOpportunityInput) {
    assertCanMutate(context);
    const input = transitionOpportunityInput.parse(rawInput);
    return prisma.$transaction(async (tx) => {
        const opportunity = await tx.opportunity.findFirst({
            where: { id: input.opportunityId, workspaceId: context.workspaceId },
            select: { id: true, stage: true, version: true }
        });
        if (!opportunity)
            throw new Error("Opportunity not found in workspace");
        const nextStage = transitionOpportunity(opportunity.stage as DomainStage, input.targetStage);
        const update = await tx.opportunity.updateMany({
            where: {
                id: opportunity.id,
                workspaceId: context.workspaceId,
                version: input.expectedVersion
            },
            data: {
                stage: nextStage,
                version: { increment: 1 }
            }
        });
        if (update.count !== 1)
            throw new StaleOpportunityError();
        await tx.activityEvent.create({
            data: {
                workspaceId: context.workspaceId,
                opportunityId: opportunity.id,
                type: "OPPORTUNITY_STAGE_CHANGED",
                actor: "workspace-user",
                summary: `${opportunity.stage} → ${nextStage}`,
                metadata: { from: opportunity.stage, to: nextStage }
            }
        });
        return { id: opportunity.id, stage: nextStage, version: input.expectedVersion + 1 };
    });
}
