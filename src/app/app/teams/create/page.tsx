'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createTeam } from '@/lib/firebase/services/team.service';
import { CreateTeamSchema } from '@/lib/contracts/team.schema';
import type { CreateTeamInput } from '@/types/domain/team.types';

export default function CreateTeamPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreateTeamInput>({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('You must be logged in to create a team');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Validate input
            const validated = CreateTeamSchema.parse(formData);

            // Create team
            const team = await createTeam(user.uid, validated);

            // Redirect to team page
            router.push(`/app/teams/${team.id}`);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to create team');
            }
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Create New Team</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Team Name *
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Kart Team Alpha"
                        minLength={3}
                        maxLength={50}
                    />
                    <p className="text-sm text-gray-500 mt-1">3-50 characters</p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about your team..."
                        rows={4}
                        maxLength={200}
                    />
                    <p className="text-sm text-gray-500 mt-1">Max 200 characters</p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.name.trim()}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        {loading ? 'Creating...' : 'Create Team'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
