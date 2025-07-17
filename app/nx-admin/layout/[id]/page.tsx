// app/nx-admin/layout/[id]/page.tsx
"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import LayoutForm from "../Form";

export default function EditLayout() {
  const router = useRouter();
  const params = useParams();
  const [layout, setLayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/layout/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch layout');
        }
        
        const data = await response.json();
        setLayout(data);
      } catch (error) {
        console.error('Error fetching layout:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLayout();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading layout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
        {error}
        <button 
          onClick={() => router.push('/nx-admin/layout')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Layouts
        </button>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        Layout not found
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Layout</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update layout sections and settings
        </p>
      </div>
      
      <LayoutForm 
        initialData={layout}
        onSuccess={() => router.push('/nx-admin/layout')}
      />
    </div>
  );
}