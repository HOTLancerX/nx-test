// components/layout/Layout.tsx
"use client"
import { useEffect, useState } from "react";
import News from "./News";
import Banner from "./Banner";

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
    return <div>Loading layout...</div>;
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
            {item.type === 'content' && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <h2 className="text-xl font-bold mb-2">{item.settings.title}</h2>
                  <div 
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: item.settings.description }}
                  />
                  {item.settings.link && (
                    <a 
                      href={item.settings.link} 
                      className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      {item.settings.linkTitle || 'Learn more'}
                    </a>
                  )}
                </div>
                <div className="w-full md:w-1/2">
                  {item.settings.imageUrl && (
                    <img 
                      src={item.settings.imageUrl} 
                      alt={item.settings.title} 
                      className="w-full h-auto rounded"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}