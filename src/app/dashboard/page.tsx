"use client";

import PrivateRoute from "@/components/auth/PrivateRoute";
import MainLayout from "@/components/layout/MainLayout";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";

export default function DashboardPage() {
    return (
        <PrivateRoute>
            <MainLayout>
                <EnhancedDashboard />
            </MainLayout>
        </PrivateRoute>
    );
}
