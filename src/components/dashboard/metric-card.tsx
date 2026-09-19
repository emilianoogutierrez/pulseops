import { Card } from "@/components/ui/card";
import { mxn } from "@/lib/format";
export function MetricCard({ label, value, delta, count = false }: { label: string; value: number; delta: string; count?: boolean; }) {
  return <Card className="metric-card"><span className="metric-label">{label}</span><div className="metric-value">{count ? value : mxn.format(value)}</div><span className="metric-delta"><i aria-hidden="true"/>{delta}</span></Card>;
}
