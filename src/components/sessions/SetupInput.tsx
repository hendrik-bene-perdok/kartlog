interface SetupInputProps {
    value: {
        fl: number;
        fr: number;
        rl: number;
        rr: number;
    };
    onChange: (value: any) => void;
}

export default function SetupInput({ value, onChange }: SetupInputProps) {
    const handleChange = (position: 'fl' | 'fr' | 'rl' | 'rr', val: string) => {
        onChange({
            ...value,
            [position]: parseFloat(val) || 0
        });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Tire Pressure (PSI)
            </label>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fl" className="block text-xs text-gray-600">Front Left</label>
                    <input
                        type="number"
                        id="fl"
                        step="0.1"
                        value={value.fl || ''}
                        onChange={(e) => handleChange('fl', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.0"
                    />
                </div>
                <div>
                    <label htmlFor="fr" className="block text-xs text-gray-600">Front Right</label>
                    <input
                        type="number"
                        id="fr"
                        step="0.1"
                        value={value.fr || ''}
                        onChange={(e) => handleChange('fr', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.0"
                    />
                </div>
                <div>
                    <label htmlFor="rl" className="block text-xs text-gray-600">Rear Left</label>
                    <input
                        type="number"
                        id="rl"
                        step="0.1"
                        value={value.rl || ''}
                        onChange={(e) => handleChange('rl', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.0"
                    />
                </div>
                <div>
                    <label htmlFor="rr" className="block text-xs text-gray-600">Rear Right</label>
                    <input
                        type="number"
                        id="rr"
                        step="0.1"
                        value={value.rr || ''}
                        onChange={(e) => handleChange('rr', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.0"
                    />
                </div>
            </div>
        </div>
    );
}
