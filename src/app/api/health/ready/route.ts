import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
export async function GET() {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return NextResponse.json({ status: "ready", database: "ok", service: "pulseops" });
    }
    catch {
        return NextResponse.json({ status: "not_ready", database: "unavailable", service: "pulseops" }, { status: 503 });
    }
}
