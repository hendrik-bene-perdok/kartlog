"use client";
import { useState } from "react";
import { Session } from "@/types";
import SetupInput from "./SetupInput";
import { Timestamp } from "firebase/firestore";

interface SessionFormProps {
    onSubmit: (data: Omit<Session, 'id' | 'driverId'>) => Promise<void>;
    onCancel: () => void;
}

export default function SessionForm({ onSubmit, onCancel }: SessionFormProps) {
    const [formData, setFormData] = useState<Partial<Session>>({
        trackName: '',
        notes: '',
        weather: {
            temp: 20,
            conditions: ''
        },
        setup: {
            tirePressure: {
                fl: 0,
                fr: 0,
                rl: 0,
                rr: 0
            }
        }
    });
    const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleWeatherChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            weather: { ...prev.weather, [field]: value } as any
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const sessionData: Omit<Session, 'id' | 'driverId'> = {
                ...formData as any,
                date: Timestamp.fromDate(new Date(sessionDate))
            };
            await onSubmit(sessionData);
        } catch (error) {
            console.error("Error submitting session:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Session Date
                </label>
                <input
                    type="date"
                    id="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="trackName" className="block text-sm font-medium text-gray-700">
                    Track Name
                </label>
                <input
                    type="text"
                    id="trackName"
                    value={formData.trackName}
                    onChange={(e) => handleChange('trackName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Silverstone"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="temp" className="block text-sm font-medium text-gray-700">
                        Temperature (°C)
                    </label>
                    <input
                        type="number"
                        id="temp"
                        value={formData.weather?.temp || 20}
                        onChange={(e) => handleWeatherChange('temp', parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="conditions" className="block text-sm font-medium text-gray-700">
                        Conditions
                    </label>
                    <input
                        type="text"
                        id="conditions"
                        value={formData.weather?.conditions || ''}
                        onChange={(e) => handleWeatherChange('conditions', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., Sunny, Rainy"
                    />
                </div>
            </div>

            <SetupInput
                value={formData.setup?.tirePressure || { fl: 0, fr: 0, rl: 0, rr: 0 }}
                onChange={(value) => setFormData(prev => ({
                    ...prev,
                    setup: { ...prev.setup, tirePressure: value }
                }))}
            />

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                </label>
                <textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Track conditions, observations, improvements..."
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {submitting ? 'Saving...' : 'Log Session'}
                </button>
            </div>
        </form>
    );
}
