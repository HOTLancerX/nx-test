// components/layout/News.tsx
import { useEffect, useState } from "react";
import { NewsStyle1, NewsStyle2, NewsStyle3 } from "./NewsStyles";

interface NewsProps {
  settings: {
    title: string;
    categoryId?: string;
    style: number;
    postLimit: number;
    desktopGrid: number;
    mobileGrid: number;
  };
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  images?: string;
  date: string;
}

export default function News({ settings }: NewsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = `/api/post?limit=${settings.postLimit}&type=post`;
        if (settings.categoryId) {
          url += `&category=${settings.categoryId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [settings.categoryId, settings.postLimit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-6">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return <div>No posts found</div>;
  }

  return (
    <div className="w-full container mx-auto px-2">
      <h2 className="text-xl font-bold mb-4">{settings.title}</h2>
      
      {settings.style === 1 && (
        <NewsStyle1 posts={posts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
      )}

      {settings.style === 2 && (
        <NewsStyle2 posts={posts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
      )}

      {settings.style === 3 && (
        <NewsStyle3 posts={posts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
      )}
    </div>
  );
}