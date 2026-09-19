"use server";
import { revalidatePath } from "next/cache";
import { requireSessionIdentity } from "@/server/auth/session";
import { transitionDeliverableService } from "@/server/services/transition-deliverable";
import { transitionProjectService } from "@/server/services/transition-project";
export async function transitionProjectAction(formData: FormData) {
    const session = await requireSessionIdentity();
    const projectId = String(formData.get("projectId"));
    await transitionProjectService(session, {
        projectId,
        expectedVersion: Number(formData.get("expectedVersion")),
        targetStatus: String(formData.get("targetStatus")) as never
    });
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/dashboard");
}
export async function transitionDeliverableAction(formData: FormData) {
    const session = await requireSessionIdentity();
    const projectId = String(formData.get("projectId"));
    await transitionDeliverableService(session, {
        deliverableId: String(formData.get("deliverableId")),
        targetStatus: String(formData.get("targetStatus")) as never
    });
    revalidatePath(`/projects/${projectId}`);
}
