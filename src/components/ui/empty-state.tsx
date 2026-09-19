import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="empty-state">
            {icon ? <div className="empty-state__icon">{icon}</div> : null}
            <strong>{title}</strong>
            <p>{description}</p>
            {action}
        </div>
    );
}
