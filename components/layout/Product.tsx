// components/layout/Product.tsx
"use client";
import { useState } from "react";
import { ProductSettings, ProductItem } from "@/schema/nx_product";
import Image from "next/image";

interface ProductProps {
  settings: ProductSettings;
}

export default function Product({ settings }: ProductProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    settings.products.find(p => p.active) || settings.products[0] || null
  );
  const [shippingType, setShippingType] = useState<'inside' | 'outside'>('inside');

  const totalPrice = selectedProduct ? 
    selectedProduct.sale_price + 
    (selectedProduct.shipping.type === 'flat' ? (selectedProduct.shipping.price || 0) : 0) +
    (selectedProduct.shipping.type === 'inside_outside' ? 
      (shippingType === 'inside' ? (selectedProduct.shipping.inside_price || 0) : (selectedProduct.shipping.outside_price || 0)) : 0)
    : 0;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 w-full space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Contact Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder={settings.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder={settings.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder={settings.phone}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                rows={2}
                placeholder={settings.address}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

        {settings.products.length > 1 && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Available Products</h2>
          <div className="space-y-2">
            {settings.products.map((product, index) => (
              <div
                key={index}
                onClick={() => setSelectedProduct(product)}
                className={`p-4 border rounded-md cursor-pointer ${selectedProduct?.title === product.title ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  width={200}
                  height={200}
                  className="w-20 h-20 object-contain rounded"
                />
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-sm text-gray-600">{product.color}</p>
                <p>
                  {product.shipping.type}
                </p>
                <div className="flex justify-between mt-2">
                  {product.regular_price > 0 && (
                    <span className="text-gray-500 line-through">
                      Tk.{Number(product.regular_price).toLocaleString()}
                    </span>
                  )}
                  {product.sale_price > 0 && (
                    <span className="font-bold">
                      Tk.{Number(product.sale_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {selectedProduct && (
        <div className="md:w-1/2 w-full">
          <div className="border p-6 rounded-lg">
            <div className="mb-4">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title} 
                className="w-full h-64 object-contain rounded"
              />
            </div>
            <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
            <p className="text-gray-600 mb-4">{selectedProduct.color}</p>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-gray-500 line-through">${selectedProduct.regular_price.toFixed(0)}</span>
              <span className="text-xl font-bold text-blue-600">${selectedProduct.sale_price.toFixed(0)}</span>
              <span className="text-sm text-gray-500">{selectedProduct.currency}</span>
            </div>

            <div className="mb-6">
              {selectedProduct.shipping.type === 'free' && (
                <p className="text-green-600">{selectedProduct.shipping.note || 'Free Shipping'}</p>
              )}
              
              {selectedProduct.shipping.type === 'flat' && (
                <div>
                  <p className="font-medium">Shipping: ${selectedProduct.shipping.price?.toFixed(0)}</p>
                  {selectedProduct.shipping.eta && (
                    <p className="text-sm text-gray-600">Estimated delivery: {selectedProduct.shipping.eta}</p>
                  )}
                </div>
              )}
              
              {selectedProduct.shipping.type === 'inside_outside' && (
                <div>
                  <p className="font-medium mb-2">Shipping Options:</p>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setShippingType('inside')}
                      className={`px-3 py-1 rounded ${shippingType === 'inside' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      Inside ${selectedProduct.shipping.inside_price?.toFixed(0)}
                    </button>
                    <button
                      onClick={() => setShippingType('outside')}
                      className={`px-3 py-1 rounded ${shippingType === 'outside' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      Outside ${selectedProduct.shipping.outside_price?.toFixed(0)}
                    </button>
                  </div>
                  {selectedProduct.shipping.inside_area}
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Product Price:</span>
                <span>${selectedProduct.sale_price.toFixed(0)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>
                  {selectedProduct.shipping.type === 'free' ? '$0.00' : 
                   selectedProduct.shipping.type === 'flat' ? `$${selectedProduct.shipping.price?.toFixed(0)}` : 
                   shippingType === 'inside' ? `$${selectedProduct.shipping.inside_price?.toFixed(0)}` : 
                   `$${selectedProduct.shipping.outside_price?.toFixed(0)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${totalPrice.toFixed(0)}</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium">
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}