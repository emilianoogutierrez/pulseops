import { NextResponse } from "next/server";
import { getSessionIdentity } from "@/server/auth/session";
import { globalSearch } from "@/server/repositories/search";
export async function GET(request: Request) {
    const session = await getSessionIdentity();
    if (!session)
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const query = new URL(request.url).searchParams.get("q") ?? "";
    return NextResponse.json({ results: await globalSearch(session.workspaceId, query) });
}
