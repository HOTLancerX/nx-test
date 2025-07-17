"use client"
import PostForm from "../Form"
import { useRouter } from "next/navigation"

export default function AddPost() {
  const router = useRouter()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Post</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new post with rich content and categories
        </p>
      </div>
      
      <PostForm 
          type="post" 
          onSuccess={() => router.push('/nx-admin/post')}
      />
    </div>
  )
}