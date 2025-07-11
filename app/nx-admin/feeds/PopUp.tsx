"use client"
import { useState, useEffect } from "react"

interface PopUpProps {
  feed: {
    _id?: string
    title?: string
    url?: string
    category_id?: string
    active?: boolean
  } | null
  onClose: () => void
  onSave: () => void
}

export default function PopUp({ feed, onClose, onSave }: PopUpProps) {
  const [title, setTitle] = useState(feed?.title || "")
  const [url, setUrl] = useState(feed?.url || "")
  const [categoryId, setCategoryId] = useState(feed?.category_id || "")
  const [active, setActive] = useState(feed?.active !== false)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category?type=post_category")
        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error("URL must start with http:// or https://")
      }

      // Validate category
      if (!categoryId) {
        throw new Error("Please select a category")
      }

      const feedData = {
        title,
        url,
        category_id: categoryId,
        active
      }

      const submitUrl = feed?._id ? `/api/feeds/${feed._id}` : "/api/feeds"
      const method = feed?._id ? "PUT" : "POST"

      const response = await fetch(submitUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save feed")
      }

      onSave()
    } catch (error) {
      console.error("Error saving feed:", error)
      setError(error instanceof Error ? error.message : "Failed to save feed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {feed?._id ? "Edit Feed" : "Add New Feed"}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RSS URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              placeholder="https://example.com/feed.xml"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}