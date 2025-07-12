// components/layout/Banner.tsx
import { useState } from "react";
import Link from "next/link";

interface BannerProps {
  settings: {
    title: string;
    titleStyle: 'text-left' | 'text-center' | 'text-right';
    style: number;
    desktopGrid: number;
    mobileGrid: number;
    items: {
      imageUrl: string;
      title: string;
      description: string;
      link: string;
    }[];
  };
}

export default function Banner({ settings }: BannerProps) {
  const [banners, setBanners] = useState(settings.items || []);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <div>Loading banners...</div>;
  }

  if (banners.length === 0) {
    return <div>No banners found</div>;
  }

  return (
    <div className="w-full">
      <h2 className={`text-xl font-bold mb-4 ${settings.titleStyle}`}>
        {settings.title}
      </h2>
      
      {settings.style === 1 && (
        <div className={`grid grid-cols-${settings.mobileGrid} md:grid-cols-${settings.desktopGrid} gap-4`}>
          {banners.map((banner, index) => (
            <div key={index} className="relative group">
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-48 object-cover rounded"
              />
              <div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                  <p className="text-sm mb-2">{banner.description}</p>
                  {banner.link && (
                    <Link 
                      href={banner.link}
                      className="inline-block bg-white text-black px-3 py-1 rounded text-sm hover:bg-gray-100"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {settings.style === 2 && (
        <div className="w-full">
          {banners.length > 0 && (
            <div className="mb-6">
              <div className="relative h-64 w-full">
                <img 
                  src={banners[0].imageUrl} 
                  alt={banners[0].title} 
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-6">
                  <div className="text-white text-center max-w-2xl">
                    <h3 className="font-bold text-2xl mb-2">{banners[0].title}</h3>
                    <p className="text-lg mb-4">{banners[0].description}</p>
                    {banners[0].link && (
                      <Link 
                        href={banners[0].link}
                        className="inline-block bg-white text-black px-4 py-2 rounded hover:bg-gray-100"
                      >
                        Learn More
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {banners.length > 1 && (
            <div className={`grid grid-cols-1 md:grid-cols-${settings.desktopGrid} gap-4`}>
              {banners.slice(1).map((banner, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-center">
                      <h3 className="font-bold">{banner.title}</h3>
                      {banner.link && (
                        <Link 
                          href={banner.link}
                          className="inline-block bg-white text-black px-2 py-1 rounded text-xs hover:bg-gray-100 mt-1"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {settings.style === 3 && (
        <div className="w-full">
          {banners.length > 0 && (
            <div className="mb-6">
              <div className="relative h-64 w-full">
                <img 
                  src={banners[0].imageUrl} 
                  alt={banners[0].title} 
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-6">
                  <div className="text-white text-center max-w-2xl">
                    <h3 className="font-bold text-2xl mb-2">{banners[0].title}</h3>
                    <p className="text-lg mb-4">{banners[0].description}</p>
                    {banners[0].link && (
                      <Link 
                        href={banners[0].link}
                        className="inline-block bg-white text-black px-4 py-2 rounded hover:bg-gray-100"
                      >
                        Learn More
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {banners.length > 2 && (
            <div className={`mb-6 grid grid-cols-1 md:grid-cols-${settings.desktopGrid} gap-4`}>
              {banners.slice(1, banners.length - 1).map((banner, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-center">
                      <h3 className="font-bold">{banner.title}</h3>
                      {banner.link && (
                        <Link 
                          href={banner.link}
                          className="inline-block bg-white text-black px-2 py-1 rounded text-xs hover:bg-gray-100 mt-1"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {banners.length > 1 && (
            <div className="relative h-64 w-full">
              <img 
                src={banners[banners.length - 1].imageUrl} 
                alt={banners[banners.length - 1].title} 
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-6">
                <div className="text-white text-center max-w-2xl">
                  <h3 className="font-bold text-2xl mb-2">{banners[banners.length - 1].title}</h3>
                  <p className="text-lg mb-4">{banners[banners.length - 1].description}</p>
                  {banners[banners.length - 1].link && (
                    <Link 
                      href={banners[banners.length - 1].link}
                      className="inline-block bg-white text-black px-4 py-2 rounded hover:bg-gray-100"
                    >
                      Learn More
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}