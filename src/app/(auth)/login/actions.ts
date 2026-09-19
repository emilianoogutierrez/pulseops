"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
const loginSchema = z.object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(200)
});
export type LoginState = {
    error?: string;
};
export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password")
    });
    if (!parsed.success)
        return { error: "Enter a valid email and password." };
    const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
        include: { memberships: { orderBy: { createdAt: "asc" }, take: 1 } }
    });
    if (!user || user.memberships.length === 0)
        return { error: "Invalid credentials." };
    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid)
        return { error: "Invalid credentials." };
    const membership = user.memberships[0];
    await createSession(user.id, membership.workspaceId);
    redirect("/dashboard");
}
