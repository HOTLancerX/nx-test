'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

interface PostFormProps {
  type: 'post' | 'page';
  initialData?: any;
}

interface Category {
  _id: string;
  title: string;
}

interface Layout {
  _id: string;
  title: string;
}

export default function PostForm({ type, initialData }: PostFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.taxonomy?.map((t: any) => t.term_id) || []);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    status: initialData?.status || 'draft',
    images: initialData?.images || '',
    gallery: initialData?.gallery || [],
    layout: initialData?.layout || '',
  });

  useEffect(() => {
    if (type === 'post') {
      fetch('/api/category?type=post_category', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories || []);
        })
        .catch((err) => console.error('Failed to load categories', err));
    }
    if (type === 'page') {
      fetch('/api/layout', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setLayouts(data.layouts || []);
        })
        .catch((err) => console.error('Failed to load layouts', err));
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      ...formData,
      type,
      taxonomy: type === 'post'
        ? selectedCategories.map((id) => ({
            term_id: id,
            taxonomy: `${type}_category`,
          }))
        : [],
    };

    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/post/${initialData._id}` : '/api/post';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      const result = await res.json();
      if (res.ok) {
        router.push('/nx-admin/post');
      } else {
        console.error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <label className="block mb-1 font-semibold">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Content</label>
        <SunEditor
          defaultValue={formData.content}
          onChange={(val) => setFormData({ ...formData, content: val })}
          setOptions={{
            height: "300px",
            buttonList: [
              ['undo', 'redo'],
              ['bold', 'underline', 'italic'],
              ['fontColor', 'hiliteColor'],
              ['align', 'list'],
              ['link', 'image'],
            ]
          }}
        />
      </div>

      {type === 'post' && (
        <div>
          <label className="block mb-1 font-semibold">Categories</label>
          <select
            multiple
            value={selectedCategories}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              setSelectedCategories(selected);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === 'page' && (
        <div>
          <label className="block mb-1 font-semibold">Layout</label>
          <select
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
        <label className="block mb-1 font-semibold">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="draft">Draft</option>
          <option value="publish">Publish</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}
