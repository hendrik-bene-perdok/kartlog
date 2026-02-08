// Member Service Unit Tests
// Tests for member management logic (invite, approve, remove, roles)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    requestJoinTeam,
    approveMember,
    rejectMember,
    removeMember,
    assignRole,
    transferOwnership,
    getTeamMembers,
} from './member.service';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(() => ({
        withConverter: vi.fn(() => ({ path: 'members' }))
    })),
    doc: vi.fn((db, ...paths) => ({
        id: paths[paths.length - 1],
        path: paths.join('/'),
        withConverter: vi.fn()
    })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    runTransaction: vi.fn(),
}));

// Mock firebase lib
vi.mock('@/lib/firebase', () => ({
    db: {}
}));

describe('MemberService', () => {
    const mockTeamId = 'team-123';
    const mockUserId = 'user-456';
    const mockOwnerId = 'owner-789';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requestJoinTeam', () => {
        it('should create a pending member record', async () => {
            const { setDoc, getDoc } = await import('firebase/firestore');

            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ name: 'Test Team', inviteCode: 'ABC12345' })
            });

            await requestJoinTeam(mockTeamId, mockUserId, 'Test User');

            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    uid: mockUserId,
                    role: 'member',
                    status: 'pending',
                    displayName: 'Test User',
                })
            );
        });

        it('should throw error if team not found', async () => {
            const { getDoc } = await import('firebase/firestore');
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });

            await expect(
                requestJoinTeam(mockTeamId, mockUserId, 'Test User')
            ).rejects.toThrow('Team not found');
        });
    });

    describe('approveMember', () => {
        it('should update member status to active', async () => {
            const { updateDoc } = await import('firebase/firestore');

            await approveMember(mockTeamId, mockUserId);

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ status: 'active' })
            );
        });
    });

    describe('rejectMember', () => {
        it('should delete the member record', async () => {
            const { deleteDoc } = await import('firebase/firestore');

            await rejectMember(mockTeamId, mockUserId);

            expect(deleteDoc).toHaveBeenCalledTimes(1);
        });
    });

    describe('removeMember', () => {
        it('should delete a member from the team', async () => {
            const { deleteDoc } = await import('firebase/firestore');

            await removeMember(mockTeamId, mockUserId);

            expect(deleteDoc).toHaveBeenCalledTimes(1);
        });
    });

    describe('assignRole', () => {
        it('should update member role', async () => {
            const { updateDoc } = await import('firebase/firestore');

            await assignRole(mockTeamId, mockUserId, 'admin');

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ role: 'admin' })
            );
        });

        it('should not allow assigning owner role directly', async () => {
            await expect(
                assignRole(mockTeamId, mockUserId, 'owner')
            ).rejects.toThrow('Use transferOwnership');
        });
    });

    describe('transferOwnership', () => {
        it('should swap owner and new owner roles in a transaction', async () => {
            const { runTransaction, getDoc } = await import('firebase/firestore');

            const mockTransaction = {
                get: vi.fn(),
                update: vi.fn(),
            };

            (runTransaction as any).mockImplementation(async (db, callback) => {
                return callback(mockTransaction);
            });

            mockTransaction.get
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ ownerId: mockOwnerId })
                })
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ role: 'admin', status: 'active' })
                });

            await transferOwnership(mockTeamId, mockOwnerId, mockUserId);

            expect(mockTransaction.update).toHaveBeenCalledTimes(3); // Team doc + 2 member docs
        });

        it('should throw error if new owner is not an active member', async () => {
            const { runTransaction } = await import('firebase/firestore');

            const mockTransaction = {
                get: vi.fn(),
                update: vi.fn(),
            };

            (runTransaction as any).mockImplementation(async (db, callback) => {
                return callback(mockTransaction);
            });

            mockTransaction.get
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ ownerId: mockOwnerId })
                })
                .mockResolvedValueOnce({
                    exists: () => false
                });

            await expect(
                transferOwnership(mockTeamId, mockOwnerId, mockUserId)
            ).rejects.toThrow('New owner must be an active member');
        });
    });

    describe('getTeamMembers', () => {
        it('should return all team members', async () => {
            const { getDocs } = await import('firebase/firestore');

            (getDocs as any).mockResolvedValueOnce({
                docs: [
                    {
                        id: 'user-1',
                        data: () => ({ uid: 'user-1', role: 'owner', status: 'active' })
                    },
                    {
                        id: 'user-2',
                        data: () => ({ uid: 'user-2', role: 'member', status: 'active' })
                    },
                ]
            });

            const members = await getTeamMembers(mockTeamId);

            expect(members).toHaveLength(2);
            expect(members[0].role).toBe('owner');
        });
    });
});
