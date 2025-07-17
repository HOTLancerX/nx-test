"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

interface OrderDetails {
  _id: string
  orderId: string
  user: {
    name: string
    email: string
    phone: string
    address: string
    isGuest: boolean
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

export default function AdminOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("processing")
  const [statusNote, setStatusNote] = useState("")

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
        setActiveTab(data.status)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/order/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: activeTab,
          note: statusNote,
        }),
      })

      if (response.ok) {
        await fetchOrderDetails()
        setStatusNote("")
        alert("Order status updated successfully!")
      } else {
        alert("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Error updating order status")
    } finally {
      setUpdating(false)
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
    return <div className="text-center py-8">Loading order details...</div>
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button onClick={() => router.push("/nx-admin/order")} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Orders
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Order Details</h1>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-lg font-semibold">#{order.orderId}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Status Update Section */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Update Status</h2>

            {/* Status Tabs */}
            <div className="space-y-2 mb-4">
              {[
                { key: "processing", label: "Processing" },
                { key: "cancelled", label: "Cancelled" },
                { key: "failed", label: "Failed" },
                { key: "completed", label: "Completed" },
                { key: "try-again", label: "Try Again" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <h3 className="font-medium">{tab.label}</h3>
                </button>
              ))}
            </div>

            {/* Status Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Note (Optional)</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a note about this status update..."
              />
            </div>

            <button
              onClick={updateOrderStatus}
              disabled={updating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>

        {/* Order Information */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>

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
                  <p>
                    <span className="font-medium">Type:</span> {order.user.isGuest ? "Guest" : "Registered"}
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
                        <p className="text-sm">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
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
        </div>

        {/* Order Status Timeline & User Info */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status Timeline</h2>

            <div className="space-y-4 mb-6">
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

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-2">Additional Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">IP Address:</span> {order.ipAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
