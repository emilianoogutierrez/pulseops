import { transitionOpportunity } from "@/domain/opportunities/transitions";
import type { OpportunityStage as DomainStage } from "@/domain/opportunities/types";
import { transitionProposal } from "@/domain/proposals/lifecycle";
import { sendProposalInput, type SendProposalInput } from "@/server/contracts/proposal";
import { prisma } from "@/server/db/prisma";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";

export async function sendProposalService(context: WorkspaceContext, rawInput: SendProposalInput) {
  assertCanMutate(context);
  const input = sendProposalInput.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.findFirst({
      where: { id: input.proposalId, workspaceId: context.workspaceId },
      include: { opportunity: true }
    });
    if (!proposal) throw new Error("Proposal not found in workspace");

    const next = transitionProposal(proposal.status, "SENT");
    const sentAt = new Date();
    const updated = await tx.proposal.update({
      where: { id: proposal.id },
      data: { status: next, sentAt }
    });

    if (proposal.opportunity.stage === "SCOPING") {
      const stage = transitionOpportunity(proposal.opportunity.stage as DomainStage, "QUOTED");
      await tx.opportunity.update({
        where: { id: proposal.opportunityId },
        data: { stage, version: { increment: 1 } }
      });
    }

    await tx.activityEvent.create({
      data: {
        workspaceId: context.workspaceId,
        opportunityId: proposal.opportunityId,
        type: "PROPOSAL_SENT",
        actor: "workspace-user",
        summary: `${proposal.currency} ${proposal.price.toString()} proposal marked as sent`,
        metadata: { proposalId: proposal.id, sentAt: sentAt.toISOString() }
      }
    });

    return updated;
  });
}
