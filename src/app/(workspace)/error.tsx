"use client";
import { useEffect } from "react";
export default function WorkspaceError({ error, reset }: {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}) {
    useEffect(() => { console.error(error); }, [error]);
    return <section className="error-state" role="alert">
    <span className="eyebrow">Workspace error</span>
    <h1>This view could not be loaded.</h1>
    <p>PulseOps kept the failure local to this route. Retry the request or return to the dashboard.</p>
    <div className="error-actions"><button className="button button--primary" onClick={reset}>Try again</button><a className="button button--secondary" href="/dashboard">Dashboard</a></div>
  </section>;
}
