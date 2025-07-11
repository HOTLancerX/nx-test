"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import CategoryForm from "../Form"

export default function EditCategory() {
  const router = useRouter()
  const params = useParams()
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/category/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch category')
        }
        
        const data = await response.json()
        setCategory(data)
      } catch (error) {
        console.error('Error fetching category:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCategory()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading category...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
        {error}
        <button 
          onClick={() => router.push('/nx-admin/post/category')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Categories
        </button>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        Category not found
        <button 
          onClick={() => router.push('/nx-admin/post/category')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Categories
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update category details and content
        </p>
      </div>
      
      <CategoryForm 
        type="post_category"
        initialData={category}
        onSuccess={() => router.push("/nx-admin/post/category")}
      />
    </div>
  )
}