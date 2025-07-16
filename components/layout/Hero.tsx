// components/layout/Hero.tsx
import { useState } from "react";

interface HeroProps {
  settings: {
    title: string;
    description: string;
    link: string;
    linkTitle: string;
    imageUrl: string;
  };
}

export default function Hero({ settings }: HeroProps) {
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-6">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="w-full md:w-1/2">
            <h2 className="text-xl font-bold mb-2">{settings.title}</h2>
            <div 
            className="prose"
            dangerouslySetInnerHTML={{ __html: settings.description }}
            />
            {settings.link && (
            <a 
                href={settings.link} 
                className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
                {settings.linkTitle || 'Learn more'}
            </a>
            )}
        </div>
        <div className="w-full md:w-1/2">
            {settings.imageUrl && (
            <img 
                src={settings.imageUrl} 
                alt={settings.title} 
                className="w-full h-auto rounded"
            />
            )}
        </div>
    </div>
  );
}