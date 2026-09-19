import { prisma } from "@/server/db/prisma";
import { transitionDeliverableInput, type TransitionDeliverableInput } from "@/server/contracts/project";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
const allowed: Record<string, readonly string[]> = {
    PLANNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["REVIEW"],
    REVIEW: ["IN_PROGRESS", "ACCEPTED"],
    ACCEPTED: []
};
export async function transitionDeliverableService(context: WorkspaceContext, rawInput: TransitionDeliverableInput) {
    assertCanMutate(context);
    const input = transitionDeliverableInput.parse(rawInput);
    return prisma.$transaction(async (tx) => {
        const deliverable = await tx.deliverable.findFirst({
            where: {
                id: input.deliverableId,
                workspaceId: context.workspaceId
            },
            include: { project: true }
        });
        if (!deliverable)
            throw new Error("Deliverable not found in workspace");
        if (!allowed[deliverable.status]?.includes(input.targetStatus)) {
            throw new Error(`Deliverable cannot transition from ${deliverable.status} to ${input.targetStatus}`);
        }
        const updated = await tx.deliverable.update({
            where: { id: deliverable.id },
            data: {
                status: input.targetStatus,
                acceptedAt: input.targetStatus === "ACCEPTED" ? new Date() : null
            }
        });
        await tx.activityEvent.create({
            data: {
                workspaceId: context.workspaceId,
                opportunityId: deliverable.project.opportunityId,
                projectId: deliverable.projectId,
                type: "DELIVERABLE_STATUS_CHANGED",
                actor: "workspace-user",
                summary: `${deliverable.title} moved to ${input.targetStatus}`,
                metadata: { deliverableId: deliverable.id, status: input.targetStatus }
            }
        });
        return updated;
    });
}
