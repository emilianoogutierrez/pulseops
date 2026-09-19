"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSessionIdentity } from "@/server/auth/session";
import { acceptProposalService } from "@/server/services/accept-proposal";
import { createProposalService } from "@/server/services/create-proposal";
import { sendProposalService } from "@/server/services/send-proposal";
function listFromText(value: FormDataEntryValue | null): string[] {
    return String(value ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
}
export async function createProposalAction(formData: FormData) {
    const session = await requireSessionIdentity();
    const proposal = await createProposalService(session, {
        opportunityId: String(formData.get("opportunityId")),
        price: Number(formData.get("price")),
        currency: String(formData.get("currency") || "MXN"),
        deliveryDays: Number(formData.get("deliveryDays")),
        revisionLimit: Number(formData.get("revisionLimit")),
        expiresAt: formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : undefined,
        scope: {
            summary: String(formData.get("summary")),
            deliverables: listFromText(formData.get("deliverables")),
            acceptanceCriteria: listFromText(formData.get("acceptanceCriteria")),
            exclusions: listFromText(formData.get("exclusions"))
        }
    });
    revalidatePath("/proposals");
    revalidatePath("/opportunities");
    redirect(`/proposals/${proposal.id}`);
}
export async function sendProposalAction(formData: FormData) {
    const session = await requireSessionIdentity();
    const proposalId = String(formData.get("proposalId"));
    await sendProposalService(session, { proposalId });
    revalidatePath("/proposals");
    revalidatePath(`/proposals/${proposalId}`);
}
export async function acceptProposalAction(formData: FormData) {
    const session = await requireSessionIdentity();
    const result = await acceptProposalService(session, {
        proposalId: String(formData.get("proposalId")),
        expectedOpportunityVersion: Number(formData.get("expectedOpportunityVersion"))
    });
    revalidatePath("/proposals");
    revalidatePath("/projects");
    revalidatePath("/opportunities");
    revalidatePath("/dashboard");
    redirect(`/projects/${result.project.id}`);
}
