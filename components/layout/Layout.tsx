// components/layout/Layout.tsx
"use client"
import { useEffect, useState } from "react";
import News from "./News";
import Banner from "./Banner";
import Hero from "./Hero";
import ContactUs from "./ContactUs";
import Product from "./Product";


interface Props {
  id: string;
}

export default function Layout({ id }: Props) {
  const [layout, setLayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(`/api/layout/${id}`);
        const data = await response.json();
        setLayout(data);
      } catch (error) {
        console.error("Error fetching layout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-6">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!layout) {
    return <div>Layout not found</div>;
  }

  return (
    <div className="flex flex-wrap flex-col md:flex-row gap-4">
      {layout.items
        .sort((a: any, b: any) => a.position - b.position)
        .map((item: any) => (
          <div 
            key={item.id}
            className={`${item.mobileWidth} ${item.desktopWidth}`}
          >
            {item.type === 'news' && <News settings={item.settings} />}
            {item.type === 'banner' && <Banner settings={item.settings} />}
            {item.type === 'hero' && <Hero settings={item.settings} />}
            {item.type === 'product' && <Product settings={item.settings} />}
            {item.type === 'contact' && <ContactUs {...item.settings} onSubmit={async (data: any) => console.log(data)} />}
          </div>
        ))}
    </div>
  );
}