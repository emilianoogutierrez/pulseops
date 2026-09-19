import Link from "next/link";
export default function WorkspaceNotFound() {
    return <section className="error-state">
    <span className="eyebrow">Not found</span>
    <h1>That record is not available in this workspace.</h1>
    <p>It may have been removed, or the current workspace does not have access to it.</p>
    <Link className="button button--primary" href="/dashboard">Return to dashboard</Link>
  </section>;
}
