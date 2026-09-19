import { transitionProject, type ProjectState } from "@/domain/projects/lifecycle";
import { prisma } from "@/server/db/prisma";
import { transitionProjectInput, type TransitionProjectInput } from "@/server/contracts/project";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
export class StaleProjectError extends Error {
    constructor() {
        super("Project changed before this update could be applied");
        this.name = "StaleProjectError";
    }
}
export async function transitionProjectService(context: WorkspaceContext, rawInput: TransitionProjectInput) {
    assertCanMutate(context);
    const input = transitionProjectInput.parse(rawInput);
    return prisma.$transaction(async (tx) => {
        const project = await tx.project.findFirst({
            where: { id: input.projectId, workspaceId: context.workspaceId }
        });
        if (!project)
            throw new Error("Project not found in workspace");
        const next = transitionProject(project.status as ProjectState, input.targetStatus as ProjectState);
        const now = new Date();
        const result = await tx.project.updateMany({
            where: {
                id: project.id,
                workspaceId: context.workspaceId,
                version: input.expectedVersion
            },
            data: {
                status: next,
                version: { increment: 1 },
                startedAt: next === "ACTIVE" && !project.startedAt ? now : undefined,
                completedAt: next === "DELIVERED" ? now : undefined
            }
        });
        if (result.count !== 1)
            throw new StaleProjectError();
        await tx.activityEvent.create({
            data: {
                workspaceId: context.workspaceId,
                opportunityId: project.opportunityId,
                projectId: project.id,
                type: "PROJECT_STATUS_CHANGED",
                actor: "workspace-user",
                summary: `Project moved from ${project.status} to ${next}`,
                metadata: { from: project.status, to: next }
            }
        });
        return tx.project.findUniqueOrThrow({ where: { id: project.id } });
    });
}
