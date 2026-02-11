import React from "react";
import MainLayout from "@/components/layout/MainLayout";

export default function AppLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <MainLayout>{children}</MainLayout>;
}

