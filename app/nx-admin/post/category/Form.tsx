'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false })

interface CategoryFormProps {
  type: 'post_category' | 'page_category'
  initialData?: {
    _id?: string
    title?: string
    slug?: string
    content?: string
    images?: string
    gallery?: string[]
    parent_id?: string | null
    layout?: string
  }
  onSuccess?: () => void
}

export default function CategoryForm({ type, initialData, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [layouts, setLayouts] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    images: initialData?.images || '',
    gallery: initialData?.gallery || [''],
    parent_id: initialData?.parent_id || null,
    layout: initialData?.layout || '',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/category?type=${type}`)
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    if (type) {
      fetchCategories()
    }

    if (type === 'post_category') {
      const fetchLayouts = async () => {
        try {
          const response = await fetch('/api/layout')
          const data = await response.json()
          setLayouts(data.layouts || [])
        } catch (error) {
          console.error('Error fetching layouts:', error)
        }
      }

      fetchLayouts()
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData?._id
        ? `/api/category/${initialData._id}`
        : '/api/category'
      const method = initialData?._id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (onSuccess) onSuccess()
      } else {
        throw new Error(data.message || 'Error saving category')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error saving category')
    } finally {
      setLoading(false)
    }
  }

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...formData.gallery]
    newGallery[index] = value
    setFormData({ ...formData, gallery: newGallery })
  }

  const addGalleryItem = () => {
    setFormData({ ...formData, gallery: [...formData.gallery, ''] })
  }

  const removeGalleryItem = (index: number) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index)
    setFormData({ ...formData, gallery: newGallery })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 font-semibold">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Content</label>
        <SunEditor
          defaultValue={formData.content}
          onChange={(val) => setFormData({ ...formData, content: val })}
          setOptions={{
            height: "300px",
            buttonList: [
              ['undo', 'redo'],
              ['bold', 'underline', 'italic'],
              ['fontColor', 'hiliteColor'],
              ['align', 'list'],
              ['link', 'image'],
            ]
          }}
        />
      </div>

      
      <div>
        <label className="block mb-1 font-semibold">Layout</label>
        <select
          value={formData.layout}
          onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Select a layout</option>
          {layouts.map((layout) => (
            <option key={layout._id} value={layout._id}>
              {layout.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  )
}
