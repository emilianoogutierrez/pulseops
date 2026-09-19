import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { requireSessionIdentity } from "@/server/auth/session";
import { listProposalCandidates } from "@/server/repositories/proposals";
import { createProposalAction } from "../actions";
export default async function NewProposalPage({ searchParams }: {
    searchParams: Promise<{
        opportunity?: string;
    }>;
}) {
    const session = await requireSessionIdentity();
    if (session.role === "VIEWER")
        return <div className="notice-panel">Viewer access cannot create proposals.</div>;
    const params = await searchParams;
    const candidates = await listProposalCandidates(session.workspaceId);
    const selected = candidates.find((item) => item.id === params.opportunity)?.id ?? "";
    return <>
    <PageHeader eyebrow="Commercial" title="New proposal" description="Turn scoped work into explicit deliverables, acceptance criteria, price and delivery terms." action={<Link className="button button--secondary" href="/proposals"><ArrowLeft size={15}/>Proposals</Link>}/>
    <form action={createProposalAction} className="editor-layout">
      <section className="editor-main surface">
        <div className="section-title"><div><span className="eyebrow">Scope</span><h2>Commercial terms</h2></div></div>
        <div className="form-grid">
          <label className="field field--wide"><span>Opportunity</span><select name="opportunityId" required defaultValue={selected}><option value="">Select scoped opportunity</option>{candidates.map((item) => <option key={item.id} value={item.id}>{item.client?.companyName} · {item.title}</option>)}</select></label>
          <label className="field"><span>Price</span><input name="price" type="number" min="1" required placeholder="18000"/></label>
          <label className="field"><span>Currency</span><input name="currency" defaultValue="MXN" maxLength={3}/></label>
          <label className="field"><span>Delivery days</span><input name="deliveryDays" type="number" min="1" max="365" defaultValue="10" required/></label>
          <label className="field"><span>Revision limit</span><input name="revisionLimit" type="number" min="0" max="12" defaultValue="2" required/></label>
          <label className="field"><span>Expires</span><input name="expiresAt" type="date"/></label>
          <label className="field field--wide"><span>Scope summary</span><textarea name="summary" rows={4} required placeholder="Rebuild the operations dashboard with role-aware views and a deployment-ready handoff."/></label>
          <label className="field field--wide"><span>Deliverables · one per line</span><textarea name="deliverables" rows={5} required placeholder={'Responsive dashboard\nRole-aware data views\nDeployment notes'}/></label>
          <label className="field field--wide"><span>Acceptance criteria · one per line</span><textarea name="acceptanceCriteria" rows={5} required placeholder={'Dashboard works at mobile and desktop breakpoints\nViewer role cannot mutate records\nProduction build passes'}/></label>
          <label className="field field--wide"><span>Exclusions · one per line</span><textarea name="exclusions" rows={3} placeholder={'Third-party licensing fees\nOngoing content entry'}/></label>
        </div>
      </section>
      <aside className="editor-side surface">
        <div className="editor-side__head"><FileText size={18}/><div><strong>Contract-shaped scope</strong><span>Make delivery review objective.</span></div></div>
        <div className="quality-note"><ShieldCheck size={17}/><p>PulseOps stores deliverables and acceptance criteria separately so a later QA pass can compare what was promised against what is ready.</p></div>
        <button className="button button--primary button--full" type="submit">Create draft</button>
      </aside>
    </form>
  </>;
}
