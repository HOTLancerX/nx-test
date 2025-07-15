// components/editor/News.tsx
"use client";
import { useEffect, useState } from "react";
import { NewsSettings } from "@/schema/nx_layouts";

interface NewsSettingsFormProps {
  settings: NewsSettings;
  onChange: (settings: NewsSettings) => void;
}

export default function NewsSettingsForm({ settings, onChange }: NewsSettingsFormProps) {
  const [categories, setCategories] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category?type=post_category", {
          credentials: "include",
        });
        const data = await response.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          value={settings.categoryId || ""}
          onChange={(e) => onChange({ ...settings, categoryId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
        <input
          type="number"
          value={settings.style}
          onChange={(e) => onChange({ ...settings, style: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Post Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Post Limit</label>
        <input
          type="number"
          value={settings.postLimit}
          onChange={(e) => onChange({ ...settings, postLimit: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Grid</label>
          <input
            type="number"
            value={settings.desktopGrid}
            onChange={(e) => onChange({ ...settings, desktopGrid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Grid</label>
          <input
            type="number"
            value={settings.mobileGrid}
            onChange={(e) => onChange({ ...settings, mobileGrid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
