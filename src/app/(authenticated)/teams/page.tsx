'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserTeams } from '@/lib/firebase/services/team.service';
import { TeamList } from '@/components/features/teams/TeamList';
import type { Team } from '@/types/domain/team.types';

export default function TeamsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTeams() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userTeams = await getUserTeams(user.uid);
                setTeams(userTeams);
            } catch (err) {
                console.error('Failed to load teams:', err);
                setError('Failed to load teams');
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            loadTeams();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading teams...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
                    <p className="text-gray-600">Please sign in to view your teams</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Teams</h1>
                    <p className="text-gray-600 mt-2">
                        {teams.length === 0 ? 'No teams yet' : `${teams.length} team${teams.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <Link
                    href="/teams/create"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Team
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {teams.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No teams yet</h3>
                    <p className="mt-2 text-gray-500">Get started by creating your first team</p>
                    <Link
                        href="/teams/create"
                        className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Create Your First Team
                    </Link>
                </div>
            ) : (
                <TeamList teams={teams} />
            )}
        </div>
    );
}
