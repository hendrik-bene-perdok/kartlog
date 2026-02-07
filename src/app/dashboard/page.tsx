"use client";
import PrivateRoute from "@/components/auth/PrivateRoute";
import MainLayout from "@/components/layout/MainLayout";
import { useTeam } from "@/hooks/useTeam";
import Link from "next/link";
import InviteMember from "@/components/teams/InviteMember";

export default function DashboardPage() {
    const { team, loading } = useTeam();

    return (
        <PrivateRoute>
            <MainLayout>
                {loading ? (
                    <div>Loading Team...</div>
                ) : team ? (
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
                                    <Link href="/parts/new" className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                        Add New Part
                                    </Link>
                                    <Link href="/sessions/new" className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
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
                ) : (
                    <div className="text-center py-10">
                        <h2 className="text-xl font-bold">No Team Found</h2>
                        <p>Please contact support or try creating a team.</p>
                    </div>
                )}
            </MainLayout>
        </PrivateRoute>
    );
}
