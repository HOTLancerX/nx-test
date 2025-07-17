import { Settings } from "@/lib/settings"
import Link from "next/link"
import Menu from "./Menu"

export default async function Header() {
  const settings = await Settings()

  return (
    <div className="bg-white">
      <div 
        className="container flex justify-center mx-auto"
        dangerouslySetInnerHTML={{ __html: settings.ads_1 }} 
      />
      <div className="container mx-auto">
        <div className="flex flex-wrap md:flex-row flex-col">
          <Link href="/" className="text-xl text-nowrap font-semibold text-gray-900">{settings.logo || "NX CMS"}</Link>
          <div>
          </div>
          <Menu location="main" style="horizontal" className="border-b pb-4" />
        </div>
      </div>
    </div>
  )
}
