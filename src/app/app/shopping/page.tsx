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
    // Deprecated for now - simplified to redirect or show message
    // const { activeItems, archivedItems, loading, createItem, markItemOrdered, archiveItem } = useShoppingList();
    
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Shopping List Moved</h1>
                    <p className="text-gray-400 mb-6">
                        Shopping lists are now managed per-Kart. Please go to a Kart's dashboard to view its shopping list.
                    </p>
                    <TouchButton variant="primary" onClick={() => window.location.href = '/app/karts'}>
                        Go to Karts
                    </TouchButton>
                </div>
            </div>
        </ErrorBoundary>
    );
}
