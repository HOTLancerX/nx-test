import { HeroSettings } from "@/schema/nx_layouts";

// components/editor/Hero.tsx
interface HeroSettingsFormProps {
  settings: HeroSettings;
  onChange: (settings: HeroSettings) => void;
}

export default function HeroSettingsForm({ settings, onChange }: HeroSettingsFormProps) {
  const handleChange = (field: keyof HeroSettings, value: string) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={settings.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link Title
          </label>
          <input
            type="text"
            value={settings.linkTitle}
            onChange={(e) => handleChange('linkTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="text"
            value={settings.link}
            onChange={(e) => handleChange('link', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={settings.imageUrl}
          onChange={(e) => handleChange('imageUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}