import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { listProposals } from "@/server/repositories/proposals";
export default async function ProposalsPage() {
    const session = await requireSessionIdentity();
    const proposals = await listProposals(session.workspaceId);
    return <>
    <PageHeader eyebrow="Commercial" title="Proposals" description="Scope, price and delivery terms remain attached to the opportunity they convert." action={session.role !== "VIEWER" ? <Link className="button button--primary" href="/proposals/new"><Plus size={16}/>New proposal</Link> : undefined}/>
    {proposals.length ? <div className="project-list">{proposals.map((proposal) => <Link href={`/proposals/${proposal.id}`} key={proposal.id}><Card className="proposal-card"><div className="project-copy"><div><span className="eyebrow">{proposal.opportunity.client?.companyName ?? "Unassigned client"}</span><h3>{proposal.opportunity.title}</h3><p>{proposal.deliveryDays} delivery days · {proposal.revisionLimit} revision{proposal.revisionLimit === 1 ? "" : "s"}</p></div><Badge tone={proposal.status === "ACCEPTED" ? "success" : proposal.status === "SENT" ? "accent" : "neutral"}>{proposal.status}</Badge></div><div className="proposal-meta"><strong>{proposal.currency === "MXN" ? mxn.format(Number(proposal.price)) : `${proposal.currency} ${proposal.price.toString()}`}</strong><span>{proposal.expiresAt ? `Expires ${shortDate.format(proposal.expiresAt)}` : "No expiry"}</span></div></Card></Link>)}</div> : <EmptyState title="No proposals yet" description="Create a proposal once an opportunity has enough scope to price confidently." action={session.role !== "VIEWER" ? <Link className="button button--primary" href="/proposals/new">Create proposal</Link> : undefined}/>} 
  </>;
}
