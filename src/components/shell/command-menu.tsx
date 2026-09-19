"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Command, Search } from "lucide-react";
type Result = {
    id?: string;
    type: string;
    title: string;
    subtitle: string;
    href: string;
};
const shortcuts: Result[] = [
    { type: "Navigate", title: "Overview", subtitle: "Workspace dashboard", href: "/dashboard" },
    { type: "Navigate", title: "Pipeline", subtitle: "Qualified opportunities", href: "/opportunities" },
    { type: "Create", title: "New opportunity", subtitle: "Create and score a lead", href: "/opportunities/new" },
    { type: "Create", title: "New proposal", subtitle: "Price scoped work", href: "/proposals/new" },
    { type: "Navigate", title: "Payments", subtitle: "Settlement registry", href: "/payments" }
];
export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Result[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (open) {
                    setOpen(false);
                    setQuery("");
                    setResults([]);
                    setActiveIndex(0);
                    requestAnimationFrame(() => triggerRef.current?.focus());
                } else {
                    setActiveIndex(0);
                    setOpen(true);
                    requestAnimationFrame(() => inputRef.current?.focus());
                }
            }
            if (event.key === "Escape" && open) {
                setOpen(false);
                setQuery("");
                setResults([]);
                setActiveIndex(0);
                requestAnimationFrame(() => triggerRef.current?.focus());
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open]);
    useEffect(() => {
        const controller = new AbortController();
        const timeout = window.setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }
            const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
            if (response.ok)
                setResults((await response.json()).results);
        }, 180);
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [query]);
    const shown = useMemo(() => query.trim().length < 2 ? shortcuts : results, [query, results]);
    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (!shown.length)
            return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % shown.length);
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + shown.length) % shown.length);
        }
        if (event.key === "Enter") {
            const selected = shown[activeIndex];
            if (selected)
                window.location.assign(selected.href);
        }
    }
    return <>
    <button ref={triggerRef} className="global-search-trigger" onClick={() => { setActiveIndex(0); setOpen(true); requestAnimationFrame(() => inputRef.current?.focus()); }} aria-haspopup="dialog" aria-expanded={open}>
      <Search size={16}/><span>Search anything</span><kbd>⌘ K</kbd>
    </button>
    {open ? <div className="command-backdrop" onMouseDown={() => { setOpen(false); setQuery(""); setResults([]); setActiveIndex(0); requestAnimationFrame(() => triggerRef.current?.focus()); }}>
      <div className="command-menu" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search PulseOps">
        <div className="command-input"><Search size={18}/><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={onKeyDown} placeholder="Search clients, projects, opportunities…" aria-label="Search PulseOps"/><span><Command size={13}/> K</span></div>
        <div className="command-results" role="listbox">
          {shown.length ? shown.map((item, index) => <Link key={`${item.type}-${item.id ?? item.href}`} href={item.href} onClick={() => { setOpen(false); setQuery(""); setResults([]); setActiveIndex(0); }} className={`command-result${index === activeIndex ? " command-result--active" : ""}`} role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)}><div><span>{item.type}</span><strong>{item.title}</strong><small>{item.subtitle}</small></div><ArrowUpRight size={15}/></Link>) : <div className="command-empty">No results. Try a company, project or opportunity name.</div>}
        </div>
      </div>
    </div> : null}
  </>;
}
