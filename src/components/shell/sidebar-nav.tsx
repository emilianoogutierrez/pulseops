"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
export function SidebarNav({ items }: {
    items: readonly (readonly [
        string,
        string,
        LucideIcon
    ])[];
}) {
    const pathname = usePathname();
    return <nav className="nav-list" aria-label="Primary navigation">{items.map(([label, href, Icon]) => { const active = pathname === href || pathname.startsWith(href + "/"); return <Link href={href} key={href} className={`nav-item${active ? " nav-item--active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.8}/>{label}</Link>; })}</nav>;
}
