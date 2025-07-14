"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Pagination from "@/components/Pagination"
import Image from "next/image"

interface User {
  _id: string
  username: string
  slug: string
  email: string
  type: string
  images?: string
  bio?: string
  about?: string
  facebook_link?: string
}

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const page = searchParams.get("page") || "1"

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/list?page=${page}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
          setTotalPages(data.totalPages)
        } else {
          console.error("Failed to fetch users")
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Users</h1>

      {users.length === 0 ? (
        <div className="text-center text-gray-500">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center">
                <Image
                  src={user.images || "/placeholder.svg?height=150&width=150"}
                  alt={user.username}
                  width={150}
                  height={150}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
                <p className="text-gray-600 text-sm mb-2 capitalize">{user.type}</p>
                {user.bio && <p className="text-gray-700 text-sm mb-4 line-clamp-3">{user.bio}</p>}
                <Link
                  href={`/users/${user.slug || user._id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={Number.parseInt(page)} totalPages={totalPages} basePath="/users" />
    </div>
  )
}
