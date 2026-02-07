"use client";
import { Part } from "@/types";
import Link from "next/link";

export default function PartCard({ part }: { part: Part }) {
    const statusColors = {
        active: "bg-green-100 text-green-800",
        maintenance: "bg-yellow-100 text-yellow-800",
        retired: "bg-gray-100 text-gray-800"
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{part.name}</h3>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[part.status]}`}>
                        {part.status}
                    </span>
                </div>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Type: <span className="font-medium capitalize">{part.type}</span></p>
                    <p>Serial: <span className="font-medium">{part.serialNumber}</span></p>
                    {part.type === 'engine' && 'hours' in part && (
                        <p>Hours: <span className="font-medium">{part.hours}</span></p>
                    )}
                    {part.type === 'chassis' && 'modelYear' in part && (
                        <p>Year: <span className="font-medium">{part.modelYear}</span></p>
                    )}
                    {part.type === 'tire' && 'condition' in part && (
                        <p>Condition: <span className="font-medium capitalize">{part.condition}</span></p>
                    )}
                </div>
                <div className="mt-4">
                    <Link
                        href={`/parts/${part.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                        Edit →
                    </Link>
                </div>
            </div>
        </div>
    );
}
