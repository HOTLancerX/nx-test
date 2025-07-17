"use client"
import { useState } from "react"
import type React from "react"

interface OrderDetails {
  _id: string
  orderId: string
  user: {
    name: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    title: string
    color: string
    image: string
    price: number
    quantity: number
    shipping: {
      type: string
      cost: number
    }
  }>
  totalAmount: number
  status: string
  statusHistory: Array<{
    status: string
    note: string
    updatedAt: string
  }>
  createdAt: string
  ipAddress: string
}

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderId.trim()) {
      setError("Please enter your order ID")
      return
    }

    try {
      setLoading(true)
      setError("")
      setOrder(null)

      const response = await fetch(`/api/order/${orderId.trim()}`)

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else if (response.status === 404) {
        setError("Order not found. Please check your order ID and try again.")
      } else if (response.status === 403) {
        setError("Access denied. You can only view your own orders.")
      } else {
        setError("Failed to fetch order details. Please try again.")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      setError("An error occurred while fetching order details.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "try-again":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Order Tracking</h1>

      <div className="max-w-md mx-auto mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID (ex: ORD-MD79FVK9-Q0M7Y)"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Submit"}
          </button>
        </form>

        {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
      </div>

      {order && (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Order Information - 75% width */}
            <div className="w-full lg:w-3/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">Order Information</h2>

                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-lg font-semibold">#{order.orderId}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Customer Details</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span> {order.user.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {order.user.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {order.user.phone}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span> {order.user.address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Total Items:</span> {order.items.length}
                      </p>
                      <p>
                        <span className="font-medium">Total Amount:</span> ${order.totalAmount.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> <span className="capitalize">{order.status}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-20 h-20 object-contain rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.title}</h4>
                          <p className="text-gray-600">{item.color}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">Quantity: {item.quantity}</p>
                            <p className="text-sm">Price: ${item.price.toFixed(2)} each</p>
                            <p className="text-sm">Shipping: ${item.shipping.cost.toFixed(2)}</p>
                            <p className="font-medium">
                              Subtotal: ${(item.price * item.quantity + item.shipping.cost).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Amount:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Timeline - 25% width */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Order Status Timeline</h2>

                <div className="space-y-4">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full mt-1 ${getStatusColor(status.status).replace("bg-", "bg-").replace("text-", "bg-").split(" ")[0]}`}
                      ></div>
                      <div className="flex-1">
                        <div className="space-y-1">
                          <p className="font-medium capitalize">{status.status}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(status.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(status.updatedAt).toLocaleTimeString()}
                          </p>
                          {status.note && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{status.note}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium text-gray-700 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600">
                    If you have any questions about your order, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
