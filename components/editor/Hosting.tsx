// components/editor/Hosting.tsx
"use client";
import { useState } from "react";
import { HostingSettings, HostingFeature, HostingPrice } from "@/schema/nx_layouts";

interface HostingSettingsFormProps {
  settings: HostingSettings;
  onChange: (settings: HostingSettings) => void;
}

export default function HostingSettingsForm({ settings, onChange }: HostingSettingsFormProps) {
  const updateFeature = (index: number, updates: Partial<HostingFeature>) => {
    const newFeatures = [...settings.features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    onChange({ ...settings, features: newFeatures });
  };

  const updatePrice = (featureIndex: number, priceIndex: number, updates: Partial<HostingPrice>) => {
    const newFeatures = [...settings.features];
    newFeatures[featureIndex].prices[priceIndex] = { 
      ...newFeatures[featureIndex].prices[priceIndex], 
      ...updates 
    };
    onChange({ ...settings, features: newFeatures });
  };

  const addFeature = () => {
    const newFeature: HostingFeature = {
        title: "",
        label: "",
        label_color: "",
        prices: [],
        link_name: "",
        link_url: "",
        list_items: []
    };
    onChange({ ...settings, features: [...settings.features, newFeature] });
  };

  const removeFeature = (index: number) => {
    onChange({ ...settings, features: settings.features.filter((_, i) => i !== index) });
  };

  const addPrice = (featureIndex: number) => {
    const newFeatures = [...settings.features];
    newFeatures[featureIndex].prices.push({
      price: 0,
      month: "",
      description: "",
      month_number: 1
    });
    onChange({ ...settings, features: newFeatures });
  };

  const removePrice = (featureIndex: number, priceIndex: number) => {
    const newFeatures = [...settings.features];
    newFeatures[featureIndex].prices = newFeatures[featureIndex].prices.filter((_, i) => i !== priceIndex);
    onChange({ ...settings, features: newFeatures });
  };

  const addListItem = (featureIndex: number) => {
    const newFeatures = [...settings.features];
    newFeatures[featureIndex].list_items.push("");
    onChange({ ...settings, features: newFeatures });
  };

  const removeListItem = (featureIndex: number, itemIndex: number) => {
    const newFeatures = [...settings.features];
    newFeatures[featureIndex].list_items = newFeatures[featureIndex].list_items.filter((_, i) => i !== itemIndex);
    onChange({ ...settings, features: newFeatures });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
            type="text"
            value={settings.title}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Grid</label>
          <input
            type="number"
            value={settings.desktop_grid}
            onChange={(e) => onChange({ ...settings, desktop_grid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min={1}
            max={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Grid</label>
          <input
            type="number"
            value={settings.mobile_grid}
            onChange={(e) => onChange({ ...settings, mobile_grid: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min={1}
            max={2}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={settings.description}
          onChange={(e) => onChange({ ...settings, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      

      <div className="space-y-4">
        <h3 className="font-medium">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Feature {featureIndex + 1}</h4>
                <button
                    onClick={() => removeFeature(featureIndex)}
                    className="text-red-600 hover:text-red-800 text-sm"
                >
                    Remove Feature
                </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(featureIndex, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                            <input
                            type="text"
                            value={feature.label}
                            onChange={(e) => updateFeature(featureIndex, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Label Color</label>
                            <input
                            type="text"
                            value={feature.label_color}
                            onChange={(e) => updateFeature(featureIndex, { label_color: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g. #FF0000 or red"
                            />
                    </div>
                </div>

                <div className="space-y-2">
                    <h5 className="font-medium">Prices</h5>
                    {feature.prices.map((price, priceIndex) => (
                    <div key={priceIndex} className="border p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                        <span>Price {priceIndex + 1}</span>
                        <button
                            type="button"
                            onClick={() => removePrice(featureIndex, priceIndex)}
                            className="text-red-600 hover:text-red-800 text-xs"
                        >
                            Remove
                        </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Price</label>
                                <input
                                type="number"
                                value={price.price}
                                onChange={(e) => updatePrice(featureIndex, priceIndex, { price: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Month</label>
                                <input
                                type="text"
                                value={price.month}
                                onChange={(e) => updatePrice(featureIndex, priceIndex, { month: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Month Number</label>
                                <input
                                type="number"
                                value={price.month_number}
                                onChange={(e) => updatePrice(featureIndex, priceIndex, { month_number: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs text-gray-500 mb-1">Description</label>
                                <textarea
                                value={price.description}
                                onChange={(e) => updatePrice(featureIndex, priceIndex, { description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                rows={2}
                                />
                            </div>
                            
                        </div>
                    </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addPrice(featureIndex)}
                        className="bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                    Add Price
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Name</label>
                    <input
                        type="text"
                        value={feature.link_name}
                        onChange={(e) => updateFeature(featureIndex, { link_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                    <input
                        type="url"
                        value={feature.link_url}
                        onChange={(e) => updateFeature(featureIndex, { link_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <h5 className="font-medium">List Items</h5>
                    {feature.list_items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                        <textarea
                        value={item}
                        onChange={(e) => {
                            const newFeatures = [...settings.features];
                            newFeatures[featureIndex].list_items[itemIndex] = e.target.value;
                            onChange({ ...settings, features: newFeatures });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                        rows={1}
                        />
                        <button
                            type="button"
                            onClick={() => removeListItem(featureIndex, itemIndex)}
                            className="text-red-600 hover:text-red-800"
                        >
                        ×
                        </button>
                    </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addListItem(featureIndex)}
                        className="bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                    Add List Item
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>

        <button
            type="button"
            onClick={addFeature}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Feature
        </button>
      </div>
    </div>
  );
}