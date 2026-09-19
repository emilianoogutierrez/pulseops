import { prisma } from "@/server/db/prisma";
export async function listPayments(workspaceId: string) {
    const [capabilities, payments] = await Promise.all([
        prisma.workspacePaymentCapability.findMany({
            where: { workspaceId, enabled: true },
            orderBy: { method: "asc" }
        }),
        prisma.payment.findMany({
            where: { workspaceId },
            include: { client: true, project: true },
            orderBy: [{ status: "asc" }, { createdAt: "desc" }]
        })
    ]);
    return {
        capabilities,
        payments: payments.map((payment) => ({
            id: payment.id,
            client: payment.client.companyName,
            project: payment.project?.name ?? "Unlinked",
            method: payment.method,
            status: payment.status,
            amount: Number(payment.amount),
            settledAmount: Number(payment.settledAmount),
            paidAt: payment.paidAt,
            dueAt: payment.dueAt
        }))
    };
}
export async function getPayment(workspaceId: string, id: string) {
    return prisma.payment.findFirst({
        where: { id, workspaceId },
        include: {
            client: true,
            project: true,
            settlements: { orderBy: { settledAt: "desc" } },
            activities: { orderBy: { createdAt: "desc" } }
        }
    });
}
