"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import PostForm from "../../post/Form"

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/post/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch page')
        }
        const data = await response.json()
        setPage(data)
      } catch (error) {
        console.error('Error fetching page:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPage()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        Loading page...
      </div>
    )
  }

  if (!page) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        Page not found
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update page content and settings
        </p>
      </div>
      
      <PostForm 
          type="page"
          initialData={page}
          onSuccess={() => router.push('/nx-admin/page')}
      />
    </div>
  )
}