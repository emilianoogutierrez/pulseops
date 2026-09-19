import type { ReactNode } from "react";
import type { SessionIdentity } from "@/server/auth/session";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
export function AppShell({ children, identity }: {
    children: ReactNode;
    identity: SessionIdentity;
}) {
    return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Sidebar identity={identity}/>
    <div className="app-main">
      <Topbar identity={identity}/>
      <main id="main-content" className="page-content" tabIndex={-1}>{children}</main>
    </div>
    <MobileNav />
  </div>;
}
