'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ListItem, ListType } from '@/types/domain/team.types';
import {
    addListItem,
    updateListItem,
    deleteListItem,
    toggleItemComplete,
    clearCompletedItems,
} from '@/lib/firebase/services/list.service';

interface SharedListProps {
    teamId: string;
    listType: ListType;
    currentUserId: string;
    title: string;
    placeholder?: string;
}

export function SharedList({ teamId, listType, currentUserId, title, placeholder }: SharedListProps) {
    const [items, setItems] = useState<ListItem[]>([]);
    const [newItemContent, setNewItemContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real-time subscription to list items
    useEffect(() => {
        const itemsPath = `teams/${teamId}/lists/${listType}/items`;
        const itemsRef = collection(db, itemsPath);
        const q = query(itemsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const listItems = snapshot.docs.map(doc => ({
                    id: doc.id,
                    content: doc.data().content,
                    isCompleted: doc.data().isCompleted || false,
                    createdBy: doc.data().createdBy,
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                })) as ListItem[];

                setItems(listItems);
                setLoading(false);
            },
            (err) => {
                console.error('Failed to load list items:', err);
                setError('Failed to load items');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [teamId, listType]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;

        setAdding(true);
        setError(null);

        try {
            await addListItem(teamId, listType, newItemContent.trim(), currentUserId);
            setNewItemContent('');
        } catch (err) {
            setError('Failed to add item');
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const handleToggleComplete = async (itemId: string) => {
        try {
            await toggleItemComplete(teamId, listType, itemId);
        } catch (err) {
            setError('Failed to update item');
            console.error(err);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            await deleteListItem(teamId, listType, itemId);
        } catch (err) {
            setError('Failed to delete item');
            console.error(err);
        }
    };

    const handleClearCompleted = async () => {
        try {
            const count = await clearCompletedItems(teamId, listType);
            if (count === 0) {
                setError('No completed items to clear');
            }
        } catch (err) {
            setError('Failed to clear completed items');
            console.error(err);
        }
    };

    const activeItems = items.filter(item => !item.isCompleted);
    const completedItems = items.filter(item => item.isCompleted);

    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    {listType === 'todo' && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    )}
                    {listType === 'buy' && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    )}
                    {title}
                </h3>
                {completedItems.length > 0 && (
                    <button
                        onClick={handleClearCompleted}
                        className="text-xs text-gray-500 hover:text-red-600 transition"
                    >
                        Clear Completed
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        placeholder={placeholder || 'Add new item...'}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        maxLength={100}
                    />
                    <button
                        type="submit"
                        disabled={adding || !newItemContent.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition text-sm"
                    >
                        {adding ? '...' : 'Add'}
                    </button>
                </div>
            </form>

            {/* Items List */}
            <div className="space-y-2">
                {/* Active Items */}
                {activeItems.length > 0 && (
                    <div className="space-y-1">
                        {activeItems.map(item => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition group"
                            >
                                <button
                                    onClick={() => handleToggleComplete(item.id)}
                                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 transition flex-shrink-0"
                                >
                                    {item.isCompleted && (
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{item.content}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Completed Items */}
                {completedItems.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Completed ({completedItems.length})</p>
                        <div className="space-y-1">
                            {completedItems.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition group opacity-60"
                                >
                                    <button
                                        onClick={() => handleToggleComplete(item.id)}
                                        className="mt-1 w-5 h-5 rounded border-2 border-green-500 flex items-center justify-center bg-green-500 flex-shrink-0"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 line-through">{item.content}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition flex-shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No items yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add your first item above</p>
                    </div>
                )}
            </div>

            {/* Stats */}
            {items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    {activeItems.length} active • {completedItems.length} completed
                </div>
            )}
        </div>
    );
}
