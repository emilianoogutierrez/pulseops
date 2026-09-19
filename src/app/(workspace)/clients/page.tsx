import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { mxn } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { listClients } from "@/server/repositories/clients";
export default async function ClientsPage() { const s = await requireSessionIdentity(); const clients = await listClients(s.workspaceId); return <><PageHeader eyebrow="Relationships" title="Clients" description="Revenue history, payment compatibility and repeat potential in one place."/><div className="client-grid">{clients.map(c => <Link href={`/clients/${c.id}`} key={c.id} className="client-link"><Card className="client-card"><div className="client-card-top"><div className="company-avatar">{c.name.slice(0, 2).toUpperCase()}</div><Badge tone="accent">{c.method}</Badge></div><h3>{c.name}</h3><p>{c.contact}</p><div className="client-stats"><div><span>Collected</span><strong>{mxn.format(c.lifetime)}</strong></div><div><span>Projects</span><strong>{c.projects}</strong></div></div><span className="subtle">{c.opportunities} opportunities · {c.source}</span></Card></Link>)}</div></>; }
