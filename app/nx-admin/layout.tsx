"use client"
import type React from "react"
import PrivateLayout from "@/components/private-layout"
import Link from "next/link"
import useSettings from "@/lib/useSettings"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { settings } = useSettings()
  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">NX Admin Panel</h1>
              </div>
              <div className="flex items-center space-x-4">
                {settings.siteurl && (
                  <Link
                    href={settings.siteurl}
                    className="text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Site
                  </Link>
                )}
                <Link
                  href="/nx-admin/post"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Post
                </Link>
                <Link
                  href="/nx-admin/post/category"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Category
                </Link>
                <Link
                  href="/nx-admin/page"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Page
                </Link>
                <Link
                  href="/nx-admin/users"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users
                </Link>
                <Link
                  href="/nx-admin/settings"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                    window.location.href = "/login"
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </PrivateLayout>
  )
}
