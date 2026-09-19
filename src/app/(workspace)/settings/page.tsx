import { Card } from "@/components/ui/card";
import { requireSessionIdentity } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
export default async function SettingsPage() {
    const session = await requireSessionIdentity();
    const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: session.workspaceId } });
    return <><div className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Settings</h1><p>Server-resolved workspace defaults and operating boundaries.</p></div></div><Card><div className="settings-grid"><label>Workspace<input value={workspace.name} readOnly/></label><label>Role<input value={session.role} readOnly/></label><label>Base currency<input value={workspace.baseCurrency} readOnly/></label><label>Timezone<input value={workspace.timezone} readOnly/></label><label>Primary market<input value="Mexico" readOnly/></label><label>International fallback<input value="USDT · Binance" readOnly/></label></div></Card></>;
}
