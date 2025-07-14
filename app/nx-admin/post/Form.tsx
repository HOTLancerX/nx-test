"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import "suneditor/dist/css/suneditor.min.css"

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false })

interface PostFormProps {
  type: "post" | "page"
  initialData?: any
  onSuccess?: () => void // Add onSuccess prop
}

interface Category {
  level: number
  _id: string
  title: string
  parent_id?: string | null // Add parent_id for hierarchy
}

interface Layout {
  _id: string
  title: string
}

export default function PostForm({ type, initialData, onSuccess }: PostFormProps) {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.taxonomy?.map((t: any) => t.term_id) || [],
  )
  const [loading, setLoading] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false) // New state for slug editing

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "", // Add slug to formData
    content: initialData?.content || "",
    status: initialData?.status || "draft",
    images: initialData?.images || "",
    gallery: initialData?.gallery || [],
    layout: initialData?.layout || "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "", // Initialize slug from initialData
        content: initialData.content || "",
        status: initialData.status || "draft",
        images: initialData.images || "",
        gallery: initialData.gallery || [],
        layout: initialData.layout || "",
      })
      if (initialData.slug) {
        setIsSlugManuallyEdited(true) // If initial data has a slug, assume it's not auto-generated
      }
    }

    if (type === "post") {
      const fetchCategories = async () => {
        try {
          const response = await fetch("/api/category?type=post_category", { credentials: "include" })
          const data = await response.json()
          const allCategories: Category[] = data.categories || []

          // Function to build a flat list with indentation for hierarchical display
          const buildCategoryOptions = (
            cats: Category[],
            parentId: string | null = null,
            level = 0
          ): (Category & { level: number })[] => {
            let options: (Category & { level: number })[] = []
            const children = cats.filter((c) => (c.parent_id || null) === parentId)

            for (const cat of children) {
              options.push({ ...cat, level })
              options = options.concat(buildCategoryOptions(cats, cat._id, level + 1))
            }

            return options
          }


          setCategories(buildCategoryOptions(allCategories))
        } catch (err) {
          console.error("Failed to load categories", err)
        }
      }
      fetchCategories()
    }

    if (type === "page") {
      fetch("/api/layout", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setLayouts(data.layouts || [])
        })
        .catch((err) => console.error("Failed to load layouts", err))
    }
  }, [initialData, type])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setFormData((prev) => ({ ...prev, title: newTitle }))
    if (!isSlugManuallyEdited) {
      const newSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, slug: e.target.value }))
    setIsSlugManuallyEdited(true) // User manually edited the slug
  }

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...formData.gallery]
    newGallery[index] = value
    setFormData({ ...formData, gallery: newGallery })
  }

  const addGalleryItem = () => {
    setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ""] }))
  }

  const removeGalleryItem = (index: number) => {
    const newGallery = formData.gallery.filter((_: any, i: number) => i !== index)
    setFormData((prev) => ({ ...prev, gallery: newGallery }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const postData = {
      ...formData,
      type,
      taxonomy:
        type === "post"
          ? selectedCategories.map((id) => ({
              term_id: id,
              taxonomy: `${type}_category`,
            }))
          : [],
    }

    try {
      const method = initialData ? "PUT" : "POST"
      const url = initialData ? `/api/post/${initialData._id}` : "/api/post"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postData),
      })

      const result = await res.json()
      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/nx-admin/post")
        }
      } else {
        console.error(result.message || "Save failed")
        alert(result.message || "Save failed") // Provide user feedback
      }
    } catch (error) {
      console.error("Error saving post:", error)
      alert("An error occurred while saving the post.") // Provide user feedback
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <label htmlFor="title" className="block mb-1 font-semibold">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block mb-1 font-semibold">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={handleSlugChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Auto-generated from title if left empty"
        />
      </div>

      <div>
        <label htmlFor="content" className="block mb-1 font-semibold">
          Content
        </label>
        <SunEditor
          defaultValue={formData.content}
          onChange={(val) => setFormData({ ...formData, content: val })}
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

      {type === "post" && (
        <div>
          <label htmlFor="categories" className="block mb-1 font-semibold">
            Categories
          </label>
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="flex items-center space-x-2"
              style={{ marginLeft: `${cat.level * 16}px` }} // 16px = 1rem indentation per level
            >
              <input
                type="checkbox"
                value={cat._id}
                checked={selectedCategories.includes(cat._id)}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedCategories((prev) =>
                    e.target.checked
                      ? [...prev, value]
                      : prev.filter((id) => id !== value)
                  )
                }}
                className="form-checkbox"
              />
              <span>{cat.title}</span>
            </label>
          ))}
        </div>
      )}

      {type === "page" && (
        <div>
          <label htmlFor="layout" className="block mb-1 font-semibold">
            Layout
          </label>
          <select
            id="layout"
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
      )}

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

      <div>
        <label className="block mb-1 font-semibold">Gallery URLs</label>
        {formData.gallery.map((url: string | number | readonly string[] | undefined, index: number) => (
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
        <label htmlFor="status" className="block mb-1 font-semibold">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as "publish" | "draft" | "trash" })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="draft">Draft</option>
          <option value="publish">Publish</option>
          <option value="trash">Trash</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update" : "Create"} {type === "post" ? "Post" : "Page"}
        </button>
      </div>
    </form>
  )
}
