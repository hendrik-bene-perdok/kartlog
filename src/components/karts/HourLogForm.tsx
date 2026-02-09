/**
 * HourLogForm Component
 * Feature: 004-maintenance-core
 * 
 * Touch-friendly form for logging session hours
 */

'use client';

import React, { useState } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { createSessionLogInputSchema, getFirstErrorMessage } from '@/lib/validation/schemas';

interface HourLogFormProps {
    onSubmit: (durationMinutes: number, notes?: string) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
}

/**
 * HourLogForm - Garage-optimized form for hour logging
 * 
 * Features:
 * - Large number input (glove-friendly)
 * - Quick preset buttons (15, 30, 45, 60 minutes)
 * - Optional notes field
 * - Client-side validation
 * - Loading state
 * 
 * @param onSubmit - Callback when form is submitted
 * @param onCancel - Optional callback when cancelled
 * @param loading - Loading state for submit button
 */
export function HourLogForm({ onSubmit, onCancel, loading = false }: HourLogFormProps) {
    const [durationMinutes, setDurationMinutes] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handlePresetClick = (minutes: number) => {
        setDurationMinutes(String(minutes));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate input
        const validation = createSessionLogInputSchema.safeParse({
            kartId: 'temp', // Will be provided by parent
            durationMinutes: parseInt(durationMinutes, 10),
            notes: notes || undefined,
        });

        if (!validation.success) {
            setError(getFirstErrorMessage(validation.error));
            return;
        }

        try {
            await onSubmit(validation.data.durationMinutes, validation.data.notes);

            // Reset form on success
            setDurationMinutes('');
            setNotes('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log hours');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duration Input */}
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-app-text mb-2">
                    Session Duration (minutes)
                </label>
                <input
                    id="duration"
                    type="number"
                    inputMode="numeric"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="45"
                    className="w-full px-6 py-4 bg-white border border-app-border rounded-lg text-app-text placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary text-3xl font-bold text-center touch-manipulation shadow-sm"
                    disabled={loading}
                    min="1"
                    max="1440"
                    autoFocus
                />
                {error && (
                    <p className="mt-2 text-sm text-status-due">{error}</p>
                )}
            </div>

            {/* Quick Presets */}
            <div>
                <p className="text-sm font-medium text-app-text mb-3">Quick Presets</p>
                <div className="grid grid-cols-4 gap-3">
                    {[15, 30, 45, 60].map((minutes) => (
                        <TouchButton
                            key={minutes}
                            type="button"
                            variant="secondary"
                            size="lg"
                            onClick={() => handlePresetClick(minutes)}
                            disabled={loading}
                            className="text-lg font-bold"
                        >
                            {minutes}m
                        </TouchButton>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <TouchButton
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={() => handlePresetClick(90)}
                        disabled={loading}
                        className="text-lg font-bold"
                    >
                        90m (1.5h)
                    </TouchButton>
                    <TouchButton
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={() => handlePresetClick(120)}
                        disabled={loading}
                        className="text-lg font-bold"
                    >
                        120m (2h)
                    </TouchButton>
                </div>
            </div>

            {/* Notes Input */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-app-text mb-2">
                    Notes (optional)
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Great lap times today!"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-app-border rounded-lg text-app-text placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary text-base touch-manipulation resize-none shadow-sm"
                    disabled={loading}
                    maxLength={200}
                />
                <p className="mt-1 text-xs text-text-subtle text-right">
                    {notes.length}/200 characters
                </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
                <TouchButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !durationMinutes}
                    className="flex-1"
                >
                    {loading ? 'Logging...' : 'Log Session'}
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

            {/* Info Text */}
            <p className="text-xs text-text-subtle text-center">
                Hours will be automatically added to your kart's total engine hours.
                Maintenance tasks will be created when thresholds are reached.
            </p>
        </form>
    );
}
