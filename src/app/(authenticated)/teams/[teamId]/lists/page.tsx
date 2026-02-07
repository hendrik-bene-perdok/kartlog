'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTeamById } from '@/lib/firebase/services/team.service';
import { getTeamMember } from '@/lib/firebase/services/member.service';
import { SharedList } from '@/components/features/teams/SharedList';
import type { Team } from '@/types/domain/team.types';

export default function TeamListsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;
    const { user, loading: authLoading } = useAuth();

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTeamData() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Load team
                const teamData = await getTeamById(teamId);
                if (!teamData) {
                    setError('Team not found');
                    setLoading(false);
                    return;
                }
                setTeam(teamData);

                // Check membership
                const member = await getTeamMember(teamId, user.uid);
                if (!member || member.status !== 'active') {
                    setError('You are not a member of this team');
                    setIsMember(false);
                } else {
                    setIsMember(true);
                }
            } catch (err) {
                console.error('Failed to load team:', err);
                setError('Failed to load team information');
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            loadTeamData();
        }
    }, [teamId, user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
                    <p className="text-gray-600">Please sign in to view team lists</p>
                </div>
            </div>
        );
    }

    if (error || !team || !isMember) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {error || 'Access Denied'}
                    </h2>
                    <button
                        onClick={() => router.push('/teams')}
                        className="text-blue-600 hover:underline"
                    >
                        Back to Teams
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push(`/teams/${teamId}`)}
                    className="text-blue-600 hover:underline flex items-center gap-2 mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Team
                </button>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <p className="text-gray-600 mt-2">Shared team lists</p>
            </div>

            {/* Lists Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Todo List */}
                <SharedList
                    teamId={teamId}
                    listType="todo"
                    currentUserId={user.uid}
                    title="To Do"
                    placeholder="Add a task..."
                />

                {/* Shopping List */}
                <SharedList
                    teamId={teamId}
                    listType="buy"
                    currentUserId={user.uid}
                    title="Shopping List"
                    placeholder="Add an item to buy..."
                />
            </div>

            {/* Helper Text */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-blue-900 font-medium">Real-time collaboration</p>
                        <p className="text-sm text-blue-700 mt-1">
                            All team members can add, complete, and remove items. Changes appear instantly for everyone!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
