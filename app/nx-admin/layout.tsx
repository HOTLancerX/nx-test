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
      <div className="bg-white container mx-auto">
        <nav className="bg-white shadow">
          <div className="">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/nx-admin" className="text-xl font-semibold text-gray-900">NX Admin</Link>
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
                  href="/nx-admin/feeds"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Feeds
                </Link>
                <Link
                  href="/nx-admin/layout"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Layout
                </Link>
                <Link
                  href="/nx-admin/menu"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Menu
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
                <Link
                  href="/nx-admin/ads"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ads
                </Link>
                <Link
                  href="/nx-admin/order"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Orders
                </Link>
                <Link
                  href="/nx-admin/tools"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tools
                </Link>
                <Link
                  href="/nx-admin/contact"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contact
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
        <main className="py-4">{children}</main>
      </div>
    </PrivateLayout>
  )
}
