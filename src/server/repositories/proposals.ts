import { prisma } from "@/server/db/prisma";
export async function listProposals(workspaceId: string) {
    return prisma.proposal.findMany({
        where: { workspaceId },
        include: { opportunity: { include: { client: true } } },
        orderBy: { updatedAt: "desc" }
    });
}
export async function getProposal(workspaceId: string, id: string) {
    return prisma.proposal.findFirst({
        where: { id, workspaceId },
        include: {
            opportunity: {
                include: { client: true, project: true }
            }
        }
    });
}
export async function listProposalCandidates(workspaceId: string) {
    return prisma.opportunity.findMany({
        where: {
            workspaceId,
            proposal: null,
            clientId: { not: null },
            stage: { in: ["SCOPING", "QUOTED"] }
        },
        include: { client: true },
        orderBy: [{ qualificationScore: "desc" }, { updatedAt: "desc" }]
    });
}
