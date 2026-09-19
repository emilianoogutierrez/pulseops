import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mxn, relativeDay } from "@/lib/format";
import { transitionOpportunityAction } from "@/app/(workspace)/opportunities/actions";
type Row = {
    id: string;
    title: string;
    company: string;
    stage: string;
    source: string;
    value: number;
    score: number;
    method: string;
    nextActionAt: Date | null;
    version: number;
};
const toneByStage: Record<string, "neutral" | "success" | "warning" | "accent"> = {
    QUALIFIED: "accent",
    CONTACTED: "neutral",
    REPLIED: "accent",
    SCOPING: "warning",
    QUOTED: "success",
    WON: "success",
    DELIVERING: "accent",
    DELIVERED: "success",
    PAID: "success"
};
const nextStage: Record<string, string | undefined> = {
    DISCOVERED: "QUALIFIED",
    QUALIFIED: "CONTACTED",
    CONTACTED: "REPLIED",
    REPLIED: "SCOPING",
    SCOPING: "QUOTED",
    WON: "DELIVERING",
    DELIVERING: "DELIVERED",
    DELIVERED: "PAID"
};
export function OpportunityTable({ rows, limit, mutable = false }: {
    rows: Row[];
    limit?: number;
    mutable?: boolean;
}) {
    const visible = limit ? rows.slice(0, limit) : rows;
    return (<div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Opportunity</th><th>Stage</th><th>Value</th><th>Score</th><th>Payment</th><th>Next action</th>{mutable ? <th /> : null}</tr></thead>
        <tbody>
          {visible.map((opportunity) => {
            const target = nextStage[opportunity.stage];
            return (<tr key={opportunity.id}>
                <td><Link className="table-primary-link" href={`/opportunities/${opportunity.id}`}><strong>{opportunity.title}</strong><span>{opportunity.company} · {opportunity.source}</span></Link></td>
                <td><Badge tone={toneByStage[opportunity.stage] ?? "neutral"}>{opportunity.stage}</Badge></td>
                <td>{mxn.format(opportunity.value)}</td>
                <td><span className="score-pill">{opportunity.score}</span></td>
                <td>{opportunity.method}</td>
                <td>{relativeDay(opportunity.nextActionAt)}</td>
                {mutable ? <td>{target ? <form action={transitionOpportunityAction}><input type="hidden" name="opportunityId" value={opportunity.id}/><input type="hidden" name="expectedVersion" value={opportunity.version}/><input type="hidden" name="targetStage" value={target}/><button className="table-action" type="submit">Move to {target.toLowerCase()}</button></form> : <span className="subtle">Terminal</span>}</td> : null}
              </tr>);
        })}
        </tbody>
      </table>
    </div>);
}
