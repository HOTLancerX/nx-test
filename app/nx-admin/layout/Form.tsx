// app/nx-admin/layout/Form.tsx
"use client"
import { useState } from "react";
import { NewsSettings, BannerSettings, HeroSettings, LayoutItem, ContactSettings, ProductSettings, HostingSettings } from "@/schema/nx_layouts";

import NewsSettingsForm from "@/components/editor/News";
import BannerSettingsForm from "@/components/editor/Banner";
import HeroSettingsForm from "@/components/editor/Hero";
import ContactSettingsForm from "@/components/editor/ContactUs";
import ProductSettingsForm from "@/components/editor/Product";
import HostingSettingsForm from "@/components/editor/Hosting";
import Image from "next/image";

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

  const addItem = (type: 'news' | 'banner' | 'hero' | 'contact' | 'product' | 'hosting') => {
    const baseItem: Omit<LayoutItem, 'settings'> = {
      id: `item-${Date.now()}`,
      type,
      position: items.length + 1,
      desktopWidth: 'md:w-full',
      mobileWidth: 'w-full'
    };

    let settings: NewsSettings | BannerSettings | HeroSettings | ContactSettings | ProductSettings | HostingSettings;

    switch(type) {
      case 'news':
        settings = {
          _id: '',
          categoryId: '',
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
      case 'hero':
        settings = {
          title: '',
          description: '',
          linkTitle: '',
          link: '',
          imageUrl: ''
        };
        break;
      case 'contact':
        settings = {
          _id: '',
          title: '',
          description: '',
          email: '',
          phone: '',
          address: '',
          fields: []
        };
        break;
      case 'product':
        settings = {
          name: '',
          email: '',
          phone: '',
          address: '',
          products: []
        };
        break;
      case 'hosting':
        settings = {
          title: '',
          description: '',
          desktop_grid: 3,
          mobile_grid: 1,
          features: [{
            title: '',
            label: '',
            label_color: '#f0f0f0',
            prices: [{
              price: 0,
              month: '',
              description: '',
              month_number: 1
            }],
            link_name: '',
            link_url: '',
            list_items: ['']
          }]
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

            {item.type === 'hero' && (
              <HeroSettingsForm 
                settings={item.settings as HeroSettings}
                onChange={(settings: any) => updateItem(item.id, { settings })}
              />
            )}

            {item.type === 'contact' && (
              <ContactSettingsForm 
                settings={item.settings as ContactSettings}
                onChange={(settings: any) => updateItem(item.id, { settings })}
              />
            )}
            {item.type === 'product' && (
              <ProductSettingsForm 
                settings={item.settings as ProductSettings}
                onChange={(settings) => updateItem(item.id, { settings })}
              />
            )}
            {item.type === 'hosting' && (
              <HostingSettingsForm 
                settings={item.settings as HostingSettings}
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

// Add Layout Popup component
const AddLayoutPopup = ({ onAdd }: { onAdd: (type: 'news' | 'banner' | 'hero' | 'hosting' | 'contact' | 'product') => void }) => {
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
      title: "Hero Block",
      type: "hero" as const
    },
    {
      id: 4,
      icon: "/icon/contact.jpg",
      title: "Contact Form",
      type: "contact" as const
    },
    {
      id: 5,
      icon: "/icon/product.jpg",
      title: "Product Showcase",
      type: "product" as const
    },
    {
      id: 5,
      icon: "/icon/product.jpg",
      title: "Hosting",
      type: "hosting" as const
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
                  <Image
                    src={item.icon || "/placeholder.svg"}
                    width={40}
                    height={40}
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