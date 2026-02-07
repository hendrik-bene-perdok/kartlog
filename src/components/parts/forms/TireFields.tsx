import { TirePart } from "@/types";

interface TireFieldsProps {
    data: Partial<TirePart>;
    onChange: (field: string, value: any) => void;
}

export default function TireFields({ data, onChange }: TireFieldsProps) {
    return (
        <>
            <div>
                <label htmlFor="compound" className="block text-sm font-medium text-gray-700">
                    Compound
                </label>
                <input
                    type="text"
                    id="compound"
                    value={data.compound || ''}
                    onChange={(e) => onChange('compound', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Soft, Medium, Hard"
                    required
                />
            </div>
            <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                    Condition
                </label>
                <select
                    id="condition"
                    value={data.condition || 'new'}
                    onChange={(e) => onChange('condition', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                >
                    <option value="new">New</option>
                    <option value="scrubbed">Scrubbed</option>
                    <option value="worn">Worn</option>
                </select>
            </div>
            <div>
                <label htmlFor="installDate" className="block text-sm font-medium text-gray-700">
                    Install Date (optional)
                </label>
                <input
                    type="date"
                    id="installDate"
                    value={data.installDate ? new Date(data.installDate.toDate()).toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange('installDate', e.target.value ? new Date(e.target.value) : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
        </>
    );
}
