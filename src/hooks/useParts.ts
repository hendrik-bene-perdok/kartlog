"use client";
import { useUser } from "@/hooks/useUser";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Part, PartType, PartStatus } from "@/types";

export function useParts() {
    const { profile, loading: userLoading } = useUser();
    const [parts, setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(true);

    const teamId = profile?.defaultTeamId;

    useEffect(() => {
        if (!userLoading && !teamId) {
            setLoading(false);
            setParts([]);
            return;
        }

        if (teamId) {
            const q = query(collection(db, "teams", teamId, "parts"));
            const unsub = onSnapshot(q, (snapshot) => {
                const partsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Part[];
                setParts(partsData);
                setLoading(false);
            });
            return () => unsub();
        }
    }, [teamId, userLoading]);

    const addPart = async (partData: Omit<Part, 'id'>) => {
        if (!teamId) throw new Error("No team found");
        await addDoc(collection(db, "teams", teamId, "parts"), {
            ...partData,
            acquisitionDate: serverTimestamp()
        });
    };

    const updatePart = async (partId: string, partData: Partial<Part>) => {
        if (!teamId) throw new Error("No team found");
        await updateDoc(doc(db, "teams", teamId, "parts", partId), partData);
    };

    const deletePart = async (partId: string) => {
        if (!teamId) throw new Error("No team found");
        await deleteDoc(doc(db, "teams", teamId, "parts", partId));
    };

    return { parts, loading: loading || userLoading, addPart, updatePart, deletePart };
}
