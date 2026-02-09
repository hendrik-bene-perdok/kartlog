/**
 * Karts Dashboard Page
 * Feature: 004-maintenance-core
 * 
 * Main dashboard showing all karts with warning zone indicators
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useKarts } from '@/hooks/useKarts';
import { KartCard } from '@/components/karts/KartCard';
import { KartForm } from '@/components/karts/KartForm';
import { TouchButton } from '@/components/ui/TouchButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { scheduleCleanup } from '@/lib/services/archiveCleanup';

import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';

export default function KartsDashboardPage() {
    const { karts, loading, error, createKart } = useKarts();
    const [showForm, setShowForm] = useState(false);

    // Schedule archive cleanup on mount
    useEffect(() => {
        scheduleCleanup();
    }, []);

    const handleCreateKart = async (name: string) => {
        await createKart(name);
        setShowForm(false);
    };

    if (loading) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="flex items-center justify-center h-full min-h-[50vh]">
                        <div className="text-app-text text-lg">Loading karts...</div>
                    </div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    if (error) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="flex items-center justify-center p-4 min-h-[50vh]">
                        <div className="max-w-md w-full bg-white border border-app-border rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-status-due mb-2">Error Loading Karts</h2>
                            <p className="text-text-subtle">{error.message}</p>
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
                            <h1 className="text-3xl font-bold text-app-text mb-2">Garage</h1>
                            <p className="text-text-subtle">Manage your karts and track maintenance schedules</p>
                        </div>

                        {/* Add Kart Button/Form */}
                        <div className="max-w-4xl mx-auto mb-6">
                            {showForm ? (
                                <div className="bg-white border border-app-border rounded-lg p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-app-text mb-4">Add New Kart</h2>
                                    <KartForm
                                        onSubmit={handleCreateKart}
                                        onCancel={() => setShowForm(false)}
                                    />
                                </div>
                            ) : (
                                <TouchButton
                                    onClick={() => setShowForm(true)}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                >
                                    + Add Kart
                                </TouchButton>
                            )}
                        </div>

                        {/* Karts Grid */}
                        {karts.length === 0 ? (
                            <div className="max-w-4xl mx-auto bg-white border border-app-border rounded-lg p-12 text-center shadow-sm">
                                <div className="text-6xl mb-4">🏎️</div>
                                <h2 className="text-2xl font-bold text-app-text mb-2">No Karts Yet</h2>
                                <p className="text-text-subtle mb-6">
                                    Add your first kart to start tracking maintenance and engine hours
                                </p>
                                {!showForm && (
                                    <TouchButton
                                        onClick={() => setShowForm(true)}
                                        variant="primary"
                                        size="lg"
                                    >
                                        Add Your First Kart
                                    </TouchButton>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                                {karts.map((kart) => (
                                    <KartCard
                                        key={kart.id}
                                        kart={kart}
                                        pendingTaskCount={0} // TODO: Get from useTasks in Phase 6
                                    // lastSessionDate={undefined} // TODO: Get from useSessionLogs in Phase 4
                                    />
                                ))}
                            </div>
                        )}

                        {/* Stats Footer */}
                        {karts.length > 0 && (
                            <div className="max-w-4xl mx-auto mt-8 grid grid-cols-3 gap-4">
                                <div className="bg-white border border-app-border rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-3xl font-bold text-primary">{karts.length}</div>
                                    <div className="text-sm text-text-subtle">Total Karts</div>
                                </div>
                                <div className="bg-white border border-app-border rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-3xl font-bold text-app-text">
                                        {karts.reduce((sum, k) => sum + k.totalEngineHours, 0).toFixed(1)}
                                    </div>
                                    <div className="text-sm text-text-subtle">Total Hours</div>
                                </div>
                                <div className="bg-white border border-app-border rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-3xl font-bold text-status-good">
                                        {karts.filter(k => k.totalEngineHours > 0).length}
                                    </div>
                                    <div className="text-sm text-text-subtle">Active Karts</div>
                                </div>
                            </div>
                        )}
                    </div>
                </ErrorBoundary>
            </MainLayout>
        </PrivateRoute>
    );
}
