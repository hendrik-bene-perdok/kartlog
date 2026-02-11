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
import { useTeam } from '@/hooks/useTeam';
import { TouchButton } from '@/components/ui/TouchButton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';
import type { MaintenanceThreshold } from '@/types/maintenance';

export default function KartSettingsPage() {
    const { team } = useTeam();
    const params = useParams();
    const kartId = params.kartId as string;
    const { kart, loading } = useSingleKart(team?.id || '', kartId);
    const { updateKart } = useKarts(team?.id || '');
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
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>;
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 p-4 pb-24">
                <div className="max-w-4xl mx-auto">
                    <Link href={`/app/karts/${kartId}`} className="text-blue-400 hover:text-blue-300 mb-4 inline-block">← Back</Link>
                    <h1 className="text-3xl font-bold text-white mb-6">Kart Settings</h1>

                    {/* Manual Link */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Manual Access</h2>
                        <label className="block text-sm text-gray-300 mb-2">Manufacturer's Manual URL</label>
                        <input
                            type="url"
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                            placeholder="https://example.com/manual.pdf"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-3"
                        />
                        {manualUrl && (
                            <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                                📖 Open Manual →
                            </a>
                        )}
                    </div>

                    {/* Thresholds */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Maintenance Thresholds</h2>
                        {thresholds.map((threshold, index) => (
                            <div key={index} className="mb-6 border-b border-gray-700 pb-6">
                                <h3 className="font-bold text-white mb-3">{threshold.type}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Interval (hours)</label>
                                        <input
                                            type="number"
                                            value={threshold.intervalHours}
                                            onChange={(e) => updateThreshold(index, 'intervalHours', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Yellow Warning</label>
                                        <input
                                            type="number"
                                            value={threshold.yellowWarningHours}
                                            onChange={(e) => updateThreshold(index, 'yellowWarningHours', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Red Warning</label>
                                        <input
                                            type="number"
                                            value={threshold.redWarningHours}
                                            onChange={(e) => updateThreshold(index, 'redWarningHours', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
    );
}
