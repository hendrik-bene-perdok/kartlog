// Team Management Domain Types
// Based on specs/002-team-management/data-model.md

export type TeamRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'pending' | 'active';
export type ListType = 'todo' | 'buy';

export interface Team {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    inviteCode?: string;
    inviteCodeExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMember {
    uid: string;
    role: TeamRole;
    status: MemberStatus;
    displayName: string;
    email?: string;
    joinedAt: Date;
}

export interface ListItem {
    id: string;
    content: string;
    isCompleted: boolean;
    createdBy: string;
    createdAt: Date;
}

export interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
}

// DTOs for API operations
export interface CreateTeamInput {
    name: string;
    description?: string;
}

export interface UpdateTeamInput {
    name?: string;
    description?: string;
}

export interface UpdateMemberInput {
    role?: TeamRole;
    status?: MemberStatus;
}

export interface AddListItemInput {
    content: string;
    type: ListType;
}

export interface SendMessageInput {
    content: string;
}
