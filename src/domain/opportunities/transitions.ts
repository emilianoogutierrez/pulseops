import type { OpportunityStage } from "./types";
const transitions: Record<OpportunityStage, readonly OpportunityStage[]> = {
    DISCOVERED: ["QUALIFIED", "REJECTED"],
    QUALIFIED: ["CONTACTED", "REJECTED"],
    CONTACTED: ["REPLIED", "LOST"],
    REPLIED: ["SCOPING", "LOST"],
    SCOPING: ["QUOTED", "LOST"],
    QUOTED: ["WON", "LOST"],
    WON: ["DELIVERING"],
    DELIVERING: ["DELIVERED"],
    DELIVERED: ["PAID"],
    PAID: [],
    LOST: [],
    REJECTED: []
};
export class InvalidOpportunityTransitionError extends Error {
    constructor(current: OpportunityStage, target: OpportunityStage) {
        super(`Cannot transition opportunity from ${current} to ${target}`);
        this.name = "InvalidOpportunityTransitionError";
    }
}
export function canTransitionOpportunity(current: OpportunityStage, target: OpportunityStage): boolean {
    return transitions[current].includes(target);
}
export function transitionOpportunity(current: OpportunityStage, target: OpportunityStage): OpportunityStage {
    if (!canTransitionOpportunity(current, target)) {
        throw new InvalidOpportunityTransitionError(current, target);
    }
    return target;
}
