import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { listProjects } from "@/server/repositories/projects";
export default async function ProjectsPage() { const s = await requireSessionIdentity(); const projects = await listProjects(s.workspaceId); return <><PageHeader eyebrow="Delivery" title="Projects" description="Accepted proposals become delivery records without losing commercial context."/><div className="project-list">{projects.map(p => <Link href={`/projects/${p.id}`} key={p.id}><Card className="project-row"><div className="project-copy"><div><h3>{p.name}</h3><p>{p.client} · {p.dueAt ? `Due ${shortDate.format(p.dueAt)}` : "No due date"}</p></div><Badge tone={p.status === "DELIVERED" || p.status === "CLOSED" ? "success" : p.status === "REVIEW" || p.status === "BLOCKED" ? "warning" : "accent"}>{p.status}</Badge></div><div className="progress-row"><div className="progress-track"><span style={{ width: `${p.progress}%` }}/></div><strong>{p.progress}%</strong></div><div className="project-money"><span>{mxn.format(p.collected)} collected</span><span>{mxn.format(p.amount)} quoted</span></div></Card></Link>)}</div></>; }
