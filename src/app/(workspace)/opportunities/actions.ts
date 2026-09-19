"use server";
import { revalidatePath } from "next/cache";
import { requireSessionIdentity } from "@/server/auth/session";
import { transitionOpportunityService } from "@/server/services/transition-opportunity";
import type { OpportunityStage } from "@/domain/opportunities/types";
export async function transitionOpportunityAction(formData: FormData) {
    const session = await requireSessionIdentity();
    await transitionOpportunityService(session, {
        opportunityId: String(formData.get("opportunityId")),
        expectedVersion: Number(formData.get("expectedVersion")),
        targetStage: String(formData.get("targetStage")) as OpportunityStage
    });
    revalidatePath("/dashboard");
    revalidatePath("/opportunities");
    revalidatePath("/analytics");
}
