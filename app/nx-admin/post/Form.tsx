"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import "suneditor/dist/css/suneditor.min.css"
import Medias from "@/components/Medias"

const SunEditor = dynamic(() => import("suneditor-react"), { 
  ssr: false 
})

interface PostFormProps {
  type: "post" | "page"
  initialData?: {
    _id?: string
    title?: string
    slug?: string
    content?: string
    status?: "publish" | "draft" | "trash"
    images?: string
    gallery?: string[]
    layout?: string
    taxonomy?: { term_id: string }[]
    meta?: {
      hello?: string
      rsslink?: string
      [key: string]: string | undefined
    }
  }
  onSuccess?: () => void
}

interface Category {
  _id: string
  title: string
  parent_id?: string | null
  level?: number
}

interface Layout {
  _id: string
  title: string
}

interface FormData {
  title: string
  slug: string
  content: string
  status: "publish" | "draft" | "trash"
  images: string
  gallery: string[]
  layout: string
  type: "post" | "page"
  taxonomy: Array<{ term_id: string; taxonomy: string }>
  meta: {
    hello: string
    rsslink: string
    [key: string]: string
  }
}

export default function PostForm({ type, initialData, onSuccess }: PostFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    content: "",
    status: "draft",
    images: "",
    gallery: [],
    layout: "",
    type,
    taxonomy: [],
    meta: {
      hello: "",
      rsslink: ""
    }
  })

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        content: initialData.content || "",
        status: initialData.status || "draft",
        images: initialData.images || "",
        gallery: initialData.gallery || [],
        layout: initialData.layout || "",
        type,
        taxonomy: initialData.taxonomy?.map(t => ({ 
          term_id: t.term_id, 
          taxonomy: `${type}_category` 
        })) || [],
        meta: {
          hello: initialData.meta?.hello || "",
          rsslink: initialData.meta?.rsslink || ""
        }
      })

      setSelectedCategories(initialData.taxonomy?.map(t => t.term_id) || [])
      if (initialData.slug) setIsSlugManuallyEdited(true)
    }

    if (type === "post") fetchCategories()
    if (type === "page") fetchLayouts()
  }, [initialData, type])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category?type=post_category", { 
        credentials: "include" 
      })
      const data = await res.json()
      const nestedCategories = buildNestedCategories(data.categories || [])
      setCategories(nestedCategories)
    } catch (error) {
      console.error("Failed to load categories", error)
    }
  }

  const fetchLayouts = async () => {
    try {
      const res = await fetch("/api/layout", { credentials: "include" })
      const data = await res.json()
      setLayouts(data.layouts || [])
    } catch (error) {
      console.error("Failed to load layouts", error)
    }
  }

  const buildNestedCategories = (
    categories: Category[],
    parentId: string | null = null,
    level = 0
  ): Category[] => {
    return categories
      .filter(category => (category.parent_id || null) === parentId)
      .flatMap(category => [
        { ...category, level },
        ...buildNestedCategories(categories, category._id, level + 1)
      ])
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setFormData(prev => ({ ...prev, title: newTitle }))
    
    if (!isSlugManuallyEdited) {
      const newSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, slug: e.target.value }))
    setIsSlugManuallyEdited(true)
  }

  const handleMetaChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: e.target.value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const postData = {
        ...formData,
        taxonomy: type === "post" 
          ? selectedCategories.map(id => ({
              term_id: id,
              taxonomy: `${type}_category`
            }))
          : []
      }

      const method = initialData?._id ? "PUT" : "POST"
      const url = initialData?._id ? `/api/post?id=${initialData._id}` : "/api/post"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Save failed")
      }

      onSuccess?.() || router.push("/nx-admin/post")
    } catch (error) {
      console.error("Error saving post:", error)
      alert(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Core Fields */}
      <div>
        <label className="block mb-1 font-semibold">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={handleSlugChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Auto-generated from title"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Content</label>
        <SunEditor
          defaultValue={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          setOptions={{
            height: "300px",
            buttonList: [
              ["undo", "redo"],
              ["bold", "underline", "italic"],
              ["fontColor", "hiliteColor"],
              ["align", "list"],
              ["link", "image"],
            ],
          }}
        />
      </div>

      {/* Categories (posts only) */}
      {type === "post" && (
        <div>
          <label className="block mb-1 font-semibold">Categories</label>
          {categories.map(category => (
            <label
              key={category._id}
              className="flex items-center space-x-2"
              style={{ marginLeft: `${(category.level || 0) * 16}px` }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category._id)}
                onChange={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category._id)
                      ? prev.filter(id => id !== category._id)
                      : [...prev, category._id]
                  )
                }}
                className="form-checkbox"
              />
              <span>{category.title}</span>
            </label>
          ))}
        </div>
      )}

      {/* Layout (pages only) */}
      {type === "page" && (
        <div>
          <label className="block mb-1 font-semibold">Layout</label>
          <select
            value={formData.layout}
            onChange={(e) => setFormData(prev => ({ ...prev, layout: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a layout</option>
            {layouts.map(layout => (
              <option key={layout._id} value={layout._id}>
                {layout.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Media Fields */}
      <div>
        <label className="block mb-1 font-semibold">Featured Image URL</label>
        <Medias
          multiple={false}
          value={formData.images}
          onChange={(value) => setFormData(prev => ({ ...prev, images: value as string }))}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Gallery URLs</label>
        <Medias
          multiple={true}
          value={formData.gallery}
          onChange={(value) => setFormData(prev => ({ ...prev, gallery: value as string[] }))}
        />
      </div>

      {/* Meta Fields */}
      <div>
        <label className="block mb-1 font-semibold">Hello Meta</label>
        <input
          type="text"
          value={formData.meta.hello}
          onChange={handleMetaChange("hello")}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Enter hello meta"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">RSS Link</label>
        <input
          type="text"
          value={formData.meta.rsslink}
          onChange={handleMetaChange("rsslink")}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Enter RSS link"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block mb-1 font-semibold">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            status: e.target.value as "publish" | "draft" | "trash"
          }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="draft">Draft</option>
          <option value="publish">Publish</option>
          <option value="trash">Trash</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : initialData?._id ? "Update" : "Create"} {type}
      </button>
    </form>
  )
}