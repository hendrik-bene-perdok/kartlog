/**
 * Kart Detail Page
 * Feature: 004-maintenance-core
 * 
 * Detailed view for a single kart with maintenance status and actions
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSingleKart } from '@/hooks/useKarts';
import { useMaintenanceThresholds } from '@/hooks/useMaintenanceThresholds';
import { TouchButton } from '@/components/ui/TouchButton';
import { DeleteKartDialog } from '@/components/karts/DeleteKartDialog';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Link from 'next/link';

export default function KartDetailPage() {
    const params = useParams();
    const router = useRouter();
    const kartId = params.kartId as string;

    const { kart, loading, error } = useSingleKart(kartId);
    const { zones, warningColor } = useMaintenanceThresholds(kart);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-lg">Loading kart...</div>
            </div>
        );
    }

    if (error || !kart) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Kart Not Found</h2>
                    <p className="text-gray-300 mb-4">
                        {error?.message || 'The requested kart does not exist.'}
                    </p>
                    <TouchButton onClick={() => router.push('/karts')} variant="primary">
                        Back to Garage
                    </TouchButton>
                </div>
            </div>
        );
    }

    const warningColorClasses = {
        green: 'from-green-900 to-gray-900',
        yellow: 'from-yellow-900 to-gray-900',
        red: 'from-red-900 to-gray-900',
    };

    return (
        <ErrorBoundary>
            <div className={`min-h-screen bg-gradient-to-b ${warningColorClasses[warningColor]} p-4 pb-24`}>
                {/* Header */}
                <div className="max-w-4xl mx-auto mb-6">
                    <Link href="/karts" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
                        ← Back to Garage
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">{kart.name}</h1>
                    <p className="text-2xl text-gray-300">
                        {kart.totalEngineHours.toFixed(1)} hours logged
                    </p>
                </div>

                {/* Warning Zones */}
                <div className="max-w-4xl mx-auto mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Maintenance Status</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {zones.map((zone) => {
                            const zoneColorClasses = {
                                green: 'border-green-600 bg-green-950',
                                yellow: 'border-yellow-600 bg-yellow-950',
                                red: 'border-red-600 bg-red-950',
                            };

                            return (
                                <div
                                    key={zone.thresholdType}
                                    className={`border-2 ${zoneColorClasses[zone.zone]} rounded-lg p-4`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{zone.thresholdType}</h3>
                                            <p className="text-sm text-gray-300">
                                                {zone.zone === 'green' && `Due in ${zone.hoursUntilYellow.toFixed(1)}h`}
                                                {zone.zone === 'yellow' && `Due in ${zone.hoursUntilRed.toFixed(1)}h - Medium priority`}
                                                {zone.zone === 'red' && 'Due now - High priority'}
                                            </p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full ${zone.zone === 'green' ? 'bg-green-600' :
                                                zone.zone === 'yellow' ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                            }`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4 mb-6">
                    <Link href={`/karts/${kartId}/hours`}>
                        <TouchButton variant="primary" size="lg" className="w-full">
                            📝 Log Hours
                        </TouchButton>
                    </Link>

                    <Link href={`/karts/${kartId}/settings`}>
                        <TouchButton variant="secondary" size="lg" className="w-full">
                            ⚙️ Customize Thresholds
                        </TouchButton>
                    </Link>
                </div>

                {/* Delete Button */}
                <div className="max-w-4xl mx-auto">
                    <TouchButton
                        variant="danger"
                        size="md"
                        onClick={() => setShowDeleteDialog(true)}
                        className="w-full"
                    >
                        Delete Kart
                    </TouchButton>
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteDialog && (
                    <DeleteKartDialog
                        kart={kart}
                        onClose={() => setShowDeleteDialog(false)}
                        onDeleted={() => router.push('/karts')}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
}
