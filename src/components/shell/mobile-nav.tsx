"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CircleDollarSign, LayoutDashboard, UsersRound } from "lucide-react";

const items = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Pipeline", "/opportunities", Activity],
  ["Clients", "/clients", UsersRound],
  ["Payments", "/payments", CircleDollarSign]
] as const;

export function MobileNav() {
  const pathname = usePathname();
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    {items.map(([label, href, Icon]) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} className={active ? "mobile-nav__active" : undefined} aria-current={active ? "page" : undefined}><Icon size={20}/><span>{label}</span></Link>;
    })}
  </nav>;
}
