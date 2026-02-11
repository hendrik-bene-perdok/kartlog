"use client";
import Link from 'next/link';
import OfflineIndicator from '@/components/ui/OfflineIndicator';

import { BottomNav } from './BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <OfflineIndicator />
            <nav className="bg-white shadow sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex w-full items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/app/dashboard" className="text-xl font-bold text-indigo-600">Kart-manager</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex-grow pb-24 sm:pb-6">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
