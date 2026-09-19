"use server";
import { revalidatePath } from "next/cache";
import { requireSessionIdentity } from "@/server/auth/session";
import { recordPaymentSettlementService } from "@/server/services/record-payment-settlement";
export async function recordPaymentSettlementAction(formData: FormData) {
    const session = await requireSessionIdentity();
    const paymentId = String(formData.get("paymentId"));
    await recordPaymentSettlementService(session, {
        paymentId,
        amount: Number(formData.get("amount")),
        externalReference: String(formData.get("externalReference") || "") || undefined,
        note: String(formData.get("note") || "") || undefined
    });
    revalidatePath("/dashboard");
    revalidatePath("/payments");
    revalidatePath(`/payments/${paymentId}`);
    revalidatePath("/projects");
    revalidatePath("/clients");
    revalidatePath("/analytics");
}
