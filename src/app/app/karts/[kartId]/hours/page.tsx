/**
 * Hour Logging Page
 * Feature: 004-maintenance-core
 * 
 * Page for logging session hours and viewing session history
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSingleKart } from '@/hooks/useKarts';
import { useSessionLogs } from '@/hooks/useSessionLogs';
import { useTeam } from '@/hooks/useTeam';
import { HourLogForm } from '@/components/karts/HourLogForm';
import { SessionHistoryList } from '@/components/karts/SessionHistoryList';
import { TouchButton } from '@/components/ui/TouchButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';

export default function HourLoggingPage() {
    const params = useParams();
    const router = useRouter();
    const kartId = params.kartId as string;
    const { team } = useTeam();

    const { kart, loading: kartLoading } = useSingleKart(team?.id || '', kartId);
    const { sessions, createSessionLog, loading: sessionsLoading, refetch } = useSessionLogs(team?.id || '', kartId);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleLogSession = async (durationMinutes: number, notes?: string) => {
        setSubmitting(true);
        try {
            await createSessionLog(durationMinutes, notes);

            // Show success message
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);

            // Refetch sessions to update list
            await refetch();
        } finally {
            setSubmitting(false);
        }
    };

    if (kartLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    if (!kart) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Kart Not Found</h2>
                    <p className="text-gray-300 mb-4">The requested kart does not exist.</p>
                    <TouchButton onClick={() => router.push('/app/karts')} variant="primary">
                        Back to Garage
                    </TouchButton>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 p-4 pb-24">
                {/* Header */}
                <div className="max-w-4xl mx-auto mb-6">
                    <Link href={`/app/karts/${kartId}`} className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
                        ← Back to {kart.name}
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Log Session Hours</h1>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-blue-400">
                            {kart.totalEngineHours.toFixed(1)}
                        </span>
                        <span className="text-gray-400">hours logged</span>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="max-w-4xl mx-auto mb-6">
                        <div className="bg-green-900 border border-green-600 rounded-lg p-4 flex items-center gap-3">
                            <svg
                                className="w-6 h-6 text-green-400"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p className="text-green-100 font-medium">Session logged successfully!</p>
                                <p className="text-green-200 text-sm">
                                    Maintenance tasks updated based on current engine hours
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Log Form */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <HourLogForm
                            onSubmit={handleLogSession}
                            loading={submitting}
                        />
                    </div>
                </div>

                {/* Session History */}
                <div className="max-w-4xl mx-auto">
                    <SessionHistoryList
                        sessions={sessions}
                        loading={sessionsLoading}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
