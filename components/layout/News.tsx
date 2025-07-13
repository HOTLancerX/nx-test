import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">{settings.title}</h2>
      
      {settings.style === 1 && (
        <div className={`grid grid-cols-${settings.mobileGrid} md:grid-cols-${settings.desktopGrid} gap-4`}>
          {posts.map(post => (
            <div key={post._id} className="border rounded-lg overflow-hidden">
              {post.images ? (
                <Image
                  src={post.images || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={300}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <h3 className="font-semibold text-lg mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 line-clamp-2">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {settings.style === 2 && (
        <div className="w-full">
          {posts.length > 0 && (
            <div className="mb-6 border-b pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    <Link href={`/blog/${posts[0].slug}`} className="hover:text-blue-600">
                      {posts[0].title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(posts[0].date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    {posts[0].content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
                {posts[0].images ? (
                  <Image
                    src={posts[0].images || "/placeholder.svg"}
                    alt={posts[0].title}
                    width={800}
                    height={300}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {posts.length > 1 && (
            <div className={`grid grid-cols-1 md:grid-cols-${settings.desktopGrid} gap-4`}>
              {posts.slice(1).map(post => (
                <div key={post._id} className="border rounded-lg overflow-hidden">
                  {post.images ? (
                    <Image
                      src={post.images || "/placeholder.svg"}
                      alt={post.title}
                      width={800}
                      height={300}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold mb-1">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {settings.style === 3 && (
        <div className="w-full">
          {posts.length > 0 && (
            <div className="mb-6 border-b pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    <Link href={`/blog/${posts[0].slug}`} className="hover:text-blue-600">
                      {posts[0].title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(posts[0].date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    {posts[0].content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
                {posts[0].images ? (
                  <Image
                    src={posts[0].images || "/placeholder.svg"}
                    alt={posts[0].title}
                    width={800}
                    height={300}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {posts.length > 2 && (
            <div className={`mb-6 grid grid-cols-1 md:grid-cols-${settings.desktopGrid} gap-4`}>
              {posts.slice(1, posts.length - 1).map(post => (
                <div key={post._id} className="border rounded-lg overflow-hidden">
                  {post.images ? (
                    <Image
                      src={post.images || "/placeholder.svg"}
                      alt={post.title}
                      width={800}
                      height={300}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold mb-1">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {posts.length > 1 && (
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts[posts.length - 1].images ? (
                  <Image
                    src={posts[posts.length - 1].images || "/placeholder.svg"}
                    alt={posts[posts.length - 1].title}
                    width={800}
                    height={300}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    <Link href={`/blog/${posts[posts.length - 1].slug}`} className="hover:text-blue-600">
                      {posts[posts.length - 1].title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(posts[posts.length - 1].date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    {posts[posts.length - 1].content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}