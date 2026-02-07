import { Session } from "@/types";

export default function SessionItem({ session }: { session: Session }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{session.trackName}</h3>
                    <time className="text-sm text-gray-500">
                        {session.date.toDate().toLocaleDateString()}
                    </time>
                </div>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    {session.weather && (
                        <p>Weather: {session.weather.temp}°C, {session.weather.conditions}</p>
                    )}
                    {session.setup?.tirePressure && (
                        <div className="mt-2">
                            <p className="font-medium">Tire Pressure:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                                <div>FL: {session.setup.tirePressure.fl} psi</div>
                                <div>FR: {session.setup.tirePressure.fr} psi</div>
                                <div>RL: {session.setup.tirePressure.rl} psi</div>
                                <div>RR: {session.setup.tirePressure.rr} psi</div>
                            </div>
                        </div>
                    )}
                    {session.notes && (
                        <p className="mt-2 italic">{session.notes}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
