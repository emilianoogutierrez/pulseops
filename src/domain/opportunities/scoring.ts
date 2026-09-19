import type { OpportunityScoreInput } from "./types";
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
export function calculateOpportunityScore(input: OpportunityScoreInput): number {
    const weighted = clamp(input.technicalFit) * 0.25 +
        clamp(input.paymentFit) * 0.2 +
        clamp(input.urgencyFit) * 0.15 +
        clamp(input.asyncFit) * 0.15 +
        clamp(input.aiLeverage) * 0.15 +
        clamp(input.clientQuality) * 0.1;
    const riskPenalty = clamp(input.deliveryRisk) * 0.18;
    return clamp(weighted - riskPenalty);
}
