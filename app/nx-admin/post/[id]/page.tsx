"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import PostForm from "../Form"

export default function EditPost() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/post/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch post')
        }
        const data = await response.json()
        setPost(data)
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        Loading post...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        Post not found
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update post content and settings
        </p>
      </div>
      
      <PostForm 
        type="post"
        initialData={post}
        onSuccess={() => router.push('/nx-admin/post')}
      />
    </div>
  )
}