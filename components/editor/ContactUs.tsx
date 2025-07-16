// components/editor/ContactUs.tsx
"use client"
import { useState } from "react";
import dynamic from "next/dynamic";
import type { ContactSettings, ContactField } from "@/schema/nx_layouts";
import "suneditor/dist/css/suneditor.min.css"
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface ContactSettingsFormProps {
  settings: ContactSettings;
  onChange: (settings: ContactSettings) => void;
}

export default function ContactSettingsForm({ 
  settings, 
  onChange 
}: ContactSettingsFormProps) {
  const [formData, setFormData] = useState<ContactSettings>(settings);

  const handleChange = (field: keyof ContactSettings, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleFieldsChange = (fields: ContactField[]) => {
    const updated = { ...formData, fields };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Form Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <SunEditor
            setContents={formData.description}
            onChange={(content) => handleChange('description', content)}
            setOptions={{
              height: "200px",
              buttonList: [
                ["undo", "redo"],
                ["font", "fontSize"],
                ["paragraphStyle", "blockquote"],
                ["bold", "underline", "italic", "strike"],
                ["fontColor", "hiliteColor"],
                ["align", "list"],
                ["link"],
                ["fullScreen"],
              ],
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>
      </div>

      <ContactFieldsEditor 
        fields={formData.fields} 
        onChange={handleFieldsChange} 
      />
    </div>
  );
}

function ContactFieldsEditor({ 
  fields, 
  onChange 
}: {
  fields: ContactField[];
  onChange: (fields: ContactField[]) => void;
}) {
  const addField = () => {
    onChange([
      ...fields,
      {
        type: "text",
        label: "",
        placeholder: "",
        required: false,
        desktopWidth: "md:w-full",
        mobileWidth: "w-full",
      },
    ]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    onChange(newFields);
  };

  const updateField = (index: number, field: Partial<ContactField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    onChange(newFields);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Form Fields</h3>
      
      {fields.map((field, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="textarea">Textarea</option>
                <option value="url">URL</option>
                <option value="tel">Tel</option>
                <option value="radio">Radio</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="upload">File Upload</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(index, { required: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Required
              </label>
            </div>
          </div>

          {["radio", "select", "checkbox"].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line, format: Label|Value)
              </label>
              <textarea
                value={field.options || ''}
                onChange={(e) => updateField(index, { options: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Example:
First Name|f_name
Last Name|l_name
Email|email"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desktop Width
              </label>
              <select
                value={field.desktopWidth}
                onChange={(e) => updateField(index, { desktopWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="md:w-full">Full Width</option>
                <option value="md:w-1/2">Half Width</option>
                <option value="md:w-1/3">One Third</option>
                <option value="md:w-2/3">Two Thirds</option>
                <option value="md:w-1/4">One Quarter</option>
                <option value="md:w-3/4">Three Quarters</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Width
              </label>
              <select
                value={field.mobileWidth}
                onChange={(e) => updateField(index, { mobileWidth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="w-full">Full Width</option>
                <option value="w-1/2">Half Width</option>
                <option value="w-1/3">One Third</option>
                <option value="w-2/3">Two Thirds</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeField(index)}
            className="mt-2 text-red-600 text-sm font-medium"
          >
            Remove Field
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Field
      </button>
    </div>
  );
}