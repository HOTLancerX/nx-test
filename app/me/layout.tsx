"use client"
import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";

// User interface for type safety
interface User {
    _id: string;
    username: string;
    email: string;
    images?: string;
}

export default function MeLayout({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyUser = async () => {
            try {
                // Assuming you have an API endpoint to get the logged-in user's data
                const response = await fetch("/api/me"); 
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    router.push("/login"); // Redirect if not authenticated
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        // This will prevent rendering children before authentication is confirmed
        return null; 
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar user={user} />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}