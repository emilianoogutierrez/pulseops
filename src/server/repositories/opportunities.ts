import type { Prisma } from "@/generated/prisma/client";
import { OpportunityStage } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/prisma";
export type OpportunityFilters = {
    q?: string;
    source?: string;
    payment?: "SPEI" | "MERCADO_PAGO" | "USDT_BINANCE";
    minScore?: number;
    stage?: string;
};
export async function listOpportunities(workspaceId: string, filters: OpportunityFilters = {}) {
    const where: Prisma.OpportunityWhereInput = { workspaceId };
    if (filters.q)
        where.OR = [{ title: { contains: filters.q, mode: "insensitive" } }, { description: { contains: filters.q, mode: "insensitive" } }, { client: { companyName: { contains: filters.q, mode: "insensitive" } } }];
    if (filters.source)
        where.source = filters.source;
    if (filters.stage)
        where.stage = filters.stage as OpportunityStage;
    if (filters.minScore)
        where.qualificationScore = { gte: filters.minScore };
    if (filters.payment === "SPEI")
        where.speiCompatible = true;
    if (filters.payment === "MERCADO_PAGO")
        where.mercadoPagoCompatible = true;
    if (filters.payment === "USDT_BINANCE")
        where.usdtCompatible = true;
    return prisma.opportunity.findMany({ where, include: { client: true }, orderBy: [{ qualificationScore: "desc" }, { updatedAt: "desc" }] });
}
export async function getOpportunity(workspaceId: string, id: string) { return prisma.opportunity.findFirst({ where: { id, workspaceId }, include: { client: true, proposal: true, project: { include: { payments: true } }, activities: { orderBy: { createdAt: "desc" }, take: 20 } } }); }
export async function updateOpportunityStage(params: {
    workspaceId: string;
    opportunityId: string;
    expectedVersion: number;
    stage: OpportunityStage;
}) { const result = await prisma.opportunity.updateMany({ where: { id: params.opportunityId, workspaceId: params.workspaceId, version: params.expectedVersion }, data: { stage: params.stage, version: { increment: 1 } } }); if (result.count !== 1)
    throw new Error("Opportunity was modified by another operation or is outside the workspace"); }
