import { ChassisPart } from "@/types";

interface ChassisFieldsProps {
    data: Partial<ChassisPart>;
    onChange: (field: string, value: any) => void;
}

export default function ChassisFields({ data, onChange }: ChassisFieldsProps) {
    return (
        <>
            <div>
                <label htmlFor="modelYear" className="block text-sm font-medium text-gray-700">
                    Model Year
                </label>
                <input
                    type="number"
                    id="modelYear"
                    value={data.modelYear || new Date().getFullYear()}
                    onChange={(e) => onChange('modelYear', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="setupNotes" className="block text-sm font-medium text-gray-700">
                    Setup Notes (optional)
                </label>
                <textarea
                    id="setupNotes"
                    value={data.setupNotes || ''}
                    onChange={(e) => onChange('setupNotes', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
        </>
    );
}
