"use client";
import { useUser } from "@/hooks/useUser";
import { collection, addDoc, query, onSnapshot, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Session } from "@/types";

export function useSessions() {
    const { profile, loading: userLoading } = useUser();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const teamId = profile?.defaultTeamId;

    useEffect(() => {
        if (!userLoading && !teamId) {
            setLoading(false);
            setSessions([]);
            return;
        }

        if (teamId) {
            const q = query(collection(db, "teams", teamId, "sessions"));
            const unsub = onSnapshot(q, (snapshot) => {
                const sessionsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Session[];
                // Sort by date descending
                sessionsData.sort((a, b) => b.date.toMillis() - a.date.toMillis());
                setSessions(sessionsData);
                setLoading(false);
            });
            return () => unsub();
        }
    }, [teamId, userLoading]);

    const addSession = async (sessionData: Omit<Session, 'id'>) => {
        if (!teamId) throw new Error("No team found");
        await addDoc(collection(db, "teams", teamId, "sessions"), {
            ...sessionData,
            driverId: profile?.id || '',
            date: sessionData.date || serverTimestamp()
        });
    };

    const getSession = async (sessionId: string): Promise<Session | null> => {
        if (!teamId) return null;
        const docRef = doc(db, "teams", teamId, "sessions", sessionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Session;
        }
        return null;
    };

    return { sessions, loading: loading || userLoading, addSession, getSession };
}
