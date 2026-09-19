export type ProjectState = "PLANNED" | "ACTIVE" | "BLOCKED" | "REVIEW" | "DELIVERED" | "CLOSED";
const allowedTransitions: Record<ProjectState, readonly ProjectState[]> = {
    PLANNED: ["ACTIVE"],
    ACTIVE: ["BLOCKED", "REVIEW"],
    BLOCKED: ["ACTIVE"],
    REVIEW: ["ACTIVE", "DELIVERED"],
    DELIVERED: ["CLOSED"],
    CLOSED: []
};
export function allowedProjectTransitions(state: ProjectState): readonly ProjectState[] {
    return allowedTransitions[state];
}
export function transitionProject(current: ProjectState, target: ProjectState): ProjectState {
    if (!allowedTransitions[current].includes(target)) {
        throw new Error(`Project cannot transition from ${current} to ${target}`);
    }
    return target;
}
