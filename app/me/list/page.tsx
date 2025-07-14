"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination"; // Assuming you have this component

// Interface for a single post
interface Post {
    _id: string;
    title: string;
    status: string;
    date: string;
}

export default function PostListPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const page = searchParams.get('page') || '1';

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/me/list?page=${page}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts);
                    setTotalPages(data.totalPages);
                } else {
                    console.error("Failed to fetch posts");
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [page]);
    
    // Explicitly type the 'id' parameter
    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                const response = await fetch(`/api/me/list/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
                } else {
                    const error = await response.json();
                    alert(`Failed to delete post: ${error.message}`);
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("An error occurred while deleting the post.");
            }
        }
    };

    if (loading) {
        return <p>Loading posts...</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Posts</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">Title</th>
                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                            <th className="px-6 py-3 text-left font-semibold">Date</th>
                            <th className="px-6 py-3 text-left font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {posts.map((post) => (
                            <tr key={post._id}>
                                <td className="px-6 py-4">{post.title}</td>
                                <td className="px-6 py-4">{post.status}</td>
                                <td className="px-6 py-4">{new Date(post.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <Link href={`/me/list/${post._id}`} className="text-blue-600 hover:underline mr-4">Edit</Link>
                                    <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={parseInt(page)}
                totalPages={totalPages}
                basePath="/me/list"
            />
        </div>
    );
}