import { createPaymentInput, type CreatePaymentInput } from "@/server/contracts/create-payment";
import { validatePaymentTarget } from "@/domain/payments/targets";
import { prisma } from "@/server/db/prisma";
import { assertCanMutate, type WorkspaceContext } from "@/server/workspace/context";
export async function createPaymentService(context: WorkspaceContext, raw: CreatePaymentInput) { assertCanMutate(context); const input = createPaymentInput.parse(raw); validatePaymentTarget(input.method, input.paymentUrl); return prisma.$transaction(async (tx) => { const client = await tx.client.findFirst({ where: { id: input.clientId, workspaceId: context.workspaceId } }); if (!client)
    throw new Error("Client not found in workspace"); if (input.projectId) {
    const project = await tx.project.findFirst({ where: { id: input.projectId, workspaceId: context.workspaceId, clientId: input.clientId } });
    if (!project)
        throw new Error("Project does not belong to client/workspace");
} const payment = await tx.payment.create({ data: { workspaceId: context.workspaceId, ...input, paymentUrl: input.paymentUrl || null, status: "PENDING" } }); await tx.activityEvent.create({ data: { workspaceId: context.workspaceId, paymentId: payment.id, projectId: input.projectId || null, type: "PAYMENT_REQUEST_CREATED", actor: "workspace-user", summary: `Created ${input.method} payment request`, metadata: { amount: input.amount, currency: input.currency } } }); return payment; }); }
