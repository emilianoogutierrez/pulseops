export type WorkspaceRole = "OWNER" | "OPERATOR" | "VIEWER";
export type WorkspaceContext = {
    workspaceId: string;
    role: WorkspaceRole;
};
export function assertCanMutate(context: WorkspaceContext): void {
    if (context.role === "VIEWER") {
        throw new Error("Workspace role does not permit mutations");
    }
}
