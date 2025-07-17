"use client"
import { useState } from "react"
import type { ProductSettings, ProductItem } from "@/schema/nx_product"
import Image from "next/image"

interface ProductProps {
  settings: ProductSettings
}

interface OrderPopupProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
}

function OrderSuccessPopup({ isOpen, onClose, orderId }: OrderPopupProps) {
  const [copied, setCopied] = useState(false)

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for your order. We'll process it shortly.</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Order ID:</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="font-mono text-lg font-bold text-gray-900">{orderId}</span>
              <button
                onClick={copyOrderId}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <button onClick={onClose} className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Product({ settings }: ProductProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    settings.products.find((p) => p.active) || settings.products[0] || null,
  )
  const [shippingType, setShippingType] = useState<"inside" | "outside">("inside")
  const [quantity, setQuantity] = useState(1)
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [orderId, setOrderId] = useState("")

  const getShippingCost = () => {
    if (!selectedProduct) return 0

    switch (selectedProduct.shipping.type) {
      case "free":
        return 0
      case "flat":
        return selectedProduct.shipping.price || 0
      case "inside_outside":
        return shippingType === "inside"
          ? selectedProduct.shipping.inside_price || 0
          : selectedProduct.shipping.outside_price || 0
      default:
        return 0
    }
  }

  const totalPrice = selectedProduct ? selectedProduct.sale_price * quantity + getShippingCost() : 0

  const handleSubmitOrder = async () => {
    if (!selectedProduct) return

    setIsSubmitting(true)

    try {
      const orderData = {
        user: orderForm,
        items: [
          {
            productId: selectedProduct.title,
            title: selectedProduct.title,
            color: selectedProduct.color,
            image: selectedProduct.image,
            price: selectedProduct.sale_price,
            quantity,
            shipping: {
              type: selectedProduct.shipping.type,
              cost: getShippingCost(),
              area: shippingType === "inside" ? selectedProduct.shipping.inside_area : undefined,
            },
          },
        ],
        totalAmount: totalPrice,
      }

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        setOrderId(result.orderId)
        setShowSuccessPopup(true)
        // Reset form
        setQuantity(1)
        setOrderForm({
          name: settings.name || "",
          email: settings.email || "",
          phone: settings.phone || "",
          address: settings.address || "",
        })
      } else {
        alert(result.message || "Failed to place order")
      }
    } catch (error) {
      console.error("Order submission error:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 w-full space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Order Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  placeholder={settings.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                  placeholder={settings.email || "Enter your email"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder={settings.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  rows={2}
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  placeholder={settings.address}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
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
                    className={`p-4 border rounded-md cursor-pointer ${selectedProduct?.title === product.title ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        width={60}
                        height={60}
                        className="w-15 h-15 object-contain rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.color}</p>
                        <div className="flex justify-between mt-2">
                          {product.regular_price > 0 && (
                            <span className="text-gray-500 line-through">
                              {product.currency}
                              {Number(product.regular_price).toLocaleString()}
                            </span>
                          )}
                          {product.sale_price > 0 && (
                            <span className="font-bold">
                              {product.currency}
                              {Number(product.sale_price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
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
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.title}
                  className="w-full h-64 object-contain rounded"
                />
              </div>
              <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
              <p className="text-gray-600 mb-4">{selectedProduct.color}</p>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-gray-500 line-through">
                  {selectedProduct.currency}
                  {selectedProduct.regular_price.toFixed(0)}
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {selectedProduct.currency}
                  {selectedProduct.sale_price.toFixed(0)}
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-6">
                {selectedProduct.shipping.type === "free" && (
                  <p className="text-green-600">{selectedProduct.shipping.note || "Free Shipping"}</p>
                )}

                {selectedProduct.shipping.type === "flat" && (
                  <div>
                    <p className="font-medium">
                      Shipping: {selectedProduct.currency}
                      {selectedProduct.shipping.price?.toFixed(0)}
                    </p>
                    {selectedProduct.shipping.eta && (
                      <p className="text-sm text-gray-600">Estimated delivery: {selectedProduct.shipping.eta}</p>
                    )}
                  </div>
                )}

                {selectedProduct.shipping.type === "inside_outside" && (
                  <div>
                    <p className="font-medium mb-2">Shipping Options:</p>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setShippingType("inside")}
                        className={`px-3 py-1 rounded ${shippingType === "inside" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      >
                        Inside {selectedProduct.currency}
                        {selectedProduct.shipping.inside_price?.toFixed(0)}
                      </button>
                      <button
                        onClick={() => setShippingType("outside")}
                        className={`px-3 py-1 rounded ${shippingType === "outside" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      >
                        Outside {selectedProduct.currency}
                        {selectedProduct.shipping.outside_price?.toFixed(0)}
                      </button>
                    </div>
                    {selectedProduct.shipping.inside_area && (
                      <p className="text-sm text-gray-600">Inside area: {selectedProduct.shipping.inside_area}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Product Price ({quantity}x):</span>
                  <span>
                    {selectedProduct.currency}
                    {(selectedProduct.sale_price * quantity).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>
                    {selectedProduct.currency}
                    {getShippingCost().toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    {selectedProduct.currency}
                    {totalPrice.toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !orderForm.name || !orderForm.email || !orderForm.phone || !orderForm.address}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderSuccessPopup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} orderId={orderId} />
    </>
  )
}