// Team Service - Core team CRUD operations
// Implements team lifecycle management (US1)

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { teamConverter, teamMemberConverter } from '../converters/team.converters';
import type { Team, CreateTeamInput, UpdateTeamInput } from '@/types/domain/team.types';


// Generate random invite code (8 characters)
function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Create a new team
 * User becomes the owner automatically
 */
export async function createTeam(
    userId: string,
    input: CreateTeamInput
): Promise<Team> {
    const teamsRef = collection(db, 'teams').withConverter(teamConverter);

    const newTeam = {
        name: input.name,
        description: input.description || '',
        ownerId: userId,
        inviteCode: generateInviteCode(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const docRef = await addDoc(teamsRef, newTeam as any);

    // Create owner member record
    const membersRef = collection(db, `teams/${docRef.id}/members`).withConverter(teamMemberConverter);
    await addDoc(membersRef, {
        uid: userId,
        role: 'owner',
        status: 'active',
        displayName: '', // TODO: Get from auth context
        joinedAt: new Date(),
    });

    const snapshot = await getDoc(docRef);
    return snapshot.data()!;
}

/**
 * Get all teams the user belongs to
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
    // Query teams where user is a member
    // Note: This requires composite index or collection group query
    // For MVP, we'll query all teams and filter client-side
    // TODO: Optimize with collection group query on members subcollection

    const teamsRef = collection(db, 'teams').withConverter(teamConverter);
    const snapshot = await getDocs(teamsRef);

    const teams: Team[] = [];

    for (const teamDoc of snapshot.docs) {
        const memberRef = doc(db, `teams/${teamDoc.id}/members/${userId}`).withConverter(teamMemberConverter);
        const memberSnapshot = await getDoc(memberRef);

        if (memberSnapshot.exists() && memberSnapshot.data().status === 'active') {
            teams.push(teamDoc.data());
        }
    }

    return teams;
}

/**
 * Update team details (name/description)
 * Only owner/admin can update
 */
export async function updateTeam(
    teamId: string,
    input: UpdateTeamInput
): Promise<void> {
    const teamRef = doc(db, 'teams', teamId);

    await updateDoc(teamRef, {
        ...input,
        updatedAt: new Date(),
    });
}

/**
 * Delete/disband a team
 * Only owner can delete
 * TODO: Add cascade delete for subcollections
 */
export async function deleteTeam(teamId: string): Promise<void> {
    const teamRef = doc(db, 'teams', teamId);
    await deleteDoc(teamRef);

    // TODO: Delete subcollections (members, lists, chat)
    // This requires a Cloud Function or batch delete
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: string): Promise<Team | null> {
    const teamRef = doc(db, 'teams', teamId).withConverter(teamConverter);
    const snapshot = await getDoc(teamRef);

    return snapshot.exists() ? snapshot.data() : null;
}

/**
 * Generate new invite link for a team
 */
export async function generateInviteLink(teamId: string): Promise<string> {
    const code = generateInviteCode();
    const teamRef = doc(db, 'teams', teamId);

    await updateDoc(teamRef, {
        inviteCode: code,
        updatedAt: new Date(),
    });

    return code;
}
