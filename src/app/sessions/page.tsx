"use client";
import PrivateRoute from "@/components/auth/PrivateRoute";
import MainLayout from "@/components/layout/MainLayout";
import { useSessions } from "@/hooks/useSessions";
import SessionItem from "@/components/sessions/SessionItem";
import Link from "next/link";

export default function SessionsPage() {
    const { sessions, loading } = useSessions();

    return (
        <PrivateRoute>
            <MainLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-app-text">Sessions History</h1>
                        <Link
                            href="/sessions/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 transition-colors"
                        >
                            Log Session
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-app-text">Loading sessions...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-10 bg-white border border-app-border rounded-lg shadow-sm">
                            <p className="text-text-subtle mb-4">No sessions logged yet. Start tracking your track days!</p>
                            <Link
                                href="/sessions/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                                Log First Session
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {sessions.map((session) => (
                                <SessionItem key={session.id} session={session} />
                            ))}
                        </div>
                    )}
                </div>
            </MainLayout>
        </PrivateRoute>
    );
}
