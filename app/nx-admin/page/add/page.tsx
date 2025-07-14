"use client"

import PostForm from "../../post/Form"
import { useRouter } from "next/navigation"

export default function AddPage() {
  const router = useRouter()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Page</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new page with rich content
        </p>
      </div>
      
      <PostForm 
          type="page" 
          onSuccess={() => router.push('/nx-admin/page')}
      />
    </div>
  )
}