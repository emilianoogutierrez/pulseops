import clsx from "clsx";
import type { ReactNode } from "react";
export function Badge({ children, tone = "neutral" }: {
    children: ReactNode;
    tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
    return <span className={clsx("badge", `badge--${tone}`)}>{children}</span>;
}
