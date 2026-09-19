import { createProposalInput, type CreateProposalInput } from "@/server/contracts/proposal";
import { prisma } from "@/server/db/prisma";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
export async function createProposalService(context: WorkspaceContext, rawInput: CreateProposalInput) {
    assertCanMutate(context);
    const input = createProposalInput.parse(rawInput);
    return prisma.$transaction(async (tx) => {
        const opportunity = await tx.opportunity.findFirst({
            where: { id: input.opportunityId, workspaceId: context.workspaceId },
            include: { proposal: true }
        });
        if (!opportunity)
            throw new Error("Opportunity not found in workspace");
        if (opportunity.proposal)
            throw new Error("Opportunity already has a proposal");
        if (!opportunity.clientId)
            throw new Error("Proposal requires an assigned client");
        if (!new Set(["SCOPING", "QUOTED"]).has(opportunity.stage))
            throw new Error("Proposal requires a scoped opportunity");
        const proposal = await tx.proposal.create({
            data: {
                workspaceId: context.workspaceId,
                opportunityId: opportunity.id,
                status: "DRAFT",
                scope: input.scope,
                price: input.price,
                currency: input.currency.toUpperCase(),
                deliveryDays: input.deliveryDays,
                revisionLimit: input.revisionLimit,
                expiresAt: input.expiresAt
            }
        });
        await tx.activityEvent.create({
            data: {
                workspaceId: context.workspaceId,
                opportunityId: opportunity.id,
                type: "PROPOSAL_DRAFTED",
                actor: "workspace-user",
                summary: `${input.currency.toUpperCase()} ${input.price.toFixed(2)} proposal drafted`,
                metadata: {
                    proposalId: proposal.id,
                    deliveryDays: input.deliveryDays,
                    revisionLimit: input.revisionLimit
                }
            }
        });
        return proposal;
    });
}
