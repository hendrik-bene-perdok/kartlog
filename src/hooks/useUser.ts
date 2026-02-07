"use client";
import { useAuth } from "@/components/providers/AuthProvider";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { User } from "@/types";

export function useUser() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !authUser) {
            setProfile(null);
            setLoading(false);
            return;
        }

        if (authUser) {
            const unsub = onSnapshot(doc(db, "users", authUser.uid), (docHook) => {
                if (docHook.exists()) {
                    setProfile(docHook.data() as User);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            });
            return () => unsub();
        }
    }, [authUser, authLoading]);

    return { profile, loading: loading || authLoading };
}
