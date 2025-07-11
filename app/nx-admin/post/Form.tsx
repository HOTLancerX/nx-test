"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
})

interface PostFormProps {
  type: "post" | "page"
  initialData?: {
    _id?: string
    title?: string
    content?: string
    status?: string
    images?: string
    gallery?: string[]
    taxonomy?: { term_id: string, taxonomy: string }[]
  }
  onSuccess?: () => void
}

export default function PostForm({ type, initialData, onSuccess }: PostFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    status: initialData?.status || "draft",
    images: initialData?.images || "",
    gallery: initialData?.gallery || [],
    taxonomy: initialData?.taxonomy || [],
  })

  useEffect(() => {
    // Load categories only for posts
    if (type === "post") {
      const fetchCategories = async () => {
        try {
          const response = await fetch(`/api/category?type=${type}_category`)
          const data = await response.json()
          setCategories(data.categories)
          
          // Set initially selected categories
          if (initialData?.taxonomy) {
            setSelectedCategories(initialData.taxonomy.map(t => t.term_id))
          }
        } catch (error) {
          console.error("Error fetching categories:", error)
        }
      }
      
      fetchCategories()
    }
  }, [type, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert("Title is required")
      return
    }

    setLoading(true)
    
    try {
      const postData = {
        ...formData,
        type,
        taxonomy: type === "post" ? selectedCategories.map(id => ({
          term_id: id,
          taxonomy: `${type}_category`
        })) : []
      }
      
      const url = initialData?._id 
        ? `/api/post/${initialData._id}`
        : '/api/post'
      const method = initialData?._id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
      
      if (response.ok) {
        if (onSuccess) onSuccess()
      } else {
        const error = await response.json()
        alert(error.message || "Error saving post")
      }
    } catch (error) {
      console.error("Error saving post:", error)
      alert("Error saving post")
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

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(catId => catId !== id)
        : [...prev, id]
    )
  }

  const renderCategories = (parentId: string | null = null, level = 0) => {
    return categories
      .filter(cat => (cat.parent_id || null) === parentId)
      .map(category => (
        <div key={category._id} className="ml-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category._id)}
              onChange={() => toggleCategory(category._id)}
              className="rounded text-blue-600"
            />
            <span>{category.title}</span>
          </label>
          {renderCategories(category._id, level + 1)}
        </div>
      ))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter title"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <SunEditor
            setContents={formData.content}
            onChange={(content) => setFormData({...formData, content})}
            setOptions={{
              height: "500px",
              buttonList: [
                ['undo', 'redo'],
                ['font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                ['removeFormat'],
                ['fontColor', 'hiliteColor'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'table'],
                ['link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView'],
                ['preview', 'print'],
              ]
            }}
          />
        </div>
      </div>
      
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">Publish</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="publish">Published</option>
            </select>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">Featured Image</h3>
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
              className="w-full h-auto rounded-md"
            />
          )}
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">Gallery</h3>
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
        
        {type === "post" && (
          <div className="bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-medium mb-4">Categories</h3>
            <div className="max-h-60 overflow-y-auto">
              {renderCategories()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}