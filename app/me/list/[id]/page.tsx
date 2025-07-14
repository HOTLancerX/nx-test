"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PostForm from "@/app/nx-admin/post/Form"; // Assuming this form component exists

// Define the shape of the data the form will receive
interface PostData {
    // Add fields that your PostForm expects
    _id: string;
    title: string;
    content: string;
    status: string;
    // ... other fields
}

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string; // Ensure id is treated as a string

    const [initialData, setInitialData] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/me/list/${id}`);
                    if (response.ok) {
                        const data: PostData = await response.json();
                        setInitialData(data);
                    } else {
                        console.error("Failed to fetch post");
                        router.push("/me/list");
                    }
                } catch (error) {
                    console.error("Error fetching post:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, router]);

    if (loading) {
        return <p>Loading post...</p>;
    }
    
    if (!initialData) {
        return <p>Post not found.</p>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
            <PostForm
                type="post"
                initialData={initialData}
                onSuccess={() => {
                    router.push("/me/list");
                }}
            />
        </div>
    );
}