import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CreditCard, ExternalLink, Gauge, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { getOpportunity } from "@/server/repositories/opportunities";
export default async function OpportunityDetail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const session = await requireSessionIdentity();
    const o = await getOpportunity(session.workspaceId, id);
    if (!o)
        notFound();
    const methods = [o.speiCompatible ? "SPEI" : null, o.mercadoPagoCompatible ? "Mercado Pago" : null, o.usdtCompatible ? "USDT · Binance" : null].filter(Boolean);
    return <><PageHeader eyebrow="Opportunity" title={o.title} description={`${o.client?.companyName ?? "Unassigned"} · ${o.source}`} action={<Link className="button button--secondary" href="/opportunities"><ArrowLeft size={15}/>Pipeline</Link>}/><div className="detail-grid"><main className="detail-main"><section className="surface detail-hero"><div className="detail-hero__top"><Badge tone="accent">{o.stage}</Badge><span className="score-badge"><Gauge size={15}/>{o.qualificationScore}/100</span></div><div className="detail-value"><strong>{mxn.format(Number(o.estimatedValue ?? 0))}</strong><span>estimated value · {o.probability}% probability</span></div><p>{o.description || "No additional context recorded."}</p><div className="fact-grid"><div><span>Service</span><strong>{o.serviceType.replaceAll("_", " ")}</strong></div><div><span>Meeting load</span><strong>{o.meetingLoad}</strong></div><div><span>Country</span><strong>{o.country}</strong></div><div><span>Next action</span><strong>{o.nextActionAt ? shortDate.format(o.nextActionAt) : "Not scheduled"}</strong></div></div></section><section className="surface"><div className="section-title"><div><span className="eyebrow">Timeline</span><h2>Commercial history</h2></div></div><div className="timeline">{o.activities.map(a => <div className="timeline-row" key={a.id}><span className="timeline-dot"/><div><strong>{a.summary}</strong><span>{a.actor || "System"} · {shortDate.format(a.createdAt)}</span></div></div>)}</div></section></main><aside className="detail-side"><section className="surface"><span className="eyebrow">Payment fit</span><h3>Settlement options</h3><div className="method-list">{methods.map(m => <span key={String(m)}><CreditCard size={15}/>{m}</span>)}</div></section><section className="surface"><span className="eyebrow">Client</span><h3>{o.client?.companyName ?? "Unassigned"}</h3><p>{o.client?.contactName}</p>{o.client?.email ? <a className="detail-link" href={`mailto:${o.client.email}`}><Mail size={14}/>{o.client.email}<ExternalLink size={12}/></a> : null}{o.client ? <Link className="detail-link" href={`/clients/${o.client.id}`}><BriefcaseBusiness size={14}/>Open client<ExternalLink size={12}/></Link> : null}</section><section className="surface score-panel"><span className="eyebrow">Qualification model</span>{[["Technical", o.technicalFit], ["Payment", o.paymentFit], ["Urgency", o.urgencyFit], ["Async", o.asyncFit], ["AI leverage", o.aiLeverage], ["Client", o.clientQuality], ["Delivery risk", 100 - o.deliveryRisk]].map(([label, value]) => <div className="score-row" key={String(label)}><span>{label}</span><div><i style={{ width: `${value}%` }}/></div><strong>{value}</strong></div>)}</section></aside></div></>;
}
