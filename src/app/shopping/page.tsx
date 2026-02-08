/**
 * Shopping List Page
 * Feature: 004-maintenance-core
 * 
 * Main shopping list with swipe actions and photo support
 */

'use client';

import React, { useState } from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { ShoppingListItem } from '@/components/shopping/ShoppingListItem';
import { AddShoppingItemForm } from '@/components/shopping/AddShoppingItemForm';
import { TouchButton } from '@/components/ui/TouchButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function ShoppingListPage() {
    const { activeItems, archivedItems, loading, createItem, markItemOrdered, archiveItem } = useShoppingList();
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');

    const handleAddItem = async (description: string, photoId?: string) => {
        await createItem(description, undefined, photoId);
        setShowForm(false);
    };

    const displayItems = viewMode === 'active' ? activeItems : archivedItems;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 p-4 pb-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6">Shopping List</h1>

                    {/* View Toggle */}
                    <div className="flex gap-3 mb-6">
                        <TouchButton
                            variant={viewMode === 'active' ? 'primary' : 'secondary'}
                            onClick={() => setViewMode('active')}
                        >
                            Active ({activeItems.length})
                        </TouchButton>
                        <TouchButton
                            variant={viewMode === 'archive' ? 'primary' : 'secondary'}
                            onClick={() => setViewMode('archive')}
                        >
                            Archive ({archivedItems.length})
                        </TouchButton>
                    </div>

                    {/* Add Form */}
                    {showForm && viewMode === 'active' && (
                        <div className="bg-gray-800 rounded-lg p-6 mb-6">
                            <AddShoppingItemForm
                                onSubmit={handleAddItem}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    )}

                    {!showForm && viewMode === 'active' && (
                        <TouchButton
                            variant="primary"
                            onClick={() => setShowForm(true)}
                            className="w-full mb-6"
                        >
                            + Add Item
                        </TouchButton>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                        {displayItems.length === 0 ? (
                            <div className="bg-gray-800 rounded-lg p-12 text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {viewMode === 'active' ? 'No items yet' : 'No archived items'}
                                </h2>
                                <p className="text-gray-400">
                                    {viewMode === 'active'
                                        ? 'Add parts and items you need to purchase'
                                        : 'Archived items appear here for 12 months'}
                                </p>
                            </div>
                        ) : (
                            displayItems.map((item) => (
                                <ShoppingListItem
                                    key={item.id}
                                    item={item}
                                    onSwipeRight={viewMode === 'active' ? () => markItemOrdered(item.id) : undefined}
                                    onSwipeLeft={viewMode === 'active' ? () => archiveItem(item.id) : undefined}
                                />
                            ))
                        )}
                    </div>

                    {/* Instructions */}
                    {viewMode === 'active' && activeItems.length > 0 && (
                        <div className="mt-6 bg-blue-900 border border-blue-600 rounded-lg p-4">
                            <p className="text-blue-100 text-sm">
                                <strong>Swipe right</strong> to mark as ordered • <strong>Swipe left</strong> to archive
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
