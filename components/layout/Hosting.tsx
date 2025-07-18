// components/layout/Hosting.tsx
"use client";
import { useState } from "react";
import { HostingSettings } from "@/schema/nx_layouts";

interface HostingProps {
  settings: HostingSettings;
}

export default function Hosting({ settings }: HostingProps) {
  // Provide safe defaults
  const safeSettings = {
    title: settings.title || '',
    description: settings.description || '',
    desktop_grid: settings.desktop_grid || 3,
    mobile_grid: settings.mobile_grid || 1,
    features: settings.features || []
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{safeSettings.title}</h2>
        {safeSettings.description && (
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{safeSettings.description}</p>
        )}
      </div>

      {safeSettings.features.length > 0 && (
        <div className={`grid md:grid-cols-${safeSettings.desktop_grid} grid-cols-${safeSettings.mobile_grid} gap-6`}>
          {safeSettings.features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={feature} 
              isFirst={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const FeatureCard = ({ feature, isFirst }: { feature: any, isFirst: boolean }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      {feature.title && (
        <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
      )}
      {feature.label && (
        <div 
          className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
          style={{ backgroundColor: feature.label_color || '#f0f0f0' }}
        >
          {feature.label}
        </div>
      )}

      {feature.prices.length > 0 && (
        <div className="mb-4">
          
          {/* Show active price content */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                ${feature.prices[activeTab]?.price.toFixed(2)}
              </span>
            </div>
            {feature.prices[activeTab]?.description && (
              <p className="text-sm text-gray-600 mt-1">
                {feature.prices[activeTab]?.description}
              </p>
            )}
          </div>
        
          {/* Show tabs only if more than one price */}
          {feature.prices.length > 1 ? (
            <div className="flex mb-4">
              {feature.prices.map((price?: any, index?: any) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 font-medium ${activeTab === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {price.month_number}/{price.month}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mb-2">
              {feature.prices[0].month_number}/{feature.prices[0].month}
            </div>
          )}
        </div>
      )}

      {feature.list_items.length > 0 && (
        <ul className="space-y-2 mb-4">
          {feature.list_items.map((item: string, itemIndex?: number) => (
            <li key={itemIndex} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {feature.link_url && feature.link_name && (
        <a
          href={feature.link_url}
          className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {feature.link_name}
        </a>
      )}
    </div>
  );
};