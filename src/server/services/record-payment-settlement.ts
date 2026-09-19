import { nextPaymentState } from "@/domain/payments/settlement";
import { recordSettlementInput, type RecordSettlementInput } from "@/server/contracts/settlement";
import { prisma } from "@/server/db/prisma";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
export async function recordPaymentSettlementService(context: WorkspaceContext, rawInput: RecordSettlementInput) {
    assertCanMutate(context);
    const input = recordSettlementInput.parse(rawInput);
    return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
            where: { id: input.paymentId, workspaceId: context.workspaceId }
        });
        if (!payment)
            throw new Error("Payment not found in workspace");
        if (payment.status === "FAILED" || payment.status === "REFUNDED") {
            throw new Error(`Payment in ${payment.status} cannot receive a settlement`);
        }
        const total = Number(payment.amount);
        const current = Number(payment.settledAmount);
        const nextSettled = Number((current + input.amount).toFixed(2));
        const nextStatus = nextPaymentState(total, nextSettled);
        const now = new Date();
        const settlement = await tx.paymentSettlement.create({
            data: {
                workspaceId: context.workspaceId,
                paymentId: payment.id,
                amount: input.amount,
                externalReference: input.externalReference || null,
                note: input.note || null,
                settledAt: now
            }
        });
        const updated = await tx.payment.update({
            where: { id: payment.id },
            data: {
                settledAmount: nextSettled,
                status: nextStatus,
                paidAt: nextStatus === "PAID" ? now : null,
                externalReference: input.externalReference || payment.externalReference
            }
        });
        if (payment.projectId) {
            await tx.project.update({
                where: { id: payment.projectId },
                data: { collectedAmount: { increment: input.amount } }
            });
        }
        await tx.activityEvent.create({
            data: {
                workspaceId: context.workspaceId,
                projectId: payment.projectId,
                paymentId: payment.id,
                type: "PAYMENT_SETTLEMENT_RECORDED",
                actor: "workspace-user",
                summary: `${payment.currency} ${input.amount.toFixed(2)} settlement recorded via ${payment.method}`,
                metadata: {
                    settlementId: settlement.id,
                    totalSettled: nextSettled,
                    status: nextStatus,
                    externalReference: input.externalReference ?? null
                }
            }
        });
        return { payment: updated, settlement };
    });
}
