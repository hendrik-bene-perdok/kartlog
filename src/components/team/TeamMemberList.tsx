/**
 * TeamMemberList Component
 * Feature: 001-dashboard-refactor
 * 
 * Display list of team members with roles and status
 */

'use client';

import React from 'react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt?: { seconds: number };
}

interface TeamMemberListProps {
    members: TeamMember[];
    currentUserId?: string;
    onMemberClick?: (memberId: string) => void;
    className?: string;
}

/**
 * TeamMemberList - Display team members
 * 
 * Features:
 * - Member name and email
 * - Role badges
 * - Current user indicator
 * - Join date
 * - Optional click handler
 * 
 * @param members - Array of team members
 * @param currentUserId - Current user's ID for highlighting
 * @param onMemberClick - Optional callback when member is clicked
 * @param className - Additional CSS classes
 */
export function TeamMemberList({
    members,
    currentUserId,
    onMemberClick,
    className = ''
}: TeamMemberListProps) {
    if (members.length === 0) {
        return (
            <div className={`bg-white border border-app-border rounded-lg p-8 text-center ${className}`}>
                <p className="text-text-subtle">No team members</p>
            </div>
        );
    }

    const roleColors = {
        owner: 'bg-purple-600 text-white',
        admin: 'bg-blue-600 text-white',
        member: 'bg-gray-600 text-white',
    };

    const roleLabels = {
        owner: 'Owner',
        admin: 'Admin',
        member: 'Member',
    };

    const formatDate = (timestamp: { seconds: number }) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className={`bg-white border border-app-border rounded-lg overflow-hidden ${className}`}>
            <div className="divide-y divide-app-border">
                {members.map((member) => {
                    const isCurrentUser = member.id === currentUserId;

                    return (
                        <div
                            key={member.id}
                            onClick={() => onMemberClick?.(member.id)}
                            className={`p-4 ${onMemberClick ? 'cursor-pointer hover:bg-app-bg' : ''} ${isCurrentUser ? 'bg-blue-50/50' : ''} transition-colors`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-app-text">
                                            {member.name}
                                            {isCurrentUser && (
                                                <span className="ml-2 text-xs text-primary">(You)</span>
                                            )}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-text-subtle mb-2">{member.email}</p>
                                    {member.joinedAt && (
                                        <p className="text-xs text-text-subtle">
                                            Joined {formatDate(member.joinedAt)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[member.role]}`}>
                                        {roleLabels[member.role]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
