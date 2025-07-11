import Link from 'next/link'

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number
  totalPages: number
  basePath: string
}) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex space-x-2">
        {currentPage > 1 && (
          <li>
            <Link
              href={`${basePath}?page=${currentPage - 1}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Previous
            </Link>
          </li>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li key={page}>
            <Link
              href={`${basePath}?page=${page}`}
              className={`px-3 py-1 border rounded ${
                page === currentPage
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </Link>
          </li>
        ))}

        {currentPage < totalPages && (
          <li>
            <Link
              href={`${basePath}?page=${currentPage + 1}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Next
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}