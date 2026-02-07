"use client";
import { useState } from "react";
import { Part, PartType, PartStatus } from "@/types";
import EngineFields from "./forms/EngineFields";
import ChassisFields from "./forms/ChassisFields";
import TireFields from "./forms/TireFields";

interface PartFormProps {
    initialData?: Part;
    onSubmit: (data: Omit<Part, 'id'>) => Promise<void>;
    onCancel: () => void;
}

export default function PartForm({ initialData, onSubmit, onCancel }: PartFormProps) {
    const [formData, setFormData] = useState<Partial<Part>>(
        initialData || {
            type: 'engine',
            name: '',
            serialNumber: '',
            status: 'active',
            notes: ''
        }
    );
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData as Omit<Part, 'id'>);
        } catch (error) {
            console.error("Error submitting part:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Part Type
                </label>
                <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value as PartType)}
                    disabled={!!initialData}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                    required
                >
                    <option value="engine">Engine</option>
                    <option value="chassis">Chassis</option>
                    <option value="tire">Tire</option>
                </select>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                    Serial Number
                </label>
                <input
                    type="text"
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleChange('serialNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                </label>
                <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as PartStatus)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                </select>
            </div>

            {/* Type-specific fields */}
            {formData.type === 'engine' && <EngineFields data={formData} onChange={handleChange} />}
            {formData.type === 'chassis' && <ChassisFields data={formData} onChange={handleChange} />}
            {formData.type === 'tire' && <TireFields data={formData} onChange={handleChange} />}

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (optional)
                </label>
                <textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                    {submitting ? 'Saving...' : initialData ? 'Update Part' : 'Add Part'}
                </button>
            </div>
        </form>
    );
}
