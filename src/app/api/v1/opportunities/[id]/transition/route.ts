import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionIdentity } from "@/server/auth/session";
import { transitionOpportunityService, StaleOpportunityError } from "@/server/services/transition-opportunity";
import { OPPORTUNITY_STAGES } from "@/domain/opportunities/types";
const bodySchema = z.object({
    targetStage: z.enum(OPPORTUNITY_STAGES),
    expectedVersion: z.number().int().positive()
});
export async function POST(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const session = await getSessionIdentity();
    if (!session)
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success)
        return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    try {
        const { id } = await params;
        const result = await transitionOpportunityService(session, {
            opportunityId: id,
            expectedVersion: parsed.data.expectedVersion,
            targetStage: parsed.data.targetStage
        });
        return NextResponse.json({ data: result });
    }
    catch (error) {
        if (error instanceof StaleOpportunityError) {
            return NextResponse.json({ error: "stale_revision" }, { status: 409 });
        }
        if (error instanceof Error && error.message.includes("transition")) {
            return NextResponse.json({ error: "invalid_transition" }, { status: 422 });
        }
        throw error;
    }
}
