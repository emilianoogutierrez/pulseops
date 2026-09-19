import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { getClient } from "@/server/repositories/clients";
export default async function ClientDetail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { const { id } = await params; const s = await requireSessionIdentity(); const c = await getClient(s.workspaceId, id); if (!c)
    notFound(); const collected = c.payments.reduce((a, p) => a + Number(p.settledAmount), 0); return <><PageHeader eyebrow="Client" title={c.companyName} description={`${c.contactName} · relationship overview`} action={<Link className="button button--secondary" href="/clients"><ArrowLeft size={15}/>Clients</Link>}/><div className="detail-grid"><main className="detail-main"><section className="surface"><div className="client-profile"><div className="company-avatar company-avatar--large">{c.companyName.slice(0, 2).toUpperCase()}</div><div><h2>{c.companyName}</h2><p>{c.contactName}</p></div><Badge tone="accent">{c.preferredPaymentMethod ?? "Payment TBD"}</Badge></div><div className="fact-grid"><div><span>Collected</span><strong>{mxn.format(collected)}</strong></div><div><span>Projects</span><strong>{c.projects.length}</strong></div><div><span>Opportunities</span><strong>{c.opportunities.length}</strong></div><div><span>Source</span><strong>{c.acquisitionSource ?? "Unknown"}</strong></div></div></section><section className="surface"><div className="section-title"><div><span className="eyebrow">Opportunities</span><h2>Commercial history</h2></div></div><div className="compact-list">{c.opportunities.map(o => <Link href={`/opportunities/${o.id}`} key={o.id}><div><strong>{o.title}</strong><span>{o.stage} · score {o.qualificationScore}</span></div><b>{mxn.format(Number(o.estimatedValue ?? 0))}</b></Link>)}</div></section></main><aside className="detail-side"><section className="surface"><span className="eyebrow">Contact</span><div className="contact-lines">{c.email ? <a href={`mailto:${c.email}`}><Mail size={15}/>{c.email}</a> : null}<span><MapPin size={15}/>{c.country} · {c.currency}</span></div></section><section className="surface"><span className="eyebrow">Payments</span><div className="compact-list compact-list--plain">{c.payments.slice(0, 6).map(p => <div key={p.id}><div><strong>{p.method.replaceAll("_", " ")}</strong><span>{p.status} · {p.paidAt ? shortDate.format(p.paidAt) : "open"}</span></div><b>{mxn.format(Number(p.amount))}</b></div>)}</div></section></aside></div></>; }
