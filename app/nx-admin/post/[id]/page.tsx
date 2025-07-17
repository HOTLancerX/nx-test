"use client"
import React, { use, useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import PostForm from "../Form"

interface PostData {
  _id: string
  title: string
  slug: string
  content: string
  status: "publish" | "draft" | "trash"
  images?: string
  gallery?: string[]
  layout?: string
  taxonomy?: Array<{ term_id: string; taxonomy: string }>
}

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter()

  // ✅ unwrap the Promise using `use()` (React 18+ feature)
  const { id } = use(params)

  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/post/${id}`, { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setPost(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch post")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!post) {
    return notFound()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
      </div>
      <div>
        <PostForm type="post" initialData={post} onSuccess={() => router.push("/nx-admin/post")} />
      </div>
    </div>
  )
}