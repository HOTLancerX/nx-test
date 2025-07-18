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

interface Category {
  _id: string
  title: string
  parent_id?: string | null
}

interface Layout {
  _id: string
  title: string
}

export default function CategoryForm({ type, initialData, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [layouts, setLayouts] = useState<Layout[]>([])

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

  const getParentCategoryOptions = () => {
    return categories.filter(category => 
      category._id !== initialData?._id &&
      (!initialData?._id || !isChildOfCurrentCategory(category._id)))
  }

  const isChildOfCurrentCategory = (categoryId: string): boolean => {
    if (!initialData?._id) return false
    const checkChildren = (parentId: string): boolean => {
      return categories.some(cat => 
        cat.parent_id === parentId && 
        (cat._id === categoryId || checkChildren(cat._id)))
    }
    return checkChildren(initialData._id)
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
        <label className="block mb-1 font-semibold">Parent Category</label>
        <select
          value={formData.parent_id || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            parent_id: e.target.value || null 
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">No parent category</option>
          {getParentCategoryOptions().map((category) => (
            <option key={category._id} value={category._id}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Image URL */}
      <div>
        <label htmlFor="images" className="block mb-1 font-semibold">
          Featured Image URL
        </label>
        <input
          id="images"
          type="url"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="https://example.com/featured-image.jpg"
        />
        {formData.images && (
          <img
            src={formData.images || "/placeholder.svg"}
            alt="Featured Image Preview"
            className="mt-2 max-w-full h-auto rounded-md"
          />
        )}
      </div>

      {/* Gallery URLs */}
      <div>
        <label className="block mb-1 font-semibold">Gallery URLs</label>
        {formData.gallery.map((url, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleGalleryChange(index, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/gallery-image.jpg"
            />
            <button
              type="button"
              onClick={() => removeGalleryItem(index)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addGalleryItem}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Add Gallery Image
        </button>
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

      {type === 'post_category' && (
        <div>
          <label className="block mb-1 font-semibold">Layout</label>
          <select
            value={formData.layout}
            onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a layout</option>
            {layouts.map((layout) => (
              <option key={layout._id} value={layout._id}>
                {layout.title}
              </option>
            ))}
          </select>
        </div>
      )}

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