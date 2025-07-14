"use client"
import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Pagination from "@/components/Pagination"

interface User {
  _id: string
  username: string
  slug: string
  email: string
  type: string
  images?: string
  bio?: string
  about?: string
  facebook_link?: string
}

interface Post {
  _id: string
  title: string
  slug: string
  content: string
  images?: string
  date: string
}

export default function UserProfilePage() {
  const params = useParams()
  const userSlug = params.slug as string
  const searchParams = useSearchParams()
  const page = searchParams.get("page") || "1"

  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/users/list/${userSlug}?page=${page}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setPosts(data.posts)
          setTotalPages(data.totalPages)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch user data")
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    if (userSlug) {
      fetchData()
    }
  }, [userSlug, page])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!user) {
    return <div className="container mx-auto py-8 px-4 text-center text-gray-500">User not found.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <Image
          src={user.images || "/placeholder.svg?height=200&width=200"}
          alt={user.username}
          width={200}
          height={200}
          className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover flex-shrink-0"
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
          <p className="text-gray-600 text-lg mb-4 capitalize">{user.type}</p>
          {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
          {user.about && (
            <div className="prose max-w-none text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: user.about }} />
          )}
          {user.facebook_link && (
            <a
              href={user.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Facebook Profile
            </a>
          )}
        </div>
      </div>

      {/* User Posts Section */}
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Posts by {user.username}</h2>
      {posts.length === 0 ? (
        <div className="text-center text-gray-500">No posts found for this user.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {post.images ? (
                <Image
                  src={post.images || "/placeholder.svg?height=200&width=300"}
                  alt={post.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-gray-600 text-sm mb-2">{new Date(post.date).toLocaleDateString()}</p>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination
        currentPage={Number.parseInt(page)}
        totalPages={totalPages}
        basePath={`/users/${user.slug || user._id}`}
      />
    </div>
  )
}
