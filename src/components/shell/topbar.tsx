import { LogOut } from "lucide-react";
import type { SessionIdentity } from "@/server/auth/session";
import { logoutAction } from "@/app/actions";
import { CommandMenu } from "./command-menu";
function initials(name: string): string { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
export function Topbar({ identity }: { identity: SessionIdentity; }) {
  return <header className="topbar">
    <div className="mobile-brand"><span className="brand-mark" aria-hidden="true"><i/><i/></span><strong>PulseOps</strong></div>
    <div className="topbar-context"><span>Workspace</span><strong>{identity.workspaceName}</strong></div>
    <CommandMenu />
    <div className="topbar-actions">
      <span className="role-pill">{identity.role.toLowerCase()}</span>
      <div className="avatar" title={identity.userName}>{initials(identity.userName)}</div>
      <form action={logoutAction}><button className="icon-button" aria-label="Sign out" title="Sign out"><LogOut size={16}/></button></form>
    </div>
  </header>;
}
