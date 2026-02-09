"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AUTH_CONFIG } from "@/config/auth";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    loginDev: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    loginDev: () => { },
});

// Mock user object for dev mode
const MOCK_USER = {
    uid: AUTH_CONFIG.DEV_USER_ID,
    email: 'dev@example.com',
    displayName: 'Dev User',
    photoURL: 'https://ui-avatars.com/api/?name=Dev+User&background=random',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => { },
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
        token: 'mock-token',
        signInProvider: 'custom',
        claims: {},
        authTime: Date.now().toString(),
        issuedAtTime: Date.now().toString(),
        expirationTime: (Date.now() + 3600000).toString(),
    }),
    reload: async () => { },
    toJSON: () => ({}),
} as unknown as User;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loginDev = () => {
        if (!AUTH_CONFIG.ENABLE_GOOGLE_AUTH) {
            localStorage.setItem('kartlog_dev_user', 'true');
            setUser(MOCK_USER);
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (localStorage.getItem('kartlog_dev_user')) {
                localStorage.removeItem('kartlog_dev_user');
                setUser(null);
            } else {
                await signOut(auth);
            }
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    useEffect(() => {
        // Check for dev user first
        if (!AUTH_CONFIG.ENABLE_GOOGLE_AUTH && localStorage.getItem('kartlog_dev_user')) {
            setUser(MOCK_USER);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Only update if not in dev mode (or if we want to support both, but dev mode takes precedence if set)
            if (!localStorage.getItem('kartlog_dev_user')) {
                setUser(user);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginDev }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
