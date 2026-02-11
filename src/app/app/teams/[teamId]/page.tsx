'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUser } from '@/hooks/useUser';
import { getTeamById } from '@/lib/firebase/services/team.service';
import { getTeamMember, getTeamMembers } from '@/lib/firebase/services/member.service';
import { TeamChat } from '@/components/features/teams/TeamChat';
import { MemberList } from '@/components/features/teams/MemberList';
import InviteButton from '@/components/features/teams/InviteButton';
import { TeamTabs, TeamTab } from '@/components/features/teams/TeamTabs';
import { SharedList } from '@/components/features/teams/SharedList';
import type { Team, TeamMember } from '@/types/domain/team.types';

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;
    const { user, loading: authLoading } = useAuth();
    const { profile: userProfile } = useUser();

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TeamTab>('chat');
    const [error, setError] = useState<string | null>(null);

    const loadTeamData = async () => {
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
                setError('You are not an active member of this team');
                setLoading(false);
                return;
            }
            setCurrentMember(member);

            // Load members
            const teamMembers = await getTeamMembers(teamId);
            setMembers(teamMembers);
        } catch (err) {
            console.error('Failed to load team:', err);
            setError('Failed to load team information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    if (!user || !userProfile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
                    <p className="text-gray-600">Please sign in to view this team</p>
                </div>
            </div>
        );
    }

    if (error || !team || !currentMember) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {error || 'Access Denied'}
                    </h2>
                    <button
                        onClick={() => router.push('/app/teams')}
                        className="text-blue-600 hover:underline"
                    >
                        Back to Teams
                    </button>
                </div>
            </div>
        );
    }

    const isOwnerOrAdmin = currentMember.role === 'owner' || currentMember.role === 'admin';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/app/teams"
                    className="text-blue-600 hover:underline flex items-center gap-2 mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Teams
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{team.name}</h1>
                        {team.description && (
                            <p className="text-gray-600 mt-2">{team.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {members.filter(m => m.status === 'active').length} members
                            </span>
                            <span>•</span>
                            <span>Your role: <strong className="capitalize">{currentMember.role}</strong></span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 items-center">
                        <InviteButton
                            teamId={teamId}
                            inviteCode={team.inviteCode}
                            inviteCodeExpiresAt={team.inviteCodeExpiresAt}
                            role={currentMember.role}
                        />
                        <Link
                            href={`/app/teams/${teamId}/lists`}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Lists
                        </Link>
                        {isOwnerOrAdmin && (
                            <Link
                                href={`/app/teams/${teamId}/settings`}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content */}
            {activeTab === 'chat' && (
                <TeamChat
                    teamId={teamId}
                    currentUserId={user.uid}
                    currentUserName={userProfile.displayName || 'Anonymous'}
                />
            )}

            {activeTab === 'lists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SharedList
                        teamId={teamId}
                        listType="todo"
                        currentUserId={user.uid}
                        title="Todo List"
                        placeholder="Add a task..."
                    />
                    <SharedList
                        teamId={teamId}
                        listType="buy"
                        currentUserId={user.uid}
                        title="Shopping List"
                        placeholder="Add item to buy..."
                    />
                </div>
            )}

            {activeTab === 'members' && (
                <MemberList
                    teamId={teamId}
                    members={members}
                    currentUserId={user.uid}
                    isOwnerOrAdmin={isOwnerOrAdmin}
                    onMemberUpdate={loadTeamData}
                />
            )}
        </div>
    );
}
