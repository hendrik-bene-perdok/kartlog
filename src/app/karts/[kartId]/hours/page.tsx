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
import { HourLogForm } from '@/components/karts/HourLogForm';
import { SessionHistoryList } from '@/components/karts/SessionHistoryList';
import { TouchButton } from '@/components/ui/TouchButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';

import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';

export default function HourLoggingPage() {
    const params = useParams();
    const router = useRouter();
    const kartId = params.kartId as string;

    const { kart, loading: kartLoading } = useSingleKart(kartId);
    const { sessions, createSessionLog, loading: sessionsLoading, refetch } = useSessionLogs(kartId);

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
            <PrivateRoute>
                <MainLayout>
                    <div className="flex items-center justify-center h-full min-h-[50vh]">
                        <div className="text-app-text text-lg">Loading...</div>
                    </div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    if (!kart) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="flex items-center justify-center p-4 min-h-[50vh]">
                        <div className="max-w-md w-full bg-white border border-app-border rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-status-due mb-2">Kart Not Found</h2>
                            <p className="text-text-subtle mb-4">The requested kart does not exist.</p>
                            <TouchButton onClick={() => router.push('/karts')} variant="primary">
                                Back to Garage
                            </TouchButton>
                        </div>
                    </div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    return (
        <PrivateRoute>
            <MainLayout>
                <ErrorBoundary>
                    <div className="p-4">
                        {/* Header */}
                        <div className="max-w-4xl mx-auto mb-6">
                            <Link href={`/karts/${kartId}`} className="text-primary hover:text-blue-600 mb-4 inline-block font-medium">
                                ← Back to {kart.name}
                            </Link>
                            <h1 className="text-3xl font-bold text-app-text mb-2">Log Session Hours</h1>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-primary">
                                    {kart.totalEngineHours.toFixed(1)}
                                </span>
                                <span className="text-text-subtle">hours logged</span>
                            </div>
                        </div>

                        {/* Success Message */}
                        {showSuccessMessage && (
                            <div className="max-w-4xl mx-auto mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                    <svg
                                        className="w-6 h-6 text-status-good"
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
                                        <p className="text-green-800 font-medium">Session logged successfully!</p>
                                        <p className="text-green-700 text-sm">
                                            Maintenance tasks updated based on current engine hours
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Log Form */}
                        <div className="max-w-4xl mx-auto mb-8">
                            <div className="bg-white border border-app-border rounded-lg p-6 shadow-sm">
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
            </MainLayout>
        </PrivateRoute>
    );
}
