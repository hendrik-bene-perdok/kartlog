// List Service Unit Tests
// Tests for shared list operations (add, update, delete items)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    addListItem,
    updateListItem,
    deleteListItem,
    getListItems,
    toggleItemComplete,
} from './list.service';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(() => ({
        withConverter: vi.fn(() => ({ path: 'items' }))
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
    orderBy: vi.fn(),
}));

// Mock firebase lib
vi.mock('@/lib/firebase', () => ({
    db: {}
}));

describe('ListService', () => {
    const mockTeamId = 'team-123';
    const mockUserId = 'user-456';
    const mockListType = 'todo';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('addListItem', () => {
        it('should add a new item to the list', async () => {
            const { addDoc } = await import('firebase/firestore');

            (addDoc as any).mockResolvedValueOnce({ id: 'item-123' });

            await addListItem(mockTeamId, mockListType, 'Buy new tires', mockUserId);

            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    content: 'Buy new tires',
                    isCompleted: false,
                    createdBy: mockUserId,
                })
            );
        });
    });

    describe('updateListItem', () => {
        it('should update an existing item', async () => {
            const { updateDoc } = await import('firebase/firestore');

            await updateListItem(mockTeamId, mockListType, 'item-123', {
                content: 'Updated content',
            });

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    content: 'Updated content',
                })
            );
        });
    });

    describe('toggleItemComplete', () => {
        it('should toggle item completion status', async () => {
            const { getDoc, updateDoc } = await import('firebase/firestore');

            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ isCompleted: false })
            });

            await toggleItemComplete(mockTeamId, mockListType, 'item-123');

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ isCompleted: true })
            );
        });

        it('should toggle from completed to incomplete', async () => {
            const { getDoc, updateDoc } = await import('firebase/firestore');

            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ isCompleted: true })
            });

            await toggleItemComplete(mockTeamId, mockListType, 'item-123');

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ isCompleted: false })
            );
        });
    });

    describe('deleteListItem', () => {
        it('should delete an item from the list', async () => {
            const { deleteDoc } = await import('firebase/firestore');

            await deleteListItem(mockTeamId, mockListType, 'item-123');

            expect(deleteDoc).toHaveBeenCalledTimes(1);
        });
    });

    describe('getListItems', () => {
        it('should return all items in the list', async () => {
            const { getDocs } = await import('firebase/firestore');

            (getDocs as any).mockResolvedValueOnce({
                docs: [
                    {
                        id: 'item-1',
                        data: () => ({
                            content: 'Item 1',
                            isCompleted: false,
                            createdBy: mockUserId,
                            createdAt: new Date()
                        })
                    },
                    {
                        id: 'item-2',
                        data: () => ({
                            content: 'Item 2',
                            isCompleted: true,
                            createdBy: mockUserId,
                            createdAt: new Date()
                        })
                    },
                ]
            });

            const items = await getListItems(mockTeamId, mockListType);

            expect(items).toHaveLength(2);
            expect(items[0].content).toBe('Item 1');
            expect(items[1].isCompleted).toBe(true);
        });

        it('should return empty array if no items exist', async () => {
            const { getDocs } = await import('firebase/firestore');

            (getDocs as any).mockResolvedValueOnce({
                docs: []
            });

            const items = await getListItems(mockTeamId, mockListType);

            expect(items).toEqual([]);
        });
    });
});
