'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requestJoinTeam, getTeamMember } from '@/lib/firebase/services/member.service';
import type { Team } from '@/types/domain/team.types';

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const inviteCode = params.code as string;
    const { user, loading: authLoading } = useAuth();

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [memberStatus, setMemberStatus] = useState<'none' | 'pending' | 'active'>('none');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTeam() {
            if (!inviteCode || inviteCode.length !== 8) {
                setError('Invalid invite code');
                setLoading(false);
                return;
            }

            try {
                // Find team by invite code
                const teamsRef = collection(db, 'teams');
                const q = query(teamsRef, where('inviteCode', '==', inviteCode.toUpperCase()));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setError('Team not found or invite link is invalid');
                    setLoading(false);
                    return;
                }

                const teamDoc = snapshot.docs[0];
                const teamData = {
                    id: teamDoc.id,
                    ...teamDoc.data(),
                    createdAt: teamDoc.data().createdAt?.toDate() || new Date(),
                    updatedAt: teamDoc.data().updatedAt?.toDate() || new Date(),
                } as Team;

                setTeam(teamData);

                // Check if user is already a member
                if (user) {
                    const member = await getTeamMember(teamData.id, user.uid);
                    if (member) {
                        setMemberStatus(member.status);
                    }
                }
            } catch (err) {
                console.error('Failed to load team:', err);
                setError('Failed to load team information');
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            loadTeam();
        }
    }, [inviteCode, user, authLoading]);

    const handleJoinRequest = async () => {
        if (!user || !team) return;

        setRequesting(true);
        setError(null);

        try {
            await requestJoinTeam(
                team.id,
                user.uid,
                user.displayName || 'Anonymous',
                user.email || undefined
            );
            setMemberStatus('pending');
        } catch (err) {
            console.error('Failed to request join:', err);
            setError(err instanceof Error ? err.message : 'Failed to send join request');
        } finally {
            setRequesting(false);
        }
    };

    const handleGoToTeam = () => {
        if (team) {
            router.push(`/teams/${team.id}`);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
                    <p className="text-gray-600 mb-6">{error || 'This invite link is not valid'}</p>
                    <button
                        onClick={() => router.push('/teams')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Teams
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <svg className="mx-auto h-16 w-16 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join {team.name}</h1>
                        {team.description && (
                            <p className="text-gray-600 mb-4">{team.description}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">You need to sign in to join this team</p>
                    </div>

                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Sign In to Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <svg className="mx-auto h-16 w-16 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h1>
                    {team.description && (
                        <p className="text-gray-600">{team.description}</p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {memberStatus === 'none' && (
                    <div>
                        <p className="text-gray-700 mb-6 text-center">
                            You've been invited to join this team. Click below to request access.
                        </p>
                        <button
                            onClick={handleJoinRequest}
                            disabled={requesting}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
                        >
                            {requesting ? 'Sending Request...' : 'Request to Join'}
                        </button>
                    </div>
                )}

                {memberStatus === 'pending' && (
                    <div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-yellow-800">Request Pending</p>
                                    <p className="text-sm text-yellow-700">Waiting for team owner approval</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/teams')}
                            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                        >
                            Back to Teams
                        </button>
                    </div>
                )}

                {memberStatus === 'active' && (
                    <div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-green-800">Already a Member</p>
                                    <p className="text-sm text-green-700">You're already part of this team</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleGoToTeam}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Go to Team
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
