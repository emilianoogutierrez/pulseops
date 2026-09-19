import { AppShell } from "@/components/shell/app-shell";
import { requireSessionIdentity } from "@/server/auth/session";
export default async function WorkspaceLayout({ children }: {
    children: React.ReactNode;
}) {
    const session = await requireSessionIdentity();
    return <AppShell identity={session}>{children}</AppShell>;
}
