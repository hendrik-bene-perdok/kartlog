/**
 * Enhanced Dashboard Component
 * Feature: 001-dashboard-refactor
 * 
 * Team dashboard with quick actions and member list using new design system
 */

'use client';

import React from 'react';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { TeamMemberList } from '@/components/team/TeamMemberList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTeam } from '@/hooks/useTeam';
import { useUser } from '@/hooks/useUser';
import { useKarts } from '@/hooks/useKarts';
import { useTasks } from '@/hooks/useTasks';
import Link from 'next/link';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
}

export function EnhancedDashboard() {
    const { team, loading: teamLoading } = useTeam();
    const { profile } = useUser();
    const { karts } = useKarts();
    const { tasks } = useTasks();

    if (teamLoading) {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center">
                <div className="text-app-text text-lg">Loading dashboard...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-app-bg p-4 flex items-center justify-center">
                <EmptyState
                    icon="👥"
                    title="No Team Found"
                    description="You need to be part of a team to access the dashboard. Please create or join a team to get started."
                    action={
                        <Link
                            href="/teams"
                            className="inline-block bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm"
                        >
                            Go to Teams
                        </Link>
                    }
                />
            </div>
        );
    }

    // Calculate statistics
    const pendingTasksCount = tasks?.filter(t => t.status === 'pending').length || 0;
    const totalKarts = karts?.length || 0;
    const activeKarts = karts?.filter(k => k.totalEngineHours > 0).length || 0;

    // Convert team members to expected format
    const teamMembers: TeamMember[] = Object.entries(team.members || {}).map(([uid, role]) => ({
        id: uid,
        name: `User ${uid.substring(0, 8)}`, // In real app, fetch user names
        email: `user-${uid.substring(0, 8)}@example.com`, // In real app, fetch user emails
        role: role as 'owner' | 'admin' | 'member',
    }));

    return (
        <div className="min-h-screen bg-app-bg p-4 pb-24">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <h1 className="text-3xl font-bold text-app-text mb-2">{team.name}</h1>
                <p className="text-text-subtle">
                    Team Dashboard • {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="max-w-6xl mx-auto mb-6">
                <h2 className="text-xl font-bold text-app-text mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickActionCard
                        title="Garage"
                        description="View and manage your karts"
                        icon="🏎️"
                        href="/karts"
                        badge={totalKarts}
                        variant="primary"
                    />
                    <QuickActionCard
                        title="Tasks"
                        description="Pending maintenance tasks"
                        icon="📋"
                        href="/karts"
                        badge={pendingTasksCount}
                        variant={pendingTasksCount > 0 ? 'warning' : 'secondary'}
                    />
                    <QuickActionCard
                        title="Parts Inventory"
                        description="Manage your parts stock"
                        icon="🔧"
                        href="/parts"
                        variant="secondary"
                    />
                    <QuickActionCard
                        title="Sessions"
                        description="Log track sessions"
                        icon="⏱️"
                        href="/sessions"
                        variant="secondary"
                    />
                    <QuickActionCard
                        title="Shopping List"
                        description="Items to purchase"
                        icon="🛒"
                        href="/shopping"
                        variant="secondary"
                    />
                    <QuickActionCard
                        title="Team Settings"
                        description="Manage team and members"
                        icon="⚙️"
                        href="/teams"
                        variant="secondary"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-app-border rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-primary">{totalKarts}</div>
                        <div className="text-sm text-text-subtle">Total Karts</div>
                    </div>
                    <div className="bg-white border border-app-border rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-status-good">{activeKarts}</div>
                        <div className="text-sm text-text-subtle">Active Karts</div>
                    </div>
                    <div className="bg-white border border-app-border rounded-lg p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-status-due">{pendingTasksCount}</div>
                        <div className="text-sm text-text-subtle">Pending Tasks</div>
                    </div>
                </div>
            </div>

            {/* Team Members */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-app-text mb-4">Team Members</h2>
                <TeamMemberList
                    members={teamMembers}
                    currentUserId={profile?.id}
                />
            </div>
        </div>
    );
}
