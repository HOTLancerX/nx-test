// app/hello/page.tsx
import { Settings } from "@/lib/settings"

export default async function HelloPage() {
  // Fetch settings directly from database (server-side)
  const settings = await Settings()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {settings.logo || "NX CMS"}
        </h1>
        
        <div className="space-y-6">
          {/* Display basic settings info */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Site Information</h2>
            <p className="text-gray-600">
              <span className="font-medium">Title:</span> {settings.site_title || "Not set"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Description:</span> {settings.site_description || "Not set"}
            </p>
          </div>

          {/* Display Q&A if available */}
          {settings.QnA?.length > 0 && (
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">FAQ</h2>
              <div className="space-y-4">
                {settings.QnA.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium text-blue-600">{item.question}</h3>
                    <p className="text-gray-700 mt-1">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact information */}
          {(settings.contact_email || settings.phone) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.contact_email && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <a 
                      href={`mailto:${settings.contact_email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {settings.contact_email}
                    </a>
                  </div>
                )}
                {settings.phone && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium text-gray-700">Phone</h3>
                    <a 
                      href={`tel:${settings.phone}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {settings.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 text-center text-gray-500 text-sm">
            <p>This page is accessible to all visitors, whether logged in or not.</p>
            <p className="mt-1">Data fetched directly from database on the server.</p>
          </div>
        </div>
      </div>
    </div>
  )
}