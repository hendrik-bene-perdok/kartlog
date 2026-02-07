"use client";
import { useUser } from "@/hooks/useUser";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Team } from "@/types";

export function useTeam(teamId?: string) {
    const { profile, loading: userLoading } = useUser();
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);

    const activeTeamId = teamId || profile?.defaultTeamId;

    useEffect(() => {
        if (!userLoading && !activeTeamId) {
            setLoading(false);
            setTeam(null);
            return;
        }

        if (activeTeamId) {
            const unsub = onSnapshot(doc(db, "teams", activeTeamId), (docHook) => {
                if (docHook.exists()) {
                    setTeam({ id: docHook.id, ...docHook.data() } as Team);
                } else {
                    setTeam(null);
                }
                setLoading(false);
            });
            return () => unsub();
        }
    }, [activeTeamId, userLoading]);

    return { team, loading: loading || userLoading };
}
