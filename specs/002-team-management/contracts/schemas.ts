import { z } from "zod";

export const CreateTeamSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(200).optional(),
});

export const JoinTeamSchema = z.object({
    inviteCode: z.string().length(8),
});

export const UpdateMemberSchema = z.object({
    role: z.enum(['owner', 'admin', 'member']).optional(),
    status: z.enum(['active', 'pending']).optional(),
});

export const AddListItemSchema = z.object({
    content: z.string().min(1).max(100),
    type: z.enum(['todo', 'buy']),
});

export const SendMessageSchema = z.object({
    content: z.string().min(1).max(500),
});
