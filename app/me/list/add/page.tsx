"use client"
import PostForm from "@/app/nx-admin/post/Form";
import { useRouter } from "next/navigation";

export default function AddPostPage() {
    const router = useRouter();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Add New Post</h1>
            <PostForm
                type="post"
                onSuccess={() => {
                    router.push("/me/list");
                }}
            />
        </div>
    );
}