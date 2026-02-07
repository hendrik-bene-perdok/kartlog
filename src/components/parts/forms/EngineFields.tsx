import { EnginePart } from "@/types";

interface EngineFieldsProps {
    data: Partial<EnginePart>;
    onChange: (field: string, value: any) => void;
}

export default function EngineFields({ data, onChange }: EngineFieldsProps) {
    return (
        <>
            <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                    Hours
                </label>
                <input
                    type="number"
                    id="hours"
                    value={data.hours || 0}
                    onChange={(e) => onChange('hours', parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="lastRebuild" className="block text-sm font-medium text-gray-700">
                    Last Rebuild Date (optional)
                </label>
                <input
                    type="date"
                    id="lastRebuild"
                    value={data.lastRebuild ? new Date(data.lastRebuild.toDate()).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange('lastRebuild', e.target.value ? new Date(e.target.value) : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
        </>
    );
}
