'use client';

import { useRouter } from 'next/navigation';
import type { Team } from '@/types/domain/team.types';

interface TeamListProps {
    teams: Team[];
}

export function TeamList({ teams }: TeamListProps) {
    const router = useRouter();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
                <button
                    key={team.id}
                    onClick={() => router.push(`/app/teams/${team.id}`)}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                    {/* Team Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                {team.name}
                            </h3>
                            {team.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {team.description}
                                </p>
                            )}
                        </div>
                        <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>

                    {/* Team Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Team</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(team.createdAt)}</span>
                        </div>
                    </div>

                    {/* Invite Code Badge (if exists) */}
                    {team.inviteCode && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="font-mono">{team.inviteCode}</span>
                            </div>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
