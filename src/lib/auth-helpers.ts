import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { User } from "firebase/auth";

export async function ensureUserSetup(user: User) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create Personal Team (FR-002)
        const teamRef = await addDoc(collection(db, "teams"), {
            name: `${user.displayName || 'User'}'s Team`,
            ownerId: user.uid,
            members: { [user.uid]: 'owner' }, // SEC-001 Owner Role
            createdAt: serverTimestamp()
        });

        // Create User Profile
        await setDoc(userRef, {
            id: user.uid,
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            defaultTeamId: teamRef.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
}
