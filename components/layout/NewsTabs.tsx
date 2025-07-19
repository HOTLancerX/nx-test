// components/layout/NewsTabs.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  images?: string;
  date: string;
}

interface NewsTabsSettings {
  title: string;
  categories: { _id: string; title: string }[];
  postLimit: number;
  desktopGrid: number;
  mobileGrid: number;
}

interface NewsTabsProps {
  settings: NewsTabsSettings;
}

export default function NewsTabs({ settings }: NewsTabsProps) {
  const [activeCategory, setActiveCategory] = useState(settings.categories[0]?._id || "");
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let url = `/api/post?limit=${settings.postLimit}&type=post`;
        if (activeCategory) {
          url += `&category=${activeCategory}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [settings.postLimit, activeCategory]);

  return (
    <div>
      {settings.title && <h2 className="text-xl font-bold mb-4">{settings.title}</h2>}

      {settings.categories.length > 1 && (
        <div className="flex space-x-4 mb-4">
          {settings.categories.map((category) => (
            <button
              key={category._id}
              className={`px-4 py-2 rounded ${activeCategory === category._id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setActiveCategory(category._id)}
            >
              {category.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center">Loading news...</div>
      ) : posts.length > 0 ? (
        <div className={`grid grid-cols-${settings.mobileGrid} md:grid-cols-${settings.desktopGrid} gap-4`}>
          {posts.map((post) => (
            <div key={post._id} className="rounded-lg overflow-hidden">
              {post.images ? (
                <Image
                  src={post.images || "/placeholder.svg"}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span>No Image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-700">{post.content.substring(0, 100)}...</p>
                <p className="text-gray-500 text-sm mt-2">{new Date(post.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No news found in this category.</div>
      )}
    </div>
  );
}