export type ProposalState = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";
const allowed: Record<ProposalState, readonly ProposalState[]> = {
    DRAFT: ["SENT", "DECLINED"],
    SENT: ["ACCEPTED", "DECLINED", "EXPIRED"],
    ACCEPTED: [],
    DECLINED: [],
    EXPIRED: []
};
export function transitionProposal(current: ProposalState, target: ProposalState): ProposalState {
    if (!allowed[current].includes(target)) {
        throw new Error(`Proposal cannot transition from ${current} to ${target}`);
    }
    return target;
}
export function assertProposalCanBeAccepted(state: ProposalState): void {
    transitionProposal(state, "ACCEPTED");
}
