import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
export function Button({ children, className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
    return <button className={clsx("button", `button--${variant}`, className)} {...props}>{children}</button>;
}
