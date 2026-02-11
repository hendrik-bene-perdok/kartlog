"use client";
import SessionForm from "@/components/sessions/SessionForm";
import { useSessions } from "@/hooks/useSessions";
import { useRouter } from "next/navigation";

export default function NewSessionPage() {
    const { addSession } = useSessions();
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        await addSession(data);
        router.push("/app/sessions");
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Log New Session</h1>
            <SessionForm
                onSubmit={handleSubmit}
                onCancel={() => router.push("/app/sessions")}
            />
        </div>
    );
}
