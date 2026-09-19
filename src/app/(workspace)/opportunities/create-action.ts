"use server";
import { redirect } from "next/navigation";
import { requireSessionIdentity } from "@/server/auth/session";
import { createOpportunityService } from "@/server/services/create-opportunity";
import type { CreateOpportunityInput } from "@/server/contracts/create-opportunity";
function bool(form: FormData, key: string) { return form.get(key) === "on"; }
export async function createOpportunityAction(form: FormData) {
    const session = await requireSessionIdentity();
    const opportunity = await createOpportunityService(session, { clientId: String(form.get("clientId") || ""), title: String(form.get("title") || ""), description: String(form.get("description") || ""), source: String(form.get("source") || ""), serviceType: String(form.get("serviceType") || "OTHER") as CreateOpportunityInput["serviceType"], country: String(form.get("country") || "MX"), currency: "MXN", estimatedValue: Number(form.get("estimatedValue") || 0), speiCompatible: bool(form, "speiCompatible"), mercadoPagoCompatible: bool(form, "mercadoPagoCompatible"), usdtCompatible: bool(form, "usdtCompatible"), asyncFriendly: bool(form, "asyncFriendly"), spokenEnglishRequired: bool(form, "spokenEnglishRequired"), meetingLoad: String(form.get("meetingLoad") || "LOW") as CreateOpportunityInput["meetingLoad"], technicalFit: Number(form.get("technicalFit") || 70), paymentFit: Number(form.get("paymentFit") || 70), urgencyFit: Number(form.get("urgencyFit") || 70), asyncFit: Number(form.get("asyncFit") || 70), aiLeverage: Number(form.get("aiLeverage") || 70), clientQuality: Number(form.get("clientQuality") || 70), deliveryRisk: Number(form.get("deliveryRisk") || 30) });
    redirect(`/opportunities/${opportunity.id}`);
}
