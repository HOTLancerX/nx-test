// app/nx-admin/layout/Form.tsx
"use client"
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NewsSettings, BannerSettings, ContentSettings, LayoutItem, BannerItem } from "@/schema/nx_layouts";
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface LayoutFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    items?: LayoutItem[];
  };
  onSuccess?: () => void;
}

export default function LayoutForm({ initialData, onSuccess }: LayoutFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [items, setItems] = useState<LayoutItem[]>(initialData?.items || []);
  const [loading, setLoading] = useState(false);

  const addItem = (type: 'news' | 'banner' | 'content') => {
    const baseItem: Omit<LayoutItem, 'settings'> = {
      id: `item-${Date.now()}`,
      type,
      position: items.length + 1,
      desktopWidth: 'w-full',
      mobileWidth: 'w-full'
    };

    let settings: NewsSettings | BannerSettings | ContentSettings;

    switch(type) {
      case 'news':
        settings = {
          title: '',
          style: 1,
          postLimit: 5,
          desktopGrid: 1,
          mobileGrid: 1
        };
        break;
      case 'banner':
        settings = {
          title: '',
          titleStyle: 'text-left',
          style: 1,
          desktopGrid: 1,
          mobileGrid: 1,
          items: []
        };
        break;
      case 'content':
        settings = {
          title: '',
          description: '',
          linkTitle: '',
          link: '',
          imageUrl: ''
        };
        break;
    }

    setItems([...items, { ...baseItem, settings }]);
  };

  const updateItem = (id: string, updates: Partial<LayoutItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = initialData?._id 
        ? `/api/layout/${initialData._id}` 
        : '/api/layout';
      const method = initialData?._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          items
        }),
      });
      
      if (response.ok && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving layout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layout Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg">
            <h3 className="text-lg font-medium capitalize">{item.type} Section</h3>
            
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="number"
                  value={item.position}
                  onChange={(e) => updateItem(item.id, { position: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desktop Width
                </label>
                <select
                  value={item.desktopWidth}
                  onChange={(e) => updateItem(item.id, { desktopWidth: e.target.value as any })}
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
                  value={item.mobileWidth}
                  onChange={(e) => updateItem(item.id, { mobileWidth: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="w-full">Full Width</option>
                  <option value="w-1/2">Half Width</option>
                  <option value="w-1/3">One Third</option>
                  <option value="w-2/3">Two Thirds</option>
                </select>
              </div>
            </div>

            {/* Type-specific settings */}
            {item.type === 'news' && (
              <NewsSettingsForm 
                settings={item.settings as NewsSettings}
                onChange={(settings) => updateItem(item.id, { settings })}
              />
            )}

            {item.type === 'banner' && (
              <BannerSettingsForm 
                settings={item.settings as BannerSettings}
                onChange={(settings) => updateItem(item.id, { settings })}
              />
            )}

            {item.type === 'content' && (
              <ContentSettingsForm 
                settings={item.settings as ContentSettings}
                onChange={(settings) => updateItem(item.id, { settings })}
              />
            )}

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Remove Section
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <AddLayoutPopup onAdd={addItem} />
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Layout"}
        </button>
      </div>
    </form>
  );
}

// Component for News settings
const NewsSettingsForm = ({
  settings,
  onChange,
}: {
  settings: NewsSettings;
  onChange: (settings: NewsSettings) => void;
}) => {
  const [categories, setCategories] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category?type=post_category", {
          credentials: "include", // Ensure cookies are sent
        });
        const data = await response.json();

        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Style
        </label>
        <input
          type="number"
          value={settings.style}
          onChange={(e) => onChange({ ...settings, style: Number(e.target.value) })}
          min="1"
          max="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Post Limit
        </label>
        <input
          type="number"
          value={settings.postLimit}
          onChange={(e) => onChange({ ...settings, postLimit: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desktop Grid
          </label>
          <input
            type="number"
            value={settings.desktopGrid}
            onChange={(e) => onChange({ ...settings, desktopGrid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Grid
          </label>
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
};


// Component for Banner settings
const BannerSettingsForm = ({ 
  settings, 
  onChange 
}: { 
  settings: BannerSettings, 
  onChange: (settings: BannerSettings) => void 
}) => {
  const addBannerItem = () => {
    onChange({
      ...settings,
      items: [...settings.items, {
        imageUrl: '',
        title: '',
        description: '',
        link: ''
      }]
    });
  };

  const updateBannerItem = (index: number, updates: Partial<BannerItem>) => {
    const newItems = [...settings.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...settings, items: newItems });
  };

  const removeBannerItem = (index: number) => {
    onChange({
      ...settings,
      items: settings.items.filter((_, i) => i !== index)
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
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title Style
        </label>
        <select
          value={settings.titleStyle}
          onChange={(e) => onChange({ 
            ...settings, 
            titleStyle: e.target.value as 'text-left' | 'text-center' | 'text-right' 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="text-left">Left</option>
          <option value="text-center">Center</option>
          <option value="text-right">Right</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Style
          </label>
          <input
            type="number"
            value={settings.style}
            onChange={(e) => onChange({ ...settings, style: Number(e.target.value) })}
            min="1"
            max="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desktop Grid
          </label>
          <input
            type="number"
            value={settings.desktopGrid}
            onChange={(e) => onChange({ ...settings, desktopGrid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Grid
          </label>
          <input
            type="number"
            value={settings.mobileGrid}
            onChange={(e) => onChange({ ...settings, mobileGrid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Banner Items</h4>
        {settings.items.map((item, index) => (
          <div key={index} className="border p-3 rounded mb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={item.imageUrl}
                  onChange={(e) => updateBannerItem(index, { imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateBannerItem(index, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateBannerItem(index, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
                </label>
                <input
                  type="url"
                  value={item.link}
                  onChange={(e) => updateBannerItem(index, { link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeBannerItem(index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove Item
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addBannerItem}
          className="mt-2 bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
        >
          Add Banner Item
        </button>
      </div>
    </div>
  );
};

// Component for Content settings
const ContentSettingsForm = ({ 
  settings, 
  onChange 
}: { 
  settings: ContentSettings, 
  onChange: (settings: ContentSettings) => void 
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <SunEditor
          setContents={settings.description}
          onChange={(content) => onChange({ ...settings, description: content })}
          setOptions={{
            height: "200px",
            buttonList: [
              ['bold', 'underline', 'italic'],
              ['fontColor', 'hiliteColor'],
              ['align', 'list'],
              ['link']
            ]
          }}
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
            onChange={(e) => onChange({ ...settings, linkTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link
          </label>
          <input
            type="url"
            value={settings.link}
            onChange={(e) => onChange({ ...settings, link: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={settings.imageUrl}
          onChange={(e) => onChange({ ...settings, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {settings.imageUrl && (
          <img 
            src={settings.imageUrl} 
            alt="Preview" 
            className="mt-2 max-w-full h-auto rounded"
          />
        )}
      </div>
    </div>
  );
};

// Add Layout Popup component
const AddLayoutPopup = ({ onAdd }: { onAdd: (type: 'news' | 'banner' | 'content') => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      id: 1,
      icon: "/icon/news.jpg",
      title: "News Style",
      type: "news" as const
    },
    {
      id: 2,
      icon: "/icon/element-2.jpg",
      title: "Banner Style",
      type: "banner" as const
    },
    {
      id: 3,
      icon: "/icon/element1.jpg",
      title: "Content Block",
      type: "content" as const
    }
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Add Section
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Section</h2>
            <p className="mb-4">Select a section type to add:</p>
            
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onAdd(item.type);
                    setIsOpen(false);
                  }}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <img 
                    src={item.icon} 
                    alt={item.title} 
                    className="w-10 h-10 mr-3 object-cover rounded"
                  />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};