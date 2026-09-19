import { prisma } from "@/server/db/prisma";
export async function getAnalytics(workspaceId: string) {
    const [opportunities, payments, clients] = await Promise.all([
        prisma.opportunity.findMany({ where: { workspaceId } }),
        prisma.payment.findMany({ where: { workspaceId } }),
        prisma.client.findMany({ where: { workspaceId }, include: { projects: true, payments: true } })
    ]);
    const sources = new Map<string, {
        count: number;
        pipeline: number;
        wins: number;
    }>();
    const services = new Map<string, {
        count: number;
        pipeline: number;
        wins: number;
    }>();
    for (const opportunity of opportunities) {
        const win = ["WON", "DELIVERING", "DELIVERED", "PAID"].includes(opportunity.stage) ? 1 : 0;
        const value = Number(opportunity.estimatedValue ?? 0);
        for (const [map, key] of [[sources, opportunity.source], [services, opportunity.serviceType]] as const) {
            const row = map.get(key) ?? { count: 0, pipeline: 0, wins: 0 };
            row.count += 1;
            row.pipeline += value;
            row.wins += win;
            map.set(key, row);
        }
    }
    const methods = new Map<string, number>();
    for (const payment of payments) {
        const settled = Number(payment.settledAmount);
        if (settled <= 0)
            continue;
        methods.set(payment.method, (methods.get(payment.method) ?? 0) + settled);
    }
    const repeats = clients.filter((client) => {
        const settledPayments = client.payments.filter((payment) => Number(payment.settledAmount) > 0);
        return client.projects.length > 1 || settledPayments.length > 1;
    }).length;
    const toRows = (map: Map<string, {
        count: number;
        pipeline: number;
        wins: number;
    }>) => Array.from(map, ([label, row]) => ({
        label,
        opportunities: row.count,
        pipeline: row.pipeline,
        closeRate: row.count ? (row.wins / row.count) * 100 : 0
    })).sort((a, b) => b.pipeline - a.pipeline);
    const wins = opportunities.filter((opportunity) => ["WON", "DELIVERING", "DELIVERED", "PAID"].includes(opportunity.stage)).length;
    return {
        summary: {
            opportunities: opportunities.length,
            winRate: opportunities.length ? (wins / opportunities.length) * 100 : 0,
            averageScore: opportunities.length ? opportunities.reduce((sum, opportunity) => sum + opportunity.qualificationScore, 0) / opportunities.length : 0,
            averageAiLeverage: opportunities.length ? opportunities.reduce((sum, opportunity) => sum + opportunity.aiLeverage, 0) / opportunities.length : 0,
            collected: payments.reduce((sum, payment) => sum + Number(payment.settledAmount), 0),
            repeatRate: clients.length ? (repeats / clients.length) * 100 : 0
        },
        sources: toRows(sources),
        services: toRows(services),
        methods: Array.from(methods, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
    };
}
