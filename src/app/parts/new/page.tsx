"use client";
import PrivateRoute from "@/components/auth/PrivateRoute";
import MainLayout from "@/components/layout/MainLayout";
import PartForm from "@/components/parts/PartForm";
import { useParts } from "@/hooks/useParts";
import { useRouter } from "next/navigation";

export default function NewPartPage() {
    const { addPart } = useParts();
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        await addPart(data);
        router.push("/parts");
    };

    return (
        <PrivateRoute>
            <MainLayout>
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Part</h1>
                    <PartForm
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/parts")}
                    />
                </div>
            </MainLayout>
        </PrivateRoute>
    );
}
