export const OPPORTUNITY_STAGES = [
    "DISCOVERED",
    "QUALIFIED",
    "CONTACTED",
    "REPLIED",
    "SCOPING",
    "QUOTED",
    "WON",
    "DELIVERING",
    "DELIVERED",
    "PAID",
    "LOST",
    "REJECTED"
] as const;
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];
export type OpportunityScoreInput = {
    technicalFit: number;
    paymentFit: number;
    urgencyFit: number;
    asyncFit: number;
    aiLeverage: number;
    clientQuality: number;
    deliveryRisk: number;
};
