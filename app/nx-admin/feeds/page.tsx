"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PopUp from "./PopUp"

interface Feed {
  _id: string
  title: string
  url: string
  category_id: string
  user_id: string // Added user_id
  active: boolean
  last_fetched?: string
}

export default function FeedsPage() {
  const router = useRouter()
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null)
  const [error, setError] = useState<string | null>(null) // State for error messages

  useEffect(() => {
    fetchFeeds()
  }, [currentPage])

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const response = await fetch(`/api/feeds?page=${currentPage}`, {
        credentials: "include", // Crucial for sending auth cookie
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch feeds: ${response.status}`)
      }

      const data = await response.json()
      if (Array.isArray(data.feeds)) {
        // Ensure data.feeds is an array
        setFeeds(data.feeds)
        setTotalPages(data.totalPages)
      } else {
        throw new Error("Invalid data format received for feeds.")
      }
    } catch (error) {
      console.error("Error fetching feeds:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred while fetching feeds.")
    } finally {
      setLoading(false)
    }
  }

  const deleteFeed = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feed?")) return

    try {
      const response = await fetch(`/api/feeds/${id}`, {
        method: "DELETE",
        credentials: "include", // Crucial for sending auth cookie
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to delete feed: ${response.status}`)
      }

      fetchFeeds() // Re-fetch feeds after successful deletion
    } catch (error) {
      console.error("Error deleting feed:", error)
      alert(error instanceof Error ? error.message : "An error occurred while deleting the feed.")
    }
  }

  const handleSync = async () => {
    try {
      const response = await fetch("/api/rss-sync", {
        credentials: "include", // Crucial for sending auth cookie
      })
      const result = await response.json()
      if (result.success) {
        alert(`RSS sync completed. Imported ${result.imported} items.`)
        fetchFeeds() // Re-fetch feeds to update last_fetched time
      } else {
        alert("RSS sync failed: " + (result.error || result.message))
      }
    } catch (error) {
      console.error("Error syncing RSS:", error)
      alert("Error syncing RSS feeds")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading feeds...</div>
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchFeeds}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">RSS Feeds</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your RSS feed sources and automatic post imports</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            onClick={() => {
              setEditingFeed(null)
              setShowPopup(true)
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Feed
          </button>
          <button
            onClick={handleSync}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            Sync Now
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feeds.map((feed) => (
              <tr key={feed._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{feed.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 max-w-xs truncate">{feed.url}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{feed.category_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{feed.user_id}</div> {/* Display user_id */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      feed.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {feed.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {feed.last_fetched ? new Date(feed.last_fetched).toLocaleString() : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingFeed(feed)
                      setShowPopup(true)
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteFeed(feed._id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {showPopup && (
        <PopUp
          feed={editingFeed}
          onClose={() => {
            setShowPopup(false)
            setEditingFeed(null)
          }}
          onSave={() => {
            setShowPopup(false)
            fetchFeeds()
          }}
        />
      )}
    </div>
  )
}