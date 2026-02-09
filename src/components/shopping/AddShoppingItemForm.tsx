/**
 * AddShoppingItemForm Component
 * Feature: 004-maintenance-core
 * 
 * Form with optional photo capture
 */

'use client';

import React, { useState, useRef } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { usePhotoCompression } from '@/hooks/usePhotoCompression';

interface AddShoppingItemFormProps {
    onSubmit: (description: string, photoId?: string) => Promise<void>;
    onCancel?: () => void;
}

export function AddShoppingItemForm({ onSubmit, onCancel }: AddShoppingItemFormProps) {
    const [description, setDescription] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { compressAndSave, compressing } = usePhotoCompression();

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let photoId: string | undefined;

            if (photoFile) {
                photoId = await compressAndSave(photoFile);
            }

            await onSubmit(description, photoId);

            setDescription('');
            setPhotoFile(null);
            setPhotoPreview(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Part or item description"
                className="w-full px-4 py-3 bg-white border border-app-border rounded-lg text-app-text placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                required
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
            />

            {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
            )}

            <div className="flex gap-3">
                <TouchButton
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting || compressing}
                >
                    📷 {photoPreview ? 'Change' : 'Add'} Photo
                </TouchButton>

                <TouchButton
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={submitting || compressing || !description}
                >
                    {submitting || compressing ? 'Adding...' : 'Add Item'}
                </TouchButton>

                {onCancel && (
                    <TouchButton type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </TouchButton>
                )}
            </div>
        </form>
    );
}
