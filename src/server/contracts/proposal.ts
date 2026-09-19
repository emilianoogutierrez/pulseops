import { z } from "zod";
export const proposalScope = z.object({
    summary: z.string().trim().min(8).max(800),
    deliverables: z.array(z.string().trim().min(2).max(180)).min(1).max(12),
    acceptanceCriteria: z.array(z.string().trim().min(2).max(220)).min(1).max(12),
    exclusions: z.array(z.string().trim().min(2).max(220)).max(12).default([])
});
export const createProposalInput = z.object({
    opportunityId: z.string().min(1),
    price: z.coerce.number().positive().max(100000000),
    currency: z.string().trim().length(3).default("MXN"),
    deliveryDays: z.coerce.number().int().min(1).max(365),
    revisionLimit: z.coerce.number().int().min(0).max(12),
    expiresAt: z.coerce.date().optional(),
    scope: proposalScope
});
export const sendProposalInput = z.object({
    proposalId: z.string().min(1)
});
export const acceptProposalInput = z.object({
    proposalId: z.string().min(1),
    expectedOpportunityVersion: z.number().int().positive()
});
export type ProposalScope = z.infer<typeof proposalScope>;
export type CreateProposalInput = z.input<typeof createProposalInput>;
export type SendProposalInput = z.infer<typeof sendProposalInput>;
export type AcceptProposalInput = z.infer<typeof acceptProposalInput>;
