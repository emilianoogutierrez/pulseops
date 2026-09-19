"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Settings2,
  UsersRound
} from "lucide-react";

import type { SessionIdentity } from "@/server/auth/session";
import { SidebarNav } from "./sidebar-nav";

const items = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Pipeline", "/opportunities", Activity],
  ["Proposals", "/proposals", FileText],
  ["Clients", "/clients", UsersRound],
  ["Projects", "/projects", BriefcaseBusiness],
  ["Payments", "/payments", CircleDollarSign],
  ["Analytics", "/analytics", BarChart3]
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Sidebar({ identity }: { identity: SessionIdentity }) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
        </span>

        <div>
          <strong>PulseOps</strong>
          <span>Revenue OS</span>
        </div>
      </div>

      <div className="nav-section-label">Operate</div>

      <SidebarNav items={items} />

      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item">
          <Settings2 size={17} />
          Settings
        </Link>

        <div className="workspace-chip">
          <div className="avatar">{initials(identity.userName)}</div>

          <div>
            <strong>{identity.workspaceName}</strong>
            <span>{identity.role.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
