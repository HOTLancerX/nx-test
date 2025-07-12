// app/nx-admin/layout/add/page.tsx
"use client"

import LayoutForm from "../Form";
import { useRouter } from "next/navigation";

export default function AddLayout() {
  const router = useRouter();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Layout</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new layout with customizable sections
        </p>
      </div>
      
      <LayoutForm 
        onSuccess={() => router.push('/nx-admin/layout')}
      />
    </div>
  );
}