// Member Service - Member management operations
// Implements member invitation, approval, removal, and role management (US2)

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { teamMemberConverter } from '../converters/team.converters';
import type { TeamMember, TeamRole } from '@/types/domain/team.types';

/**
 * Request to join a team using invite code
 * Creates a pending member record that requires approval
 */
export async function requestJoinTeam(
    teamId: string,
    userId: string,
    displayName: string,
    email?: string
): Promise<void> {
    // Verify team exists
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
        throw new Error('Team not found');
    }

    // Create pending member record
    const memberRef = doc(db, `teams/${teamId}/members`, userId).withConverter(teamMemberConverter);

    await setDoc(memberRef, {
        uid: userId,
        role: 'member',
        status: 'pending',
        displayName,
        email,
        joinedAt: new Date(),
    } as any);
}

/**
 * Approve a pending member request
 * Changes status from 'pending' to 'active'
 */
export async function approveMember(teamId: string, userId: string): Promise<void> {
    const memberRef = doc(db, `teams/${teamId}/members`, userId);

    await updateDoc(memberRef, {
        status: 'active',
    });
}

/**
 * Reject a pending member request
 * Deletes the member record
 */
export async function rejectMember(teamId: string, userId: string): Promise<void> {
    const memberRef = doc(db, `teams/${teamId}/members`, userId);
    await deleteDoc(memberRef);
}

/**
 * Remove a member from the team
 * Can be used by admins or by the member themselves (leave team)
 */
export async function removeMember(teamId: string, userId: string): Promise<void> {
    const memberRef = doc(db, `teams/${teamId}/members`, userId);
    await deleteDoc(memberRef);
}

/**
 * Assign a role to a member (promote/demote)
 * Cannot assign 'owner' role - use transferOwnership instead
 */
export async function assignRole(
    teamId: string,
    userId: string,
    role: TeamRole
): Promise<void> {
    if (role === 'owner') {
        throw new Error('Use transferOwnership to change ownership');
    }

    const memberRef = doc(db, `teams/${teamId}/members`, userId);

    await updateDoc(memberRef, {
        role,
    });
}

/**
 * Transfer team ownership to another member
 * Uses a transaction to atomically:
 * 1. Update team's ownerId
 * 2. Change current owner to admin
 * 3. Change new owner to owner role
 */
export async function transferOwnership(
    teamId: string,
    currentOwnerId: string,
    newOwnerId: string
): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const teamRef = doc(db, 'teams', teamId);
        const currentOwnerRef = doc(db, `teams/${teamId}/members`, currentOwnerId);
        const newOwnerRef = doc(db, `teams/${teamId}/members`, newOwnerId);

        // Read phase
        const teamSnap = await transaction.get(teamRef);
        const newOwnerSnap = await transaction.get(newOwnerRef);

        if (!teamSnap.exists()) {
            throw new Error('Team not found');
        }

        if (!newOwnerSnap.exists()) {
            throw new Error('New owner must be an active member of the team');
        }

        const newOwnerData = newOwnerSnap.data();
        if (newOwnerData.status !== 'active') {
            throw new Error('New owner must be an active member');
        }

        // Write phase
        transaction.update(teamRef, {
            ownerId: newOwnerId,
            updatedAt: new Date(),
        });

        transaction.update(currentOwnerRef, {
            role: 'admin',
        });

        transaction.update(newOwnerRef, {
            role: 'owner',
        });
    });
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const membersRef = collection(db, `teams/${teamId}/members`).withConverter(teamMemberConverter);
    const snapshot = await getDocs(membersRef);

    return snapshot.docs.map(doc => doc.data());
}

/**
 * Get team member by ID
 */
export async function getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const memberRef = doc(db, `teams/${teamId}/members`, userId).withConverter(teamMemberConverter);
    const snapshot = await getDoc(memberRef);

    return snapshot.exists() ? snapshot.data() : null;
}

/**
 * Check if user is a member of a team
 */
export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const member = await getTeamMember(teamId, userId);
    return member !== null && member.status === 'active';
}
