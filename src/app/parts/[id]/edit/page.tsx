"use client";
import { useParams, useRouter } from "next/navigation";
import PrivateRoute from "@/components/auth/PrivateRoute";
import MainLayout from "@/components/layout/MainLayout";
import PartForm from "@/components/parts/PartForm";
import { useParts } from "@/hooks/useParts";

export default function EditPartPage() {
    const params = useParams();
    const router = useRouter();
    const { parts, updatePart, deletePart, loading } = useParts();

    const partId = params?.id as string;
    const part = parts.find(p => p.id === partId);

    const handleSubmit = async (data: any) => {
        await updatePart(partId, data);
        router.push("/parts");
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this part?")) {
            await deletePart(partId);
            router.push("/parts");
        }
    };

    if (loading) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="text-center py-10">Loading...</div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    if (!part) {
        return (
            <PrivateRoute>
                <MainLayout>
                    <div className="text-center py-10">Part not found</div>
                </MainLayout>
            </PrivateRoute>
        );
    }

    return (
        <PrivateRoute>
            <MainLayout>
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Part</h1>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                            Delete Part
                        </button>
                    </div>
                    <PartForm
                        initialData={part}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/parts")}
                    />
                </div>
            </MainLayout>
        </PrivateRoute>
    );
}
