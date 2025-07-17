"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

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

export default function OrderDetailsPage() {
  const params = useParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails()
    }
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/order/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Order not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Details</h1>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">#{order.orderId}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Customer Details</h3>
                <div className="mt-2 space-y-1">
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
                <h3 className="font-medium text-gray-700">Order Items</h3>
                <div className="mt-2 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.color}</p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                        <p className="text-sm">Price: ${item.price.toFixed(2)} each</p>
                        <p className="text-sm">Shipping: ${item.shipping.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status Timeline</h2>

            <div className="space-y-4">
              {order.statusHistory.map((status, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(status.status).replace("bg-", "bg-").replace("text-", "bg-").split(" ")[0]}`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{status.status}</span>
                      <span className="text-sm text-gray-500">{new Date(status.updatedAt).toLocaleString()}</span>
                    </div>
                    {status.note && <p className="text-sm text-gray-600 mt-1">{status.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-2">Additional Information</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">IP Address:</span> {order.ipAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
