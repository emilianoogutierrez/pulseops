import { NextResponse } from "next/server";
import { getSessionIdentity } from "@/server/auth/session";
import { listOpportunities } from "@/server/repositories/opportunities";
export async function GET() {
    const session = await getSessionIdentity();
    if (!session)
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const opportunities = await listOpportunities(session.workspaceId);
    return NextResponse.json({
        data: opportunities.map((opportunity) => ({
            id: opportunity.id,
            title: opportunity.title,
            stage: opportunity.stage,
            source: opportunity.source,
            serviceType: opportunity.serviceType,
            qualificationScore: opportunity.qualificationScore,
            estimatedValue: opportunity.estimatedValue?.toString() ?? null,
            version: opportunity.version,
            client: opportunity.client ? { id: opportunity.client.id, companyName: opportunity.client.companyName } : null
        }))
    });
}
