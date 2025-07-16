// components/editor/Banner.tsx
"use client";
import { BannerSettings, BannerItem } from "@/schema/nx_layouts";

interface BannerSettingsFormProps {
  settings: BannerSettings;
  onChange: (settings: BannerSettings) => void;
}

export default function BannerSettingsForm({ settings, onChange }: BannerSettingsFormProps) {
  const addBannerItem = () =>
    onChange({
      ...settings,
      items: [...settings.items, { imageUrl: "", title: "", description: "", link: "" }],
    });

  const updateBannerItem = (index: number, updates: Partial<BannerItem>) => {
    const newItems = [...settings.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...settings, items: newItems });
  };

  const removeBannerItem = (index: number) => {
    onChange({ ...settings, items: settings.items.filter((_, i) => i !== index) });
  };

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

      {/* Title Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title Style</label>
        <select
          value={settings.titleStyle}
          onChange={(e) => onChange({ ...settings, titleStyle: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="text-left">Left</option>
          <option value="text-center">Center</option>
          <option value="text-right">Right</option>
        </select>
      </div>

      {/* Style, Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          value={settings.style}
          onChange={(e) => onChange({ ...settings, style: Number(e.target.value) })}
          placeholder="Style"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          value={settings.desktopGrid}
          onChange={(e) => onChange({ ...settings, desktopGrid: Number(e.target.value) })}
          placeholder="Desktop Grid"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          value={settings.mobileGrid}
          onChange={(e) => onChange({ ...settings, mobileGrid: Number(e.target.value) })}
          placeholder="Mobile Grid"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Banner Items */}
      <div>
        <h4 className="font-medium mb-2">Banner Items</h4>
        {settings.items.map((item, index) => (
          <div key={index} className="border p-3 rounded mb-2">
            <input
              type="url"
              value={item.imageUrl}
              onChange={(e) => updateBannerItem(index, { imageUrl: e.target.value })}
              placeholder="Image URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateBannerItem(index, { title: e.target.value })}
              placeholder="Title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateBannerItem(index, { description: e.target.value })}
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="url"
              value={item.link}
              onChange={(e) => updateBannerItem(index, { link: e.target.value })}
              placeholder="Link"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <button type="button" onClick={() => removeBannerItem(index)} className="text-red-600 text-sm">
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addBannerItem} className="bg-gray-200 px-3 py-1 rounded text-sm mt-2">
          Add Banner Item
        </button>
      </div>
    </div>
  );
}
