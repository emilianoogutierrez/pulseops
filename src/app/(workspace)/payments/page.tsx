import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mxn, shortDate } from "@/lib/format";
import { requireSessionIdentity } from "@/server/auth/session";
import { listPayments } from "@/server/repositories/payments";
const labels: Record<string, string> = {
    SPEI: "SPEI",
    MERCADO_PAGO: "Mercado Pago",
    USDT_BINANCE: "USDT · Binance",
    OTHER: "Other"
};
export default async function PaymentsPage() {
    const session = await requireSessionIdentity();
    const data = await listPayments(session.workspaceId);
    return <><div className="page-heading"><div><span className="eyebrow">Collections</span><h1>Payments</h1><p>Record external settlement without pretending PulseOps is a payment processor.</p></div>{session.role !== "VIEWER" ? <Link className="button button--primary" href="/payments/new"><Plus size={16}/>New request</Link> : null}</div>
    <div className="payment-capabilities">{data.capabilities.map((capability) => <Card key={capability.method}><span className="eyebrow">{capability.countryScope === "MX" ? "Mexico" : "International"}</span><h3>{labels[capability.method]}</h3><p>{capability.settlementCurrency} · {capability.instructions}</p></Card>)}</div>
    <Card><div className="table-scroll"><table className="data-table"><thead><tr><th>Client</th><th>Project</th><th>Method</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>{data.payments.map((payment) => <tr key={payment.id}><td><Link className="table-primary-link" href={`/payments/${payment.id}`}><strong>{payment.client}</strong><span>{payment.project}</span></Link></td><td>{payment.project}</td><td>{labels[payment.method]}</td><td><Badge tone={payment.status === "PAID" ? "success" : payment.status === "FAILED" || payment.status === "REFUNDED" ? "neutral" : "warning"}>{payment.status}</Badge></td><td><strong>{mxn.format(payment.settledAmount)}</strong><span className="subtle"> / {mxn.format(payment.amount)}</span></td><td>{payment.paidAt ? shortDate.format(payment.paidAt) : payment.dueAt ? `Due ${shortDate.format(payment.dueAt)}` : "Open"}</td></tr>)}</tbody></table></div></Card>
  </>;
}
