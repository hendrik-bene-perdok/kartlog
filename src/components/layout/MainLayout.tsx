'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import { BottomNav } from './BottomNav';
export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-app-bg flex flex-col text-app-text">
            <OfflineIndicator />

            {/* Unified Top Header */}
            <nav className="bg-white border-b border-app-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/dashboard" className="text-xl font-bold text-app-text flex items-center gap-2">
                            <span>🏎️</span>
                            <span>Kartlog</span>
                        </Link>

                        {mounted && user && (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-status-due hover:brightness-90 transition-colors shadow-sm"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow w-full pb-24 mx-auto max-w-7xl">
                {children}
            </main>

            {/* Bottom Navigation (Always Visible) */}
            <BottomNav />
        </div>
    );
}
