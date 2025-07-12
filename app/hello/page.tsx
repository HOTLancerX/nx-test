// app/page.tsx
import Layout from "@/components/layout/Layout";
import { Settings } from "@/lib/settings";

export default async function HomePage() {
  const settings = await Settings();
  const layoutId = settings.homepage;

  if (!layoutId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Welcome to our site</h1>
        <p>Please select a homepage layout in the admin settings.</p>
      </div>
    );
  }
  return <Layout id={layoutId} />;
}