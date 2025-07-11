"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Category {
  _id: string
  title: string
  slug: string
  parent_id: string | null
}

export default function CategoryList() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/category?type=post_category")
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    
    try {
      const response = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete category")
      }
      
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const renderCategories = (parentId: string | null = null, level = 0) => {
    return categories
      .filter(cat => (cat.parent_id || null) === parentId)
      .map(category => (
        <div key={category._id} className="ml-4">
          <div className="flex items-center py-2 border-b">
            <div className="flex-1">
              {"- ".repeat(level)}{category.title} ({category.slug})
            </div>
            <div className="space-x-2">
              <Link 
                href={`/nx-admin/post/category/${category._id}`}
                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
              >
                Edit
              </Link>
              <button 
                onClick={() => deleteCategory(category._id)}
                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
          {renderCategories(category._id, level + 1)}
        </div>
      ))
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading categories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
        {error}
        <button 
          onClick={fetchCategories}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your post categories hierarchy
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/nx-admin/post/category/add"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Category
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">All Categories</h2>
        {categories.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No categories found. Create your first category.
          </div>
        ) : (
          renderCategories()
        )}
      </div>
    </div>
  )
}