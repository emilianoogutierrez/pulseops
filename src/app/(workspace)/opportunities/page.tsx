import Link from "next/link";
import { Filter, Plus, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OpportunityTable } from "@/components/opportunities/opportunity-table";
import { PageHeader } from "@/components/ui/page-header";
import { requireSessionIdentity } from "@/server/auth/session";
import { listOpportunities, type OpportunityFilters } from "@/server/repositories/opportunities";
export default async function OpportunitiesPage({ searchParams }: {
    searchParams: Promise<Record<string, string | undefined>>;
}) {
    const params = await searchParams;
    const session = await requireSessionIdentity();
    const opportunities = await listOpportunities(session.workspaceId, { q: params.q, payment: params.payment as OpportunityFilters["payment"], minScore: params.score ? Number(params.score) : undefined, stage: params.stage });
    const rows = opportunities.map(o => ({ id: o.id, title: o.title, company: o.client?.companyName ?? "Unassigned client", stage: o.stage, source: o.source, value: Number(o.estimatedValue ?? 0), score: o.qualificationScore, method: [o.speiCompatible ? "SPEI" : null, o.mercadoPagoCompatible ? "MP" : null, o.usdtCompatible ? "USDT" : null].filter(Boolean).join(" / ") || "Unconfirmed", nextActionAt: o.nextActionAt, version: o.version }));
    const filtered = Boolean(params.q || params.payment || params.score || params.stage);
    return <><PageHeader eyebrow="Pipeline" title="Opportunities" description="Rank work by payment fit, technical fit and expected value—not by inbox noise." action={session.role !== "VIEWER" ? <Link className="button button--primary" href="/opportunities/new"><Plus size={16}/>New opportunity</Link> : undefined}/><form className="filter-toolbar"><label className="filter-search"><Search size={15}/><input name="q" defaultValue={params.q} placeholder="Search opportunity or client"/></label><select name="stage" defaultValue={params.stage ?? ""}><option value="">All stages</option><option>QUALIFIED</option><option>CONTACTED</option><option>REPLIED</option><option>SCOPING</option><option>QUOTED</option><option>WON</option><option>DELIVERING</option></select><select name="payment" defaultValue={params.payment ?? ""}><option value="">Any payment</option><option value="SPEI">SPEI</option><option value="MERCADO_PAGO">Mercado Pago</option><option value="USDT_BINANCE">USDT · Binance</option></select><select name="score" defaultValue={params.score ?? ""}><option value="">Any score</option><option value="90">90+</option><option value="80">80+</option><option value="70">70+</option></select><button className="button button--secondary" type="submit"><Filter size={15}/>Apply</button>{filtered ? <Link className="button button--ghost" href="/opportunities"><X size={15}/>Clear</Link> : null}</form><div className="table-context"><span>{rows.length} opportunities</span><span>Sorted by qualification score</span></div><Card className="table-card"><OpportunityTable rows={rows} mutable={session.role !== "VIEWER"}/></Card></>;
}
