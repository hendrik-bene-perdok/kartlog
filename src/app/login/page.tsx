"use client";
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ensureUserSetup } from "@/lib/auth-helpers";
import { useAuth } from "@/components/providers/AuthProvider";
import { AUTH_CONFIG } from "@/config/auth";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const { loginDev, user: authUser } = useAuth(); // Get loginDev from context

    // Redirect if already logged in
    React.useEffect(() => {
        if (authUser) {
            router.push("/dashboard");
        }
    }, [authUser, router]);

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await ensureUserSetup(user);

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDevLogin = async () => {
        try {
            // activate dev mode in context
            loginDev();

            // Setup mock user in Firestore (needs updated rules)
            // Construct a minimal user object that satisfies ensureUserSetup requirements
            const mockUser = {
                uid: AUTH_CONFIG.DEV_USER_ID,
                displayName: 'Dev User',
                email: 'dev@example.com',
                photoURL: 'https://ui-avatars.com/api/?name=Dev+User&background=random',
            } as User;

            await ensureUserSetup(mockUser);
            router.push("/dashboard");

        } catch (err: any) {
            console.error("Dev login error:", err);
            setError("Dev login failed: " + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-app-border">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-app-text">
                        {AUTH_CONFIG.ENABLE_GOOGLE_AUTH ? "Sign in to Kartlog" : "Dev Access"}
                    </h2>
                </div>
                <div className="mt-8 space-y-6">
                    {AUTH_CONFIG.ENABLE_GOOGLE_AUTH ? (
                        <button
                            onClick={handleGoogleLogin}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <span className="material-symbols-outlined">login</span>
                            </span>
                            Sign in with Google
                        </button>
                    ) : (
                        <button
                            onClick={handleDevLogin}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <span className="material-symbols-outlined">developer_mode</span>
                            </span>
                            Enter Dev Mode
                        </button>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-status-due">Login Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
