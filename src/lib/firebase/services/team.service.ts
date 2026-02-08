// Team Service - Core team CRUD operations
// Implements team lifecycle management (US1)

import {
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
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
        inviteCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h validity
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const docRef = await addDoc(teamsRef, newTeam as any);

    // Create owner member record
    // Use setDoc to ensure document ID matches userId (required by security rules)
    const memberRef = doc(db, `teams/${docRef.id}/members`, userId).withConverter(teamMemberConverter);
    await setDoc(memberRef, {
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
    // Query all member records for this user across all teams
    // Requires an index on 'members' collection group for 'uid' + 'status'
    const membersQuery = query(
        collectionGroup(db, 'members'),
        where('uid', '==', userId),
        where('status', '==', 'active')
    );

    const snapshot = await getDocs(membersQuery);

    // Fetch parent team documents
    const teamPromises = snapshot.docs.map(async (memberDoc) => {
        const teamRef = memberDoc.ref.parent.parent;
        if (!teamRef) return null;

        const teamSnap = await getDoc(teamRef.withConverter(teamConverter));
        return teamSnap.exists() ? teamSnap.data() : null;
    });

    const teams = await Promise.all(teamPromises);
    return teams.filter((t): t is Team => t !== null);
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
 * Replaces old code and sets new 24h expiration
 */
export async function regenerateInviteCode(teamId: string): Promise<string> {
    const code = generateInviteCode();
    const teamRef = doc(db, 'teams', teamId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h validity

    await updateDoc(teamRef, {
        inviteCode: code,
        inviteCodeExpiresAt: expiresAt,
        updatedAt: new Date(),
    });

    return code;
}

/**
 * Get team by invite code
 * Validates expiration
 */
export async function getTeamByInviteCode(code: string): Promise<Team | null> {
    const teamsRef = collection(db, 'teams').withConverter(teamConverter);
    const q = query(teamsRef, where('inviteCode', '==', code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const teamData = snapshot.docs[0].data();

    // Check if expired
    if (teamData.inviteCodeExpiresAt && teamData.inviteCodeExpiresAt < new Date()) {
        console.warn('Invite code expired for team', teamData.id);
        return null;
    }

    return { ...teamData, id: snapshot.docs[0].id };
}
