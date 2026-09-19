"use server";
import { redirect } from "next/navigation";
import { requireSessionIdentity } from "@/server/auth/session";
import { createPaymentService } from "@/server/services/create-payment";
import type { CreatePaymentInput } from "@/server/contracts/create-payment";
export async function createPaymentAction(form: FormData) { const s = await requireSessionIdentity(); await createPaymentService(s, { clientId: String(form.get("clientId") || ""), projectId: String(form.get("projectId") || "") || undefined, method: String(form.get("method") || "SPEI") as CreatePaymentInput["method"], amount: Number(form.get("amount") || 0), currency: String(form.get("currency") || "MXN"), externalReference: String(form.get("externalReference") || "") || undefined, paymentUrl: String(form.get("paymentUrl") || ""), dueAt: form.get("dueAt") ? new Date(String(form.get("dueAt"))) : undefined }); redirect("/payments"); }
