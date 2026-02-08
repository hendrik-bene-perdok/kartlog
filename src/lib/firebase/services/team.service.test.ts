// Team Service Unit Tests
// Tests for team lifecycle methods (create, read, update, delete)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createTeam,
    getUserTeams,
    updateTeam,
    deleteTeam,
    getTeamById,
    regenerateInviteCode
} from './team.service';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(() => ({
        withConverter: vi.fn((converter) => ({
            converter,
            path: 'teams'
        }))
    })),
    doc: vi.fn((db, ...paths) => ({
        id: paths[paths.length - 1],
        path: paths.join('/'),
        withConverter: vi.fn()
    })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
}));

// Mock firebase lib
vi.mock('@/lib/firebase', () => ({
    db: {}
}));

describe('TeamService', () => {
    const mockUserId = 'test-user-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTeam', () => {
        it('should create a team with owner as creator', async () => {
            const input = {
                name: 'Test Kart Team',
                description: 'Test team for karting',
            };

            // Mock implementation
            const { addDoc, getDoc } = await import('firebase/firestore');

            (addDoc as any).mockResolvedValueOnce({ id: 'team-123' });
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    id: 'team-123',
                    name: input.name,
                    description: input.description,
                    ownerId: mockUserId,
                    inviteCode: expect.any(String),
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            });

            const result = await createTeam(mockUserId, input);

            expect(result).toMatchObject({
                name: input.name,
                description: input.description,
                ownerId: mockUserId,
            });
            expect(result.inviteCode).toHaveLength(8);
            expect(addDoc).toHaveBeenCalledTimes(2); // Team + Owner member
        });

        it('should generate a unique invite code', async () => {
            const input = { name: 'Team 1' };

            const { addDoc, getDoc } = await import('firebase/firestore');
            (addDoc as any).mockResolvedValue({ id: 'team-1' });
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                data: () => ({ inviteCode: 'ABC12345' })
            });

            const result = await createTeam(mockUserId, input);

            expect(result.inviteCode).toMatch(/^[A-Z0-9]{8}$/);
        });
    });

    describe('getUserTeams', () => {
        it('should return only teams where user is an active member', async () => {
            const { getDocs, getDoc } = await import('firebase/firestore');

            (getDocs as any).mockResolvedValueOnce({
                docs: [
                    { id: 'team-1', data: () => ({ name: 'Team 1' }) },
                    { id: 'team-2', data: () => ({ name: 'Team 2' }) },
                ]
            });

            // User is member of team-1 only
            (getDoc as any)
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ status: 'active' })
                })
                .mockResolvedValueOnce({
                    exists: () => false
                });

            const result = await getUserTeams(mockUserId);

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({ name: 'Team 1' });
        });
    });

    describe('updateTeam', () => {
        it('should update team name and description', async () => {
            const { updateDoc } = await import('firebase/firestore');

            const updates = {
                name: 'Updated Team Name',
                description: 'Updated description',
            };

            await updateTeam('team-123', updates);

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining(updates)
            );
        });
    });

    describe('deleteTeam', () => {
        it('should delete a team', async () => {
            const { deleteDoc } = await import('firebase/firestore');

            await deleteTeam('team-123');

            expect(deleteDoc).toHaveBeenCalledTimes(1);
        });
    });

    describe('regenerateInviteCode', () => {
        it('should generate new 8-character code', async () => {
            const { updateDoc } = await import('firebase/firestore');

            const code = await regenerateInviteCode('team-123');

            expect(code).toMatch(/^[A-Z0-9]{8}$/);
            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ inviteCode: code })
            );
        });
    });
});
