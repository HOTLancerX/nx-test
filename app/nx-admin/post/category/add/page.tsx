"use client"

import { useRouter } from "next/navigation"
import CategoryForm from "../Form"

export default function AddCategory() {
  const router = useRouter()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new post category with rich content
        </p>
      </div>
      
      <CategoryForm 
        type="post_category"
        onSuccess={() => router.push("/nx-admin/post/category")}
      />
    </div>
  )
}