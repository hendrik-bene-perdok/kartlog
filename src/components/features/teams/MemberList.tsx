'use client';

import { useState } from 'react';
import type { TeamMember } from '@/types/domain/team.types';
import { approveMember, rejectMember, removeMember } from '@/lib/firebase/services/member.service';

interface MemberListProps {
    teamId: string;
    members: TeamMember[];
    currentUserId: string;
    isOwnerOrAdmin: boolean;
    onMemberUpdate: () => void;
}

export function MemberList({ teamId, members, currentUserId, isOwnerOrAdmin, onMemberUpdate }: MemberListProps) {
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const activeMembers = members.filter(m => m.status === 'active');
    const pendingMembers = members.filter(m => m.status === 'pending');

    const handleApprove = async (userId: string) => {
        setProcessing(userId);
        setError(null);
        try {
            await approveMember(teamId, userId);
            onMemberUpdate();
        } catch (err) {
            setError('Failed to approve member');
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (userId: string) => {
        setProcessing(userId);
        setError(null);
        try {
            await rejectMember(teamId, userId);
            onMemberUpdate();
        } catch (err) {
            setError('Failed to reject member');
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        setProcessing(userId);
        setError(null);
        try {
            await removeMember(teamId, userId);
            onMemberUpdate();
        } catch (err) {
            setError('Failed to remove member');
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Pending Members */}
            {pendingMembers.length > 0 && isOwnerOrAdmin && (
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending Requests ({pendingMembers.length})
                    </h3>
                    <div className="space-y-2">
                        {pendingMembers.map(member => (
                            <div
                                key={member.uid}
                                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between"
                                data-status="pending"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{member.displayName}</p>
                                    {member.email && (
                                        <p className="text-sm text-gray-600">{member.email}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requested {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(member.uid)}
                                        disabled={processing === member.uid}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition text-sm"
                                        data-action="approve"
                                    >
                                        {processing === member.uid ? '...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(member.uid)}
                                        disabled={processing === member.uid}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition text-sm"
                                    >
                                        {processing === member.uid ? '...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Members */}
            <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Members ({activeMembers.length})
                </h3>
                <div className="space-y-2">
                    {activeMembers.map(member => (
                        <div
                            key={member.uid}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition"
                            data-status="active"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-700 font-semibold">
                                        {member.displayName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{member.displayName}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>
                                        {member.uid === currentUserId && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    {member.email && (
                                        <p className="text-sm text-gray-600">{member.email}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {isOwnerOrAdmin && member.uid !== currentUserId && member.role !== 'owner' && (
                                <button
                                    onClick={() => handleRemove(member.uid)}
                                    disabled={processing === member.uid}
                                    className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition text-sm"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
