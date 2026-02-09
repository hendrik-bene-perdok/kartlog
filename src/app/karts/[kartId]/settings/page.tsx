/**
 * Kart Settings Page
 * Feature: 004-maintenance-core
 * 
 * Manual access link and threshold customization
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSingleKart, useKarts } from '@/hooks/useKarts';
import { TouchButton } from '@/components/ui/TouchButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';
import type { MaintenanceThreshold } from '@/types/maintenance';
import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';

export default function KartSettingsPage() {
    const params = useParams();
    const kartId = params.kartId as string;
    const { kart, loading } = useSingleKart(kartId);
    const { updateKart } = useKarts();
    const [manualUrl, setManualUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [thresholds, setThresholds] = useState<MaintenanceThreshold[]>([]);

    React.useEffect(() => {
        if (kart) {
            setManualUrl(kart.manualAccessUrl || '');
            setThresholds(kart.thresholds);
        }
    }, [kart]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateKart(kartId, {
                manualAccessUrl: manualUrl || undefined,
                thresholds,
            });
        } finally {
            setSaving(false);
        }
    };

    const updateThreshold = (index: number, field: keyof MaintenanceThreshold, value: number) => {
        setThresholds(prev =>
            prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
        );
    };

    if (loading || !kart) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="flex items-center justify-center h-full min-h-[50vh]">
                        <div className="text-app-text">Loading...</div>
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
                        <div className="max-w-4xl mx-auto">
                            <Link href={`/karts/${kartId}`} className="text-primary hover:text-blue-600 mb-4 inline-block font-medium">← Back</Link>
                            <h1 className="text-3xl font-bold text-app-text mb-6">Kart Settings</h1>

                            {/* Manual Link */}
                            <div className="bg-white border border-app-border rounded-lg p-6 mb-6 shadow-sm">
                                <h2 className="text-xl font-bold text-app-text mb-4">Manual Access</h2>
                                <label className="block text-sm font-medium text-app-text mb-2">Manufacturer's Manual URL</label>
                                <input
                                    type="url"
                                    value={manualUrl}
                                    onChange={(e) => setManualUrl(e.target.value)}
                                    placeholder="https://example.com/manual.pdf"
                                    className="w-full px-4 py-3 bg-white border border-app-border rounded-lg text-app-text placeholder-text-subtle mb-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                />
                                {manualUrl && (
                                    <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-600 text-sm font-medium">
                                        📖 Open Manual →
                                    </a>
                                )}
                            </div>

                            {/* Thresholds */}
                            <div className="bg-white border border-app-border rounded-lg p-6 mb-6 shadow-sm">
                                <h2 className="text-xl font-bold text-app-text mb-4">Maintenance Thresholds</h2>
                                {thresholds.map((threshold, index) => (
                                    <div key={index} className="mb-6 border-b border-app-border pb-6 last:border-0 last:pb-0 last:mb-0">
                                        <h3 className="font-bold text-app-text mb-3">{threshold.type}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm text-text-subtle mb-2">Interval (hours)</label>
                                                <input
                                                    type="number"
                                                    value={threshold.intervalHours}
                                                    onChange={(e) => updateThreshold(index, 'intervalHours', parseInt(e.target.value))}
                                                    className="w-full px-4 py-2 bg-white border border-app-border rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                    min="1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-text-subtle mb-2">Yellow Warning</label>
                                                <input
                                                    type="number"
                                                    value={threshold.yellowWarningHours}
                                                    onChange={(e) => updateThreshold(index, 'yellowWarningHours', parseInt(e.target.value))}
                                                    className="w-full px-4 py-2 bg-white border border-app-border rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                    min="1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-text-subtle mb-2">Red Warning</label>
                                                <input
                                                    type="number"
                                                    value={threshold.redWarningHours}
                                                    onChange={(e) => updateThreshold(index, 'redWarningHours', parseInt(e.target.value))}
                                                    className="w-full px-4 py-2 bg-white border border-app-border rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <TouchButton onClick={handleSave} variant="primary" size="lg" className="w-full" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Settings'}
                            </TouchButton>
                        </div>
                    </div>
                </ErrorBoundary>
            </MainLayout>
        </PrivateRoute>
    );
}
