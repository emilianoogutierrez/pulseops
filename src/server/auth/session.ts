import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import type { WorkspaceContext } from "@/server/workspace/context";
const DEFAULT_COOKIE = "pulseops_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
function cookieName(): string {
    return process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE;
}
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
export type SessionIdentity = WorkspaceContext & {
    userId: string;
    userName: string;
    userEmail: string;
    workspaceName: string;
};
export async function createSession(userId: string, workspaceId: string): Promise<void> {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.authSession.create({ data: { tokenHash, userId, workspaceId, expiresAt } });
    const jar = await cookies();
    jar.set(cookieName(), token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt
    });
}
export async function destroySession(): Promise<void> {
    const jar = await cookies();
    const token = jar.get(cookieName())?.value;
    if (token) {
        await prisma.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    jar.delete(cookieName());
}
export async function getSessionIdentity(): Promise<SessionIdentity | null> {
    const jar = await cookies();
    const token = jar.get(cookieName())?.value;
    if (!token)
        return null;
    const session = await prisma.authSession.findUnique({
        where: { tokenHash: hashToken(token) },
        include: {
            user: true,
            workspace: true
        }
    });
    if (!session || session.expiresAt <= new Date()) {
        if (session)
            await prisma.authSession.delete({ where: { tokenHash: session.tokenHash } });
        return null;
    }
    const membership = await prisma.membership.findUnique({
        where: { workspaceId_userId: { workspaceId: session.workspaceId, userId: session.userId } }
    });
    if (!membership)
        return null;
    return {
        userId: session.userId,
        userName: session.user.name,
        userEmail: session.user.email,
        workspaceId: session.workspaceId,
        workspaceName: session.workspace.name,
        role: membership.role
    };
}
export async function requireSessionIdentity(): Promise<SessionIdentity> {
    const session = await getSessionIdentity();
    if (!session)
        redirect("/login");
    return session;
}
