'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSingleKart } from '@/hooks/useKarts';
import { useTasks } from '@/hooks/useTasks';
import { EnhancedKartDetail } from '@/components/karts/EnhancedKartDetail';
import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

// Define locally to avoid type errors until generic types are updated
interface ServiceInterval {
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    unit: 'hours';
}

export default function KartDetailPage() {
    const params = useParams();
    const kartId = params?.kartId as string;
    const router = useRouter();

    const { kart, loading: kartLoading, error: kartError } = useSingleKart(kartId);
    // Fetch all tasks for history
    const { tasks, loading: tasksLoading } = useTasks(kartId, true);

    if (kartLoading) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                        <div className="text-white">Loading...</div>
                    </div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    if (kartError || !kart) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
                        <EmptyState
                            icon="🏎️"
                            title="Kart Not Found"
                            description="The kart you are looking for does not exist or you don't have permission to view it."
                            action={
                                <Link href="/karts" className="text-blue-400 hover:text-blue-300">
                                    Back to Garage
                                </Link>
                            }
                        />
                    </div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    // Use empty intervals for now until data model is fully migrated
    const serviceIntervals: ServiceInterval[] = [];

    return (
        <PrivateRoute>
            <MainLayout>
                <EnhancedKartDetail
                    kart={kart}
                    tasks={tasks || []}
                    serviceIntervals={serviceIntervals}
                    onTaskClick={(taskId) => router.push(`/karts/${kartId}/tasks?edit=${taskId}`)}
                />
            </MainLayout>
        </PrivateRoute>
    );
}
