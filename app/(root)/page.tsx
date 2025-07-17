import { Settings } from "@/lib/settings"
import Layout from "@/components/layout/Layout"

export default async function HomePage() {
  const settings = await Settings()

  return (
    <div>
      {settings.homepage ? (
        <Layout id={settings.homepage} />
      ) : (
        <>
          <main className="py-6 container mx-auto">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  {settings.site_title || "Welcome to NX CMS"}
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  {settings.site_description ||
                    "A powerful content management system built with Next.js 15, TypeScript, and MongoDB."}
                </p>
              </div>

              {/* Q&A Section */}
              {settings.QnA && settings.QnA.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {settings.QnA.map((item: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h3 className="text-lg font-semibold text-blue-600 mb-1">{item.question}</h3>
                        <p className="text-gray-700">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(settings.contact_email || settings.phone) && (
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.contact_email && (
                      <div>
                        <h3 className="font-semibold text-gray-700">Email</h3>
                        <a href={`mailto:${settings.contact_email}`} className="text-blue-600 hover:text-blue-800">
                          {settings.contact_email}
                        </a>
                      </div>
                    )}
                    {settings.phone && (
                      <div>
                        <h3 className="font-semibold text-gray-700">Phone</h3>
                        <a href={`tel:${settings.phone}`} className="text-blue-600 hover:text-blue-800">
                          {settings.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  )
}