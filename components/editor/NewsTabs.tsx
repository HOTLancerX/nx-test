"use client"
import { useEffect, useState } from "react"
import type { NewsTabsSettings } from "@/schema/nx_layouts"

interface NewsTabsFormProps {
  settings: NewsTabsSettings
  onChange: (settings: NewsTabsSettings) => void
}

export default function NewsTabsForm({ settings, onChange }: NewsTabsFormProps) {
  const [categories, setCategories] = useState<{ _id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category?type=post_category", {
          credentials: "include",
        })
        const data = await response.json()
        setCategories(Array.isArray(data.categories) ? data.categories : [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = settings.categories.some(cat => cat._id === categoryId)
      ? settings.categories.filter(cat => cat._id !== categoryId)
      : [...settings.categories, categories.find(cat => cat._id === categoryId)!]
    
    onChange({ ...settings, categories: updatedCategories })
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Categories - Multiple Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categories *</label>
        {loading ? (
          <div className="text-sm text-gray-500">Loading categories...</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`cat-${cat._id}`}
                  checked={settings.categories.some(c => c._id === cat._id)}
                  onChange={() => handleCategoryToggle(cat._id)}
                  className="mr-2"
                />
                <label htmlFor={`cat-${cat._id}`}>{cat.title}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
        <input
          type="number"
          min="1"
          value={settings.style || 1}
          onChange={(e) => onChange({ ...settings, style: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Post Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Post Limit</label>
        <input
          type="number"
          min="1"
          value={settings.postLimit || 5}
          onChange={(e) => onChange({ ...settings, postLimit: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Grid</label>
            <input
                type="number"
                min="1"
                value={settings.desktopGrid || 4}
                onChange={(e) => onChange({ ...settings, desktopGrid: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Grid</label>
            <input
                type="number"
                min="1"
                value={settings.mobileGrid || 1}
                onChange={(e) => onChange({ ...settings, mobileGrid: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
        </div>
      </div>
    </div>
  )
}