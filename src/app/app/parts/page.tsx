"use client";
import { useParts } from "@/hooks/useParts";
import PartCard from "@/components/parts/PartCard";
import Link from "next/link";

export default function PartsPage() {
    const { parts, loading } = useParts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Parts Inventory</h1>
                <Link
                    href="/app/parts/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add Part
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading parts...</div>
            ) : parts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500 mb-4">No parts yet. Add your first part!</p>
                    <Link
                        href="/app/parts/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                        Add Part
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {parts.map((part) => (
                        <PartCard key={part.id} part={part} />
                    ))}
                </div>
            )}
        </div>
    );
}
