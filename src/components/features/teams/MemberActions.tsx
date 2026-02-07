'use client';

import { useState } from 'react';
import type { TeamMember, TeamRole } from '@/types/domain/team.types';
import { assignRole, transferOwnership } from '@/lib/firebase/services/member.service';

interface MemberActionsProps {
    teamId: string;
    member: TeamMember;
    currentUserId: string;
    currentUserRole: TeamRole;
    onUpdate: () => void;
}

export function MemberActions({ teamId, member, currentUserId, currentUserRole, onUpdate }: MemberActionsProps) {
    const [processing, setProcessing] = useState(false);
    const [showTransferConfirm, setShowTransferConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canManageRole = currentUserRole === 'owner' && member.uid !== currentUserId;
    const canTransferOwnership = currentUserRole === 'owner' && member.role === 'admin';

    const handleRoleChange = async (newRole: 'admin' | 'member') => {
        setProcessing(true);
        setError(null);
        try {
            await assignRole(teamId, member.uid, newRole);
            onUpdate();
        } catch (err) {
            setError('Failed to update role');
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleTransferOwnership = async () => {
        setProcessing(true);
        setError(null);
        try {
            await transferOwnership(teamId, currentUserId, member.uid);
            setShowTransferConfirm(false);
            onUpdate();
        } catch (err) {
            setError('Failed to transfer ownership');
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    if (!canManageRole && !canTransferOwnership) {
        return null;
    }

    return (
        <div className="mt-2 pt-2 border-t border-gray-200">
            {error && (
                <div className="text-xs text-red-600 mb-2">{error}</div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                {/* Promote/Demote */}
                {canManageRole && member.role !== 'owner' && (
                    <>
                        {member.role === 'member' && (
                            <button
                                onClick={() => handleRoleChange('admin')}
                                disabled={processing}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50 transition"
                            >
                                {processing ? 'Processing...' : 'Promote to Admin'}
                            </button>
                        )}
                        {member.role === 'admin' && (
                            <button
                                onClick={() => handleRoleChange('member')}
                                disabled={processing}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                            >
                                {processing ? 'Processing...' : 'Demote to Member'}
                            </button>
                        )}
                    </>
                )}

                {/* Transfer Ownership */}
                {canTransferOwnership && !showTransferConfirm && (
                    <button
                        onClick={() => setShowTransferConfirm(true)}
                        className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
                    >
                        Transfer Ownership
                    </button>
                )}

                {showTransferConfirm && (
                    <div className="w-full bg-purple-50 border border-purple-200 rounded p-3 mt-2">
                        <p className="text-xs text-purple-900 font-semibold mb-2">
                            Transfer ownership to {member.displayName}?
                        </p>
                        <p className="text-xs text-purple-700 mb-3">
                            You will become an Admin. This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleTransferOwnership}
                                disabled={processing}
                                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:bg-gray-300 transition"
                            >
                                {processing ? 'Transferring...' : 'Confirm Transfer'}
                            </button>
                            <button
                                onClick={() => setShowTransferConfirm(false)}
                                className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
