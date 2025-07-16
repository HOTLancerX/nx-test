"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

interface ContactSubmission {
  _id: string
  formId: string
  formData: Record<string, any>
  ipAddress: string
  userAgent: string
  location: string
  status: string
  createdAt: string
  updatedAt: string
  form: {
    _id: string
    title: string
    description: string
    email: string
    phone: string
    address: string
    fields: Array<{
      type: string
      label: string
      placeholder?: string
      required: boolean
      options?: string
      desktopW: string
      mobileW: string
    }>
  } | null
}

export default function ContactDetail() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<ContactSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchSubmission(params.id as string)
    }
  }, [params.id])

  const fetchSubmission = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSubmission(data)
        setNewStatus(data.status)
      } else {
        console.error("Failed to fetch contact submission")
      }
    } catch (error) {
      console.error("Error fetching contact submission:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!submission || !newStatus) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/contact/${submission._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSubmission({ ...submission, status: newStatus })
        alert("Status updated successfully!")
      } else {
        alert("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "try again":
        return "text-yellow-600"
      case "ignore":
        return "text-gray-600"
      default:
        return "text-blue-600"
    }
  }

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return "Unknown Device"

    if (userAgent.includes("Mobile")) {
      return "Mobile Device"
    } else if (userAgent.includes("Tablet")) {
      return "Tablet"
    } else {
      return "Desktop"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading contact submission details...</div>
  }

  if (!submission) {
    return <div className="text-center py-8">Contact submission not found</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Contact List
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Contact Form Submission Details</h1>
      </div>

      <div>
        <div>
          <p className="text-sm text-gray-600 mb-8">
            This will contain information about all the contact forms that the user is selecting and submitting.
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-4">
            Here you will find information like user's IP address, location, device, which package or free API you can
            use.
          </p>

          <div className="mb-6">
            <p className="font-medium mb-2">Status</p>
            <p className="text-sm text-gray-600 mb-2">
              From here, the admin can update the status to indicate whether they are viewing this information.
            </p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mr-4"
            >
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="try again">try again</option>
              <option value="ignore">ignore</option>
            </select>

            <button
              onClick={updateStatus}
              disabled={updating || newStatus === submission.status}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Updating..." : "Submit"}
            </button>
            <p className="text-sm text-gray-500 mt-1">There will be a submit button here to update the status.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Form Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Form Title</h3>
              <p className="text-base text-gray-900">{submission.form?.title || "Contact Form"}</p>
            </div>

            {submission.form?.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <div
                  className="text-base text-gray-900 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: submission.form.description }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.form?.email && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                  <p className="text-base text-gray-900">{submission.form.email}</p>
                </div>
              )}

              {submission.form?.phone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
                  <p className="text-base text-gray-900">{submission.form.phone}</p>
                </div>
              )}
            </div>

            {submission.form?.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="text-base text-gray-900 whitespace-pre-line">{submission.form.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
              <p className="text-base text-gray-900">{submission.ipAddress}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="text-base text-gray-900">{submission.location}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Device</h3>
              <p className="text-base text-gray-900">{getDeviceInfo(submission.userAgent)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">User Agent</h3>
              <p className="text-sm text-gray-700 break-all">{submission.userAgent}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
              <p className={`text-base font-medium ${getStatusColor(submission.status)}`}>{submission.status}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
              <p className="text-base text-gray-900">{new Date(submission.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-base text-gray-900">{new Date(submission.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Data */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Submitted Form Data</h2>
        <div className="space-y-4">
          {submission.form?.fields?.map((field, index) => {
            const fieldKey = `field_${index}`
            const fieldValue = submission.formData[fieldKey]

            if (!fieldValue && fieldValue !== 0) return null

            return (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                <div className="text-base text-gray-900">
                  {Array.isArray(fieldValue) ? (
                    <ul className="list-disc list-inside">
                      {fieldValue.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-wrap">{fieldValue}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
