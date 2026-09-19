import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "./login-form";
import { getSessionIdentity } from "@/server/auth/session";
export default async function LoginPage() {
  if (await getSessionIdentity()) redirect("/dashboard");
  return <main className="login-shell">
    <section className="login-card">
      <div className="login-brand"><span className="brand-mark" aria-hidden="true"><i/><i/></span><strong>PulseOps</strong></div>
      <span className="eyebrow">Revenue operations</span>
      <h1>One place for the work behind the revenue.</h1>
      <p>Qualify opportunities, price explicit scope, move delivery forward and reconcile collected cash without losing context.</p>
      <LoginForm/>
      <div className="login-note"><strong>Local demo</strong><span>Seed with <code>DEMO_PASSWORD</code>, then use demo@pulseops.local.</span></div>
    </section>
    <aside className="login-story" aria-label="Product principles">
      <div className="login-story__mark"><span>PO</span><small>Operating system</small></div>
      <div className="login-story__copy"><span className="eyebrow">Built for independent software teams</span><h2>From qualified lead to collected cash — with the evidence in between.</h2><p>Commercial decisions, delivery state and settlement history stay attached to the same client context.</p></div>
      <div className="login-story__checks">
        <div><CheckCircle2 size={15}/><span>Payment compatibility before proposal work</span></div>
        <div><CheckCircle2 size={15}/><span>Contract-shaped scope and explicit delivery states</span></div>
        <div><CheckCircle2 size={15}/><span>Append-only settlement history and source analytics</span></div>
      </div>
    </aside>
  </main>;
}
