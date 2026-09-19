import { prisma } from "@/server/db/prisma";
const activeStages = ["DISCOVERED", "QUALIFIED", "CONTACTED", "REPLIED", "SCOPING", "QUOTED"] as const;
export async function getDashboardData(workspaceId: string) {
    const [opportunities, payments, activities] = await Promise.all([
        prisma.opportunity.findMany({
            where: { workspaceId },
            include: { client: true },
            orderBy: [{ qualificationScore: "desc" }, { updatedAt: "desc" }]
        }),
        prisma.payment.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "asc" }
        }),
        prisma.activityEvent.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
            take: 8
        })
    ]);
    const qualifiedPipeline = opportunities
        .filter((opportunity) => activeStages.includes(opportunity.stage as (typeof activeStages)[number]))
        .reduce((sum, opportunity) => sum + Number(opportunity.estimatedValue ?? 0), 0);
    const wonThisMonth = opportunities
        .filter((opportunity) => ["WON", "DELIVERING", "DELIVERED", "PAID"].includes(opportunity.stage))
        .reduce((sum, opportunity) => sum + Number(opportunity.estimatedValue ?? 0), 0);
    const collected = payments.reduce((sum, payment) => sum + Number(payment.settledAmount), 0);
    const now = new Date();
    const followUpsDue = opportunities.filter((opportunity) => opportunity.nextActionAt && opportunity.nextActionAt <= now).length;
    const highPriority = opportunities.filter((opportunity) => opportunity.nextActionAt && opportunity.nextActionAt <= now && opportunity.qualificationScore >= 80).length;
    const monthBuckets = new Map<string, number>();
    for (const payment of payments) {
        if (Number(payment.settledAmount) <= 0)
            continue;
        const date = payment.paidAt ?? payment.updatedAt;
        const label = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
        monthBuckets.set(label, (monthBuckets.get(label) ?? 0) + Number(payment.settledAmount));
    }
    const priority = opportunities.slice(0, 6).map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.client?.companyName ?? "Unassigned client",
        stage: opportunity.stage,
        source: opportunity.source,
        value: Number(opportunity.estimatedValue ?? 0),
        score: opportunity.qualificationScore,
        method: [
            opportunity.speiCompatible ? "SPEI" : null,
            opportunity.mercadoPagoCompatible ? "MP" : null,
            opportunity.usdtCompatible ? "USDT" : null
        ].filter(Boolean).join(" / ") || "Unconfirmed",
        nextActionAt: opportunity.nextActionAt,
        version: opportunity.version
    }));
    return {
        metrics: { qualifiedPipeline, wonThisMonth, collected, followUpsDue, highPriority },
        revenueSeries: Array.from(monthBuckets.entries()).map(([label, revenue]) => ({ label, revenue })),
        activities,
        priority
    };
}
