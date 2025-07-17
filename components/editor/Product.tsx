// components/editor/Product.tsx
"use client";
import { useState } from "react";
import { ProductSettings, ProductItem, ShippingOption } from "@/schema/nx_product";

interface ProductSettingsFormProps {
  settings: ProductSettings;
  onChange: (settings: ProductSettings) => void;
}

export default function ProductSettingsForm({ settings, onChange }: ProductSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const updateProduct = (index: number, updates: Partial<ProductItem>) => {
    const newProducts = [...settings.products];
    newProducts[index] = { ...newProducts[index], ...updates };
    onChange({ ...settings, products: newProducts });
  };

  const updateShipping = (productIndex: number, updates: Partial<ShippingOption>) => {
    const newProducts = [...settings.products];
    newProducts[productIndex].shipping = { 
      ...newProducts[productIndex].shipping, 
      ...updates 
    };
    onChange({ ...settings, products: newProducts });
  };

  const addProduct = () => {
    const newProduct: ProductItem = {
      active: false,
      title: "",
      color: "",
      image: "",
      regular_price: 0,
      sale_price: 0,
      currency: "USD",
      shipping: { type: "free", note: "" }
    };
    onChange({ ...settings, products: [...settings.products, newProduct] });
  };

  const removeProduct = (index: number) => {
    const newProducts = settings.products.filter((_, i) => i !== index);
    onChange({ ...settings, products: newProducts });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => onChange({ ...settings, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => onChange({ ...settings, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => onChange({ ...settings, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => onChange({ ...settings, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Products</h3>
        
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {settings.products.map((product, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-md ${activeTab === index ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {product.title || `Product ${index + 1}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addProduct}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Product
          </button>
        </div>

        {settings.products.length > 0 && (
          <div className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.products[activeTab].active}
                  onChange={(e) => updateProduct(activeTab, { active: e.target.checked })}
                  className="mr-2"
                />
                Active Product
              </label>
              <button
                type="button"
                onClick={() => removeProduct(activeTab)}
                className="text-red-600 hover:text-red-800"
              >
                Remove Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={settings.products[activeTab].title}
                  onChange={(e) => updateProduct(activeTab, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={settings.products[activeTab].color}
                  onChange={(e) => updateProduct(activeTab, { color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={settings.products[activeTab].image}
                  onChange={(e) => updateProduct(activeTab, { image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={settings.products[activeTab].currency}
                  onChange={(e) => updateProduct(activeTab, { currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price</label>
                <input
                  type="number"
                  value={settings.products[activeTab].regular_price}
                  onChange={(e) => updateProduct(activeTab, { regular_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                <input
                  type="number"
                  value={settings.products[activeTab].sale_price}
                  onChange={(e) => updateProduct(activeTab, { sale_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Shipping Options</h4>
              <select
                value={settings.products[activeTab].shipping.type}
                onChange={(e) => updateShipping(activeTab, { type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              >
                <option value="free">Free Shipping</option>
                <option value="flat">Flat Rate</option>
                <option value="inside_outside">Inside/Outside Area</option>
              </select>

              {settings.products[activeTab].shipping.type === 'free' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <input
                    type="text"
                    value={settings.products[activeTab].shipping.note || ''}
                    onChange={(e) => updateShipping(activeTab, { note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              {settings.products[activeTab].shipping.type === 'flat' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={settings.products[activeTab].shipping.price || 0}
                      onChange={(e) => updateShipping(activeTab, { price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ETA</label>
                    <input
                      type="text"
                      value={settings.products[activeTab].shipping.eta || ''}
                      onChange={(e) => updateShipping(activeTab, { eta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              {settings.products[activeTab].shipping.type === 'inside_outside' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inside Price</label>
                    <input
                      type="number"
                      value={settings.products[activeTab].shipping.inside_price || 0}
                      onChange={(e) => updateShipping(activeTab, { inside_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outside Price</label>
                    <input
                      type="number"
                      value={settings.products[activeTab].shipping.outside_price || 0}
                      onChange={(e) => updateShipping(activeTab, { outside_price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inside Area</label>
                    <input
                      type="text"
                      value={settings.products[activeTab].shipping.inside_area || ''}
                      onChange={(e) => updateShipping(activeTab, { inside_area: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}