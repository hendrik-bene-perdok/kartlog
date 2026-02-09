'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTeamById, updateTeam, deleteTeam } from '@/lib/firebase/services/team.service';
import { UpdateTeamSchema } from '@/lib/contracts/team.schema';
import type { Team, UpdateTeamInput } from '@/types/domain/team.types';

export default function TeamSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.teamId as string;
    const { user } = useAuth();

    const [team, setTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState<UpdateTeamInput>({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        async function loadTeam() {
            try {
                const teamData = await getTeamById(teamId);
                if (!teamData) {
                    setError('Team not found');
                    setLoading(false);
                    return;
                }
                setTeam(teamData);
                setFormData({
                    name: teamData.name,
                    description: teamData.description,
                });
            } catch (err) {
                console.error('Failed to load team:', err);
                setError('Failed to load team');
            } finally {
                setLoading(false);
            }
        }

        loadTeam();
    }, [teamId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !team) return;

        setSaving(true);
        setError(null);

        try {
            const validated = UpdateTeamSchema.parse(formData);
            await updateTeam(teamId, validated);

            // Reload team data
            const updated = await getTeamById(teamId);
            if (updated) setTeam(updated);

            // Show success feedback (optional)
            alert('Team updated successfully!');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to update team');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !team) return;

        // Only owner can delete
        if (team.ownerId !== user.uid) {
            setError('Only the team owner can disband the team');
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            await deleteTeam(teamId);
            router.push('/teams');
        } catch (err) {
            console.error('Failed to delete team:', err);
            setError('Failed to disband team');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-app-text mb-4">Team Not Found</h2>
                    <button
                        onClick={() => router.push('/teams')}
                        className="text-primary hover:underline"
                    >
                        Back to Teams
                    </button>
                </div>
            </div>
        );
    }

    const isOwner = user && team.ownerId === user.uid;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl text-app-text">
            <div className="mb-6">
                <button
                    onClick={() => router.push(`/teams/${teamId}`)}
                    className="text-primary hover:underline flex items-center gap-2 mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Team
                </button>
                <h1 className="text-3xl font-bold">Team Settings</h1>
                <p className="text-text-subtle mt-2">{team.name}</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Update Team Form */}
            <form onSubmit={handleSave} className="bg-white border border-app-border rounded-lg p-6 mb-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-app-text">Team Details</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-app-text">
                            Team Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-app-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-app-text"
                            disabled={!isOwner}
                            minLength={3}
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2 text-app-text">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-app-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-app-text"
                            rows={4}
                            disabled={!isOwner}
                            maxLength={200}
                        />
                    </div>

                    {isOwner && (
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 transition shadow-sm"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </form>

            {/* Danger Zone */}
            {isOwner && (
                <div className="bg-white border border-red-300 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-700 mb-4">Danger Zone</h2>
                    <p className="text-gray-600 mb-4">
                        Disbanding a team is permanent and cannot be undone. All team data including lists and chat history will be deleted.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition"
                        >
                            Disband Team
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 p-4 rounded">
                                <p className="font-semibold text-red-800 mb-2">Are you absolutely sure?</p>
                                <p className="text-sm text-red-700">
                                    This will permanently delete <strong>{team.name}</strong> and all associated data.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 transition"
                                >
                                    {deleting ? 'Disbanding...' : 'Yes, Disband Team'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isOwner && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                        Only the team owner can modify these settings.
                    </p>
                </div>
            )}
        </div>
    );
}
