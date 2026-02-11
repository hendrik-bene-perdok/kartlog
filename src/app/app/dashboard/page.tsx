"use client";
import Link from "next/link";
import { useTeam } from "@/hooks/useTeam";
import InviteMember from "@/components/teams/InviteMember";

export default function DashboardPage() {
    const { team, loading, error } = useTeam();

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading team...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!team) return <div className="text-center py-10"><h2 className="text-xl font-bold">No Team Found</h2></div>;

    return (
        <div className="space-y-6">
            <header className="bg-white shadow px-4 py-5 sm:px-6">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {team.name}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Created on {team.createdAt?.toDate().toLocaleDateString()}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-5 sm:px-6">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Quick Actions
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 p-4 space-y-4">
                        <Link href="/app/parts/new" className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            Add New Part
                        </Link>
                        <Link href="/app/sessions/new" className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                            Log Session
                        </Link>
                    </div>
                </div>

                <InviteMember team={team} />
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg px-4 py-5 sm:px-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Team Members</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {Object.entries(team.members || {}).map(([uid, role]) => (
                        <li key={uid} className="py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        User ID: {uid}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        Role: {role}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
