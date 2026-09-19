import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { allowedProjectTransitions, type ProjectState } from "@/domain/projects/lifecycle";
import { requireSessionIdentity } from "@/server/auth/session";
import { getProject } from "@/server/repositories/projects";
import { transitionDeliverableAction, transitionProjectAction } from "../actions";
const deliverableNext: Record<string, string | undefined> = {
    PLANNED: "IN_PROGRESS",
    IN_PROGRESS: "REVIEW",
    REVIEW: "ACCEPTED"
};
export default async function ProjectDetail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const session = await requireSessionIdentity();
    const project = await getProject(session.workspaceId, id);
    if (!project)
        notFound();
    const ratio = Number(project.quotedAmount)
        ? Math.min(100, Math.round(Number(project.collectedAmount) / Number(project.quotedAmount) * 100))
        : 0;
    const transitions = allowedProjectTransitions(project.status as ProjectState);
    return <>
    <PageHeader eyebrow="Delivery" title={project.name} description={`${project.client.companyName} · accepted commercial work`} action={<Link className="button button--secondary" href="/projects"><ArrowLeft size={15}/>Projects</Link>}/>
    <div className="detail-grid">
      <main className="detail-main">
        <section className="surface">
          <div className="project-hero"><div><Badge tone={project.status === "BLOCKED" ? "warning" : project.status === "DELIVERED" || project.status === "CLOSED" ? "success" : "accent"}>{project.status}</Badge><h2>{mxn.format(Number(project.quotedAmount))}</h2><p>{mxn.format(Number(project.collectedAmount))} collected · {ratio}% settled</p></div><div className="collection-ring" style={{ "--progress": `${ratio}%` } as CSSProperties}><strong>{ratio}%</strong><span>paid</span></div></div>
          <div className="fact-grid"><div><span>Client</span><strong>{project.client.companyName}</strong></div><div><span>Started</span><strong>{project.startedAt ? shortDate.format(project.startedAt) : "Not started"}</strong></div><div><span>Due</span><strong>{project.dueAt ? shortDate.format(project.dueAt) : "No date"}</strong></div><div><span>Source</span><strong>{project.opportunity.source}</strong></div></div>
          {session.role !== "VIEWER" && transitions.length ? <div className="project-actions">{transitions.map((target) => <form action={transitionProjectAction} key={target}><input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="expectedVersion" value={project.version}/><input type="hidden" name="targetStatus" value={target}/><button className="button button--secondary" type="submit">Move to {target.toLowerCase()}</button></form>)}</div> : null}
        </section>
        <section className="surface">
          <div className="section-title"><div><span className="eyebrow">Delivery contract</span><h2>Deliverables</h2></div><span className="subtle">{project.deliverables.filter((item) => item.status === "ACCEPTED").length}/{project.deliverables.length} accepted</span></div>
          <div className="deliverable-list">{project.deliverables.length ? project.deliverables.map((item) => { const next = deliverableNext[item.status]; return <div className="deliverable-row" key={item.id}><div className={`deliverable-icon${item.status === "ACCEPTED" ? " deliverable-icon--done" : ""}`}>{item.status === "ACCEPTED" ? <CheckCircle2 size={16}/> : <Circle size={16}/>}</div><div><strong>{item.title}</strong><span>{item.description || item.status.replaceAll("_", " ")}</span></div><Badge tone={item.status === "ACCEPTED" ? "success" : item.status === "REVIEW" ? "warning" : "neutral"}>{item.status}</Badge>{session.role !== "VIEWER" && next ? <form action={transitionDeliverableAction}><input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="deliverableId" value={item.id}/><input type="hidden" name="targetStatus" value={next}/><button className="table-action" type="submit">{next === "ACCEPTED" ? "Accept" : `Move to ${next.toLowerCase().replaceAll("_", " ")}`}</button></form> : null}</div>; }) : <p className="subtle">No deliverables were attached to this project.</p>}</div>
        </section>
        <section className="surface"><div className="section-title"><div><span className="eyebrow">Activity</span><h2>Delivery timeline</h2></div></div><div className="timeline">{project.activities.length ? project.activities.map((activity) => <div className="timeline-row" key={activity.id}><span className="timeline-dot"/><div><strong>{activity.summary}</strong><span>{activity.actor || "System"} · {shortDate.format(activity.createdAt)}</span></div></div>) : <div className="timeline-row"><CheckCircle2 size={16}/><div><strong>Project created</strong><span>Commercial context preserved from the accepted proposal.</span></div></div>}</div></section>
      </main>
      <aside className="detail-side">
        <section className="surface"><span className="eyebrow">Payments</span><div className="compact-list compact-list--plain">{project.payments.length ? project.payments.map((payment) => <Link href={`/payments/${payment.id}`} key={payment.id}><div><strong>{payment.method.replaceAll("_", " ")}</strong><span>{payment.status} · {mxn.format(Number(payment.settledAmount))} settled</span></div><b>{mxn.format(Number(payment.amount))}</b></Link>) : <p>No payments linked yet.</p>}</div></section>
        <section className="surface"><span className="eyebrow">Opportunity</span><h3>{project.opportunity.title}</h3><p>Score {project.opportunity.qualificationScore} · {project.opportunity.stage}</p><Link className="detail-link" href={`/opportunities/${project.opportunity.id}`}><Clock3 size={14}/>Open source opportunity</Link></section>
      </aside>
    </div>
  </>;
}
