import { Settings } from "@/lib/settings"

export default async function Header() {
  const settings = await Settings()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{settings.logo || "NX CMS"}</h1>
          </div>
          <div className="flex items-center">
            {settings.siteurl && (
              <a
                href={settings.siteurl}
                className="text-blue-600 hover:text-blue-800 ml-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Site
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
