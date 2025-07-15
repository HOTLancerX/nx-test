// components/editor/Content.tsx
"use client";
import dynamic from "next/dynamic";
import { ContentSettings } from "@/schema/nx_layouts";
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

interface ContentSettingsFormProps {
  settings: ContentSettings;
  onChange: (settings: ContentSettings) => void;
}

export default function ContentSettingsForm({ settings, onChange }: ContentSettingsFormProps) {
  return (
    <div className="mt-4 space-y-4">
      <input
        type="text"
        value={settings.title}
        onChange={(e) => onChange({ ...settings, title: e.target.value })}
        placeholder="Title"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />

      <SunEditor
        setContents={settings.description}
        onChange={(content) => onChange({ ...settings, description: content })}
        setOptions={{
          height: "200px",
          buttonList: [["bold", "underline", "italic"], ["fontColor", "hiliteColor"], ["align", "list"], ["link"]],
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={settings.linkTitle}
          onChange={(e) => onChange({ ...settings, linkTitle: e.target.value })}
          placeholder="Link Title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="url"
          value={settings.link}
          onChange={(e) => onChange({ ...settings, link: e.target.value })}
          placeholder="Link"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <input
        type="url"
        value={settings.imageUrl}
        onChange={(e) => onChange({ ...settings, imageUrl: e.target.value })}
        placeholder="Image URL"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      {settings.imageUrl && <img src={settings.imageUrl} alt="Preview" className="mt-2 max-w-full rounded" />}
    </div>
  );
}
