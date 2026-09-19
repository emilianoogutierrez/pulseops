import { prisma } from "@/server/db/prisma";
import { acceptProposalInput, proposalScope, type AcceptProposalInput } from "@/server/contracts/proposal";
import { assertProposalCanBeAccepted } from "@/domain/proposals/lifecycle";
import { transitionOpportunity } from "@/domain/opportunities/transitions";
import type { OpportunityStage as DomainStage } from "@/domain/opportunities/types";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
export class StaleProposalError extends Error {
    constructor() {
        super("Opportunity changed before the proposal could be accepted");
        this.name = "StaleProposalError";
    }
}
export async function acceptProposalService(context: WorkspaceContext, rawInput: AcceptProposalInput) {
    assertCanMutate(context);
    const input = acceptProposalInput.parse(rawInput);
    return prisma.$transaction(async (tx) => {
        const proposal = await tx.proposal.findFirst({
            where: { id: input.proposalId, workspaceId: context.workspaceId },
            include: { opportunity: true }
        });
        if (!proposal)
            throw new Error("Proposal not found in workspace");
        assertProposalCanBeAccepted(proposal.status);
        if (!proposal.opportunity.clientId)
            throw new Error("Accepted proposals require an assigned client");
        const nextStage = transitionOpportunity(proposal.opportunity.stage as DomainStage, "WON");
        const opportunityUpdate = await tx.opportunity.updateMany({
            where: {
                id: proposal.opportunityId,
                workspaceId: context.workspaceId,
                version: input.expectedOpportunityVersion
            },
            data: { stage: nextStage, version: { increment: 1 } }
        });
        if (opportunityUpdate.count !== 1)
            throw new StaleProposalError();
        const updatedProposal = await tx.proposal.update({
            where: { id: proposal.id },
            data: { status: "ACCEPTED", acceptedAt: new Date() }
        });
        const project = await tx.project.create({
            data: {
                workspaceId: context.workspaceId,
                clientId: proposal.opportunity.clientId,
                opportunityId: proposal.opportunityId,
                name: proposal.opportunity.title,
                status: "PLANNED",
                quotedAmount: proposal.price,
                dueAt: new Date(Date.now() + proposal.deliveryDays * 86400000)
            }
        });
        const scope = proposalScope.parse(proposal.scope);
        await tx.deliverable.createMany({
            data: scope.deliverables.map((title, position) => ({
                workspaceId: context.workspaceId,
                projectId: project.id,
                title,
                description: scope.acceptanceCriteria[position] ?? null,
                position
            }))
        });
        await tx.activityEvent.createMany({
            data: [
                {
                    workspaceId: context.workspaceId,
                    opportunityId: proposal.opportunityId,
                    projectId: project.id,
                    type: "PROPOSAL_ACCEPTED",
                    actor: "workspace-user",
                    summary: `Proposal accepted at ${proposal.currency} ${proposal.price.toString()}`
                },
                {
                    workspaceId: context.workspaceId,
                    opportunityId: proposal.opportunityId,
                    projectId: project.id,
                    type: "PROJECT_CREATED",
                    actor: "system",
                    summary: `Project created with ${scope.deliverables.length} contracted deliverables`
                }
            ]
        });
        return { proposal: updatedProposal, project };
    });
}
