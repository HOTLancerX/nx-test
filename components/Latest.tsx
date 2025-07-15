"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import Image from "next/image";

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  images?: string;
  date: string;
}

export default function Latest() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Control internal fetch state
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Only update inputs when user types/selects (not immediately used in fetch)
  const [tempSearch, setTempSearch] = useState("");
  const [tempDate, setTempDate] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync URL params to fetch state and input values (on first load or page change)
  useEffect(() => {
    const p = Number(searchParams.get("page") ?? 1);
    const q = searchParams.get("search") ?? "";
    const d = searchParams.get("date") ?? "";

    setPage(p);
    setSearchQuery(q);
    setDateFilter(d);

    setTempSearch(q);
    setTempDate(d);
  }, [searchParams]);

  // Manual fetch trigger — only when searchQuery/dateFilter/page changes
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");
    params.set("type", "post");
    if (searchQuery) params.set("search", searchQuery);
    if (dateFilter) params.set("date", dateFilter);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      setPosts(json.posts);
      setTotalPages(json.totalPages);
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, dateFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle form submit to update URL and trigger fetch
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tempSearch) params.set("search", tempSearch);
    if (tempDate) params.set("date", tempDate);
    params.set("page", "1"); // reset to first page
    router.push(`/latest?${params.toString()}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto py-8 px-4 text-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Latest Posts</h1>

      {/* FILTER FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row gap-4 items-center"
      >
        <input
          type="text"
          placeholder="Search by title or content..."
          value={tempSearch}
          onChange={(e) => setTempSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md w-full sm:w-auto"
        />
        <input
          type="date"
          value={tempDate}
          onChange={(e) => setTempDate(e.target.value)}
          className="px-4 inline-block py-2 border border-gray-300 rounded-md w-auto"
        />
        <button
          type="submit"
          className="px-6 py-2 inline-block bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </form>

      {/* RESULTS */}
      {posts.length === 0 ? (
        <div className="text-center text-gray-500">No posts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {post.images ? (
                <Image
                  src={post.images}
                  alt={post.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 grid place-items-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}…
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ✅ Built-in pagination with <Link> works perfectly */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/latest"
      />
    </div>
  );
}
