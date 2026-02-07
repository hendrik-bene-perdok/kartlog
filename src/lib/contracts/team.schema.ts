// Validation schemas for Team Management
// Based on specs/002-team-management/contracts/schemas.ts

import { z } from "zod";

export const CreateTeamSchema = z.object({
    name: z.string().min(3, "Team name must be at least 3 characters").max(50, "Team name must not exceed 50 characters"),
    description: z.string().max(200, "Description must not exceed 200 characters").optional(),
});

export const UpdateTeamSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(200).optional(),
});

export const JoinTeamSchema = z.object({
    inviteCode: z.string().length(8, "Invalid invite code"),
});

export const UpdateMemberSchema = z.object({
    role: z.enum(['owner', 'admin', 'member']).optional(),
    status: z.enum(['active', 'pending']).optional(),
});

export const AddListItemSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(100, "Content must not exceed 100 characters"),
    type: z.enum(['todo', 'buy']),
});

export const SendMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty").max(500, "Message must not exceed 500 characters"),
});

// Type inference helpers
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
export type JoinTeamInput = z.infer<typeof JoinTeamSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type AddListItemInput = z.infer<typeof AddListItemSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
