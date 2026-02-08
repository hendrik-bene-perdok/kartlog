/**
 * KartForm Component
 * Feature: 004-maintenance-core
 * 
 * Form for creating new karts
 */

'use client';

import React, { useState } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { createKartInputSchema } from '@/lib/validation/schemas';
import { getFirstErrorMessage } from '@/lib/validation/schemas';

interface KartFormProps {
    onSubmit: (name: string) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
}

/**
 * KartForm - Touch-friendly form for kart creation
 * 
 * Features:
 * - Large input fields for garage environment
 * - Client-side validation
 * - Loading state
 * - Error display
 * 
 * @param onSubmit - Callback when form is submitted
 * @param onCancel - Optional callback when cancelled
 * @param loading - Loading state for submit button
 */
export function KartForm({ onSubmit, onCancel, loading = false }: KartFormProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate input
        const validation = createKartInputSchema.safeParse({ name });

        if (!validation.success) {
            setError(getFirstErrorMessage(validation.error));
            return;
        }

        try {
            await onSubmit(validation.data.name);
            setName(''); // Reset form on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create kart');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="kart-name" className="block text-sm font-medium text-gray-300 mb-2">
                    Kart Name
                </label>
                <input
                    id="kart-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Kart #17"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg touch-manipulation"
                    disabled={loading}
                    autoFocus
                />
                {error && (
                    <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
            </div>

            <div className="flex gap-3">
                <TouchButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !name.trim()}
                    className="flex-1"
                >
                    {loading ? 'Creating...' : 'Create Kart'}
                </TouchButton>

                {onCancel && (
                    <TouchButton
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </TouchButton>
                )}
            </div>

            <p className="text-xs text-gray-500 text-center">
                Kart will be created with default maintenance intervals (10h oil, 25h air filter, 50h valve adjustment)
            </p>
        </form>
    );
}
