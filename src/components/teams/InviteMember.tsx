"use client";
import React, { useState } from "react";
import { Team } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function InviteMember({ team }: { team: Team }) {
    const [loading, setLoading] = useState(false);

    const generateCode = async () => {
        setLoading(true);
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        await updateDoc(doc(db, "teams", team.id), { inviteCode: code });
        setLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded shadow mt-4">
            <h3 className="text-lg font-medium text-gray-900">Invite Members</h3>
            {team.inviteCode ? (
                <div className="mt-2">
                    <p className="text-sm text-gray-500">Share this code with your team members:</p>
                    <div className="mt-1 flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-lg font-bold">{team.inviteCode}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(team.inviteCode!)}
                            className="text-indigo-600 hover:text-indigo-500 text-sm"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={generateCode}
                    disabled={loading}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Generate Invite Code"}
                </button>
            )}
        </div>
    );
}
