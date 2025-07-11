"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
})

interface CategoryFormProps {
  type: "post_category"
  initialData?: {
    _id?: string
    title?: string
    slug?: string
    content?: string
    images?: string
    gallery?: string[]
    parent_id?: string | null
  }
  onSuccess?: () => void
}

export default function CategoryForm({ type, initialData, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    images: initialData?.images || "",
    gallery: initialData?.gallery || [""],
    parent_id: initialData?.parent_id || null,
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/category?type=${type}`)
        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    
    fetchCategories()
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
          type
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (onSuccess) onSuccess()
      } else {
        throw new Error(data.message || "Error saving category")
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error saving category")
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
    setFormData({ ...formData, gallery: [...formData.gallery, ""] })
  }

  const removeGalleryItem = (index: number) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index)
    setFormData({ ...formData, gallery: newGallery })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({
              ...formData, 
              title: e.target.value,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <SunEditor
            setContents={formData.content}
            onChange={(content) => setFormData({...formData, content})}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>
          <select
            value={formData.parent_id || ""}
            onChange={(e) => setFormData({
              ...formData, 
              parent_id: e.target.value || null
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">None (Top Level)</option>
            {categories
              .filter(cat => !initialData?._id || cat._id !== initialData._id)
              .map(category => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          <input
            type="url"
            value={formData.images}
            onChange={(e) => setFormData({...formData, images: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            placeholder="Image URL"
          />
          {formData.images && (
            <img 
              src={formData.images} 
              alt="Featured" 
              className="w-full h-auto rounded-md max-w-xs"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gallery
          </label>
          {formData.gallery.map((url, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleGalleryChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Image URL"
              />
              <button
                type="button"
                onClick={() => removeGalleryItem(index)}
                className="ml-2 bg-red-500 text-white px-3 py-2 rounded-md"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addGalleryItem}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Add Image
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onSuccess}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Category"}
        </button>
      </div>
    </form>
  )
}