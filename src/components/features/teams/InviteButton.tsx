'use client';

import { useState } from 'react';
import { regenerateInviteCode } from '@/lib/firebase/services/team.service';

interface InviteButtonProps {
    teamId: string;
    inviteCode?: string;
    inviteCodeExpiresAt?: Date; // Ensure you pass this from the parent
    role: 'owner' | 'admin' | 'member';
}

export default function InviteButton({ teamId, inviteCode, inviteCodeExpiresAt, role }: InviteButtonProps) {
    const [code, setCode] = useState(inviteCode || '');
    const [expiration, setExpiration] = useState<Date | undefined>(inviteCodeExpiresAt);
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    if (role !== 'owner' && role !== 'admin') {
        return null;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        if (!confirm('This will invalidate the previous invite code. Continue?')) return;

        setLoading(true);
        try {
            const newCode = await regenerateInviteCode(teamId);
            setCode(newCode);
            setExpiration(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Optimistic update
        } catch (error) {
            console.error('Failed to regenerate code:', error);
            alert('Failed to regenerate code.');
        } finally {
            setLoading(false);
        }
    };

    const isExpired = expiration ? new Date() > expiration : false; // Or if undefined?

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0 1 1 0 002 0z" />
                </svg>
                Invite Member
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-900">Invite Code</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center mb-2">
                            <code className={`text-lg font-mono font-bold tracking-wider ${isExpired ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {code || 'No Code'}
                            </code>
                            <button
                                onClick={handleCopy}
                                className={`text-xs px-2 py-1 rounded border ${copied ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        {expiration && (
                            <p className={`text-xs mb-3 ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                {isExpired
                                    ? 'Code Expired'
                                    : `Expires at: ${expiration.toLocaleTimeString()} ${expiration.toLocaleDateString()}`
                                }
                            </p>
                        )}

                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="w-full text-center py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Regenerate Code'}
                        </button>

                        <p className="mt-3 text-xs text-gray-500">
                            Share this code with teammates. They can join using this code on the main page.
                            Regenerating will invalidate the old code immediately.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
