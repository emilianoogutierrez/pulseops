import { calculateOpportunityScore } from "@/domain/opportunities/scoring";
import { prisma } from "@/server/db/prisma";
import { createOpportunityInput, type CreateOpportunityInput } from "@/server/contracts/create-opportunity";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
export async function createOpportunityService(context: WorkspaceContext, raw: CreateOpportunityInput) {
    assertCanMutate(context);
    const input = createOpportunityInput.parse(raw);
    const score = calculateOpportunityScore(input);
    return prisma.$transaction(async (tx) => {
        const client = await tx.client.findFirst({ where: { id: input.clientId, workspaceId: context.workspaceId }, select: { id: true } });
        if (!client)
            throw new Error("Client not found in workspace");
        const opportunity = await tx.opportunity.create({ data: { workspaceId: context.workspaceId, ...input, qualificationScore: score, probability: Math.min(90, Math.max(10, score - 15)), stage: "DISCOVERED", version: 1 } });
        await tx.activityEvent.create({ data: { workspaceId: context.workspaceId, opportunityId: opportunity.id, type: "OPPORTUNITY_CREATED", actor: "workspace-user", summary: `Created ${opportunity.title}`, metadata: { score, source: opportunity.source } } });
        return opportunity;
    });
}
