/**
 * ShoppingListItem Component
 * Feature: 004-maintenance-core
 * 
 * Swipeable item with photo display
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { getPhoto } from '@/lib/indexedDB/photoRepository';
import type { ShoppingListItem as ShoppingListItemType } from '@/types/maintenance';

interface ShoppingListItemProps {
    item: ShoppingListItemType;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onClick?: () => void;
}

export function ShoppingListItem({ item, onSwipeLeft, onSwipeRight, onClick }: ShoppingListItemProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (item.photoId) {
            getPhoto(item.photoId).then(photo => {
                if (photo) {
                    const url = URL.createObjectURL(photo.blob);
                    setPhotoUrl(url);
                    return () => URL.revokeObjectURL(url);
                }
            });
        }
    }, [item.photoId]);

    return (
        <SwipeableCard
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
        >
            <div className="flex gap-3" onClick={onClick}>
                {photoUrl && (
                    <img
                        src={photoUrl}
                        alt={item.description}
                        className="w-16 h-16 object-cover rounded"
                    />
                )}
                <div className="flex-1">
                    <p className="text-app-text font-medium">{item.description}</p>
                    <p className="text-sm text-text-subtle">
                        {item.status === 'ordered' ? '📦 Ordered' : '🛒 Active'}
                    </p>
                </div>
            </div>
        </SwipeableCard>
    );
}
