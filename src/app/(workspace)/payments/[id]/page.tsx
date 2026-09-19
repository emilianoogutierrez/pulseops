import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, ExternalLink, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { mxn, shortDate } from "@/lib/format";
import { remainingPaymentAmount } from "@/domain/payments/settlement";
import { requireSessionIdentity } from "@/server/auth/session";
import { getPayment } from "@/server/repositories/payments";
import { recordPaymentSettlementAction } from "../actions";
export default async function PaymentDetail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const session = await requireSessionIdentity();
    const payment = await getPayment(session.workspaceId, id);
    if (!payment)
        notFound();
    const total = Number(payment.amount);
    const settled = Number(payment.settledAmount);
    const remaining = remainingPaymentAmount(total, settled);
    const displayAmount = payment.currency === "MXN" ? mxn.format(total) : `${payment.currency} ${total.toLocaleString()}`;
    return <>
    <PageHeader eyebrow="Payment" title={displayAmount} description={`${payment.client.companyName} · ${payment.method.replaceAll("_", " ")}`} action={<Link className="button button--secondary" href="/payments"><ArrowLeft size={15}/>Payments</Link>}/>
    <div className="detail-grid">
      <main className="detail-main">
        <section className="surface payment-detail-hero">
          <div><Badge tone={payment.status === "PAID" ? "success" : payment.status === "PARTIAL" ? "warning" : "accent"}>{payment.status}</Badge><h2>{payment.currency === "MXN" ? mxn.format(settled) : `${payment.currency} ${settled.toLocaleString()}`}</h2><p>settled of {displayAmount}</p></div>
          <div className="settlement-progress"><span><i style={{ width: `${Math.min(100, total ? (settled / total) * 100 : 0)}%` }}/></span><strong>{remaining ? `${payment.currency === "MXN" ? mxn.format(remaining) : `${payment.currency} ${remaining}`} remaining` : "Fully settled"}</strong></div>
          <div className="fact-grid"><div><span>Client</span><strong>{payment.client.companyName}</strong></div><div><span>Project</span><strong>{payment.project?.name ?? "Unlinked"}</strong></div><div><span>Due</span><strong>{payment.dueAt ? shortDate.format(payment.dueAt) : "Open"}</strong></div><div><span>Reference</span><strong>{payment.externalReference || "Not recorded"}</strong></div></div>
          {payment.paymentUrl ? <a className="detail-link" href={payment.paymentUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/>Open external payment link</a> : null}
        </section>
        <section className="surface"><div className="section-title"><div><span className="eyebrow">Reconciliation</span><h2>Settlement ledger</h2></div></div><div className="settlement-list">{payment.settlements.length ? payment.settlements.map((entry) => <div className="settlement-row" key={entry.id}><div className="settlement-icon"><ReceiptText size={15}/></div><div><strong>{payment.currency === "MXN" ? mxn.format(Number(entry.amount)) : `${payment.currency} ${entry.amount.toString()}`}</strong><span>{entry.externalReference || "No external reference"}{entry.note ? ` · ${entry.note}` : ""}</span></div><time>{shortDate.format(entry.settledAt)}</time></div>) : <p className="subtle">No settlements recorded yet.</p>}</div></section>
      </main>
      <aside className="detail-side">
        {session.role !== "VIEWER" && remaining > 0 && !["FAILED", "REFUNDED"].includes(payment.status) ? <form action={recordPaymentSettlementAction} className="surface action-panel"><div className="editor-side__head"><Banknote size={18}/><div><strong>Record settlement</strong><span>Append-only reconciliation</span></div></div><input type="hidden" name="paymentId" value={payment.id}/><label className="field"><span>Amount received</span><input name="amount" type="number" min="0.01" step="0.01" max={remaining} defaultValue={remaining} required/></label><label className="field"><span>External reference</span><input name="externalReference" placeholder="SPEI / merchant / Binance reference"/></label><label className="field"><span>Note</span><textarea name="note" rows={3} placeholder="Optional reconciliation note"/></label><button className="button button--primary button--full" type="submit">Record settlement</button></form> : null}
        <section className="surface"><span className="eyebrow">Settlement boundary</span><p>PulseOps records verified external settlement. It does not custody funds or infer a transfer from a payment link.</p></section>
      </aside>
    </div>
  </>;
}
