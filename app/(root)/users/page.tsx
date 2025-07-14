import { Suspense } from "react"
import UsersListClient from "./UsersListClient" // ✅ static import!

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading users...</div>}>
      <UsersListClient />
    </Suspense>
  )
}
