// Firestore Data Converters for Team Management
// Handles serialization/deserialization between Firestore and TypeScript types

import type {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    DocumentData,
    Timestamp
} from 'firebase/firestore';
import type { Team, TeamMember, ListItem, ChatMessage } from '@/types/domain/team.types';

// Helper to convert Firestore Timestamp to Date
const timestampToDate = (timestamp: Timestamp): Date => timestamp.toDate();

// Team Converter
export const teamConverter: FirestoreDataConverter<Team> = {
    toFirestore(team): DocumentData {
        return {
            ...team,
            createdAt: team.createdAt || new Date(),
            updatedAt: new Date(),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Team {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            name: data.name,
            description: data.description || '',
            ownerId: data.ownerId,
            inviteCode: data.inviteCode,
            inviteCodeExpiresAt: data.inviteCodeExpiresAt ? timestampToDate(data.inviteCodeExpiresAt) : undefined,
            createdAt: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : new Date(),
        };
    },
};

// TeamMember Converter
export const teamMemberConverter: FirestoreDataConverter<TeamMember> = {
    toFirestore(member): DocumentData {
        return {
            ...member,
            joinedAt: member.joinedAt || new Date(),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): TeamMember {
        const data = snapshot.data();
        return {
            uid: snapshot.id,
            role: data.role,
            status: data.status,
            displayName: data.displayName,
            email: data.email,
            joinedAt: data.joinedAt ? timestampToDate(data.joinedAt) : new Date(),
        };
    },
};

// ListItem Converter
export const listItemConverter: FirestoreDataConverter<ListItem> = {
    toFirestore(item): DocumentData {
        return {
            ...item,
            createdAt: item.createdAt || new Date(),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): ListItem {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            content: data.content,
            isCompleted: data.isCompleted || false,
            createdBy: data.createdBy,
            createdAt: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
        };
    },
};

// ChatMessage Converter
export const chatMessageConverter: FirestoreDataConverter<ChatMessage> = {
    toFirestore(message): DocumentData {
        return {
            ...message,
            timestamp: message.timestamp || new Date(),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): ChatMessage {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp ? timestampToDate(data.timestamp) : new Date(),
        };
    },
};
