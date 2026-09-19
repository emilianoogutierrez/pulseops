import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { getProposal } from "@/server/repositories/proposals";
import type { ProposalScope } from "@/server/contracts/proposal";
import { acceptProposalAction, sendProposalAction } from "../actions";
export default async function ProposalDetail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const session = await requireSessionIdentity();
    const proposal = await getProposal(session.workspaceId, id);
    if (!proposal)
        notFound();
    const scope = proposal.scope as ProposalScope;
    return <>
    <PageHeader eyebrow="Proposal" title={proposal.opportunity.title} description={`${proposal.opportunity.client?.companyName ?? "Unassigned"} · commercial scope`} action={<Link className="button button--secondary" href="/proposals"><ArrowLeft size={15}/>Proposals</Link>}/>
    <div className="detail-grid">
      <main className="detail-main">
        <section className="surface proposal-document">
          <div className="proposal-document__head">
            <div><Badge tone={proposal.status === "ACCEPTED" ? "success" : proposal.status === "SENT" ? "accent" : "neutral"}>{proposal.status}</Badge><h2>{scope.summary}</h2></div>
            <div className="proposal-price"><strong>{proposal.currency === "MXN" ? mxn.format(Number(proposal.price)) : `${proposal.currency} ${proposal.price.toString()}`}</strong><span>{proposal.deliveryDays} delivery days · {proposal.revisionLimit} revisions</span></div>
          </div>
          <div className="proposal-columns">
            <div><span className="eyebrow">Deliverables</span><ul className="proposal-list">{scope.deliverables.map((item) => <li key={item}><CheckCircle2 size={15}/>{item}</li>)}</ul></div>
            <div><span className="eyebrow">Acceptance criteria</span><ul className="proposal-list">{scope.acceptanceCriteria.map((item) => <li key={item}><CheckCircle2 size={15}/>{item}</li>)}</ul></div>
          </div>
          {scope.exclusions.length ? <div className="proposal-exclusions"><span className="eyebrow">Explicit exclusions</span><ul>{scope.exclusions.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
        </section>
      </main>
      <aside className="detail-side">
        <section className="surface"><span className="eyebrow">Lifecycle</span><div className="proposal-lifecycle"><div><Clock3 size={15}/><span>Created</span><strong>{shortDate.format(proposal.createdAt)}</strong></div><div><Send size={15}/><span>Sent</span><strong>{proposal.sentAt ? shortDate.format(proposal.sentAt) : "Draft"}</strong></div><div><FileText size={15}/><span>Expires</span><strong>{proposal.expiresAt ? shortDate.format(proposal.expiresAt) : "No expiry"}</strong></div></div></section>
        {session.role !== "VIEWER" && proposal.status === "DRAFT" ? <form action={sendProposalAction} className="surface action-panel"><input type="hidden" name="proposalId" value={proposal.id}/><span className="eyebrow">Ready to send</span><p>Mark the proposal as sent after it leaves PulseOps through your chosen communication channel.</p><button className="button button--primary button--full" type="submit">Mark as sent</button></form> : null}
        {session.role !== "VIEWER" && proposal.status === "SENT" ? <form action={acceptProposalAction} className="surface action-panel"><input type="hidden" name="proposalId" value={proposal.id}/><input type="hidden" name="expectedOpportunityVersion" value={proposal.opportunity.version}/><span className="eyebrow">Client accepted</span><p>Accepting creates the delivery project and preserves this scope in the same transaction.</p><button className="button button--primary button--full" type="submit">Accept & create project</button></form> : null}
        {proposal.opportunity.project ? <Link className="surface linked-object" href={`/projects/${proposal.opportunity.project.id}`}><span className="eyebrow">Delivery</span><strong>{proposal.opportunity.project.name}</strong><span>Open project →</span></Link> : null}
      </aside>
    </div>
  </>;
}
