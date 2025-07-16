"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

interface ContactSubmission {
  _id: string
  formTitle: string
  formDescription: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  formFields: Array<{
    type: string
    label: string
    placeholder?: string
    required: boolean
    options?: string
    desktopWidth: string
    mobileWidth: string
  }>
  submissionData: Record<string, any>
  ipAddress: string
  userAgent: string
  location: string
  status: "pending" | "completed" | "try again" | "ignore"
  createdAt: string
  updatedAt: string
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<ContactSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  useEffect(() => {
    if (params.id) {
      fetchSubmission()
    }
  }, [params.id])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contact/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setSubmission(data)
        setSelectedStatus(data.status)
      } else {
        console.error("Failed to fetch submission")
        router.push("/nx-admin/contact")
      }
    } catch (error) {
      console.error("Error fetching submission:", error)
      router.push("/nx-admin/contact")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!selectedStatus || selectedStatus === submission?.status) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/contact/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (response.ok) {
        setSubmission((prev) => (prev ? { ...prev, status: selectedStatus as any } : null))
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
        return "bg-green-100 text-green-800"
      case "try again":
        return "bg-yellow-100 text-yellow-800"
      case "ignore":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading submission details...</div>
  }

  if (!submission) {
    return <div className="text-center py-8">Submission not found</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button onClick={() => router.push("/nx-admin/contact")} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Contact Submissions
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Contact Submission Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            This will contain information about all the contact forms that the user is selecting and submitting.
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Form Title</h3>
              <p className="text-base text-gray-900">{submission.formTitle}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Form Description</h3>
              <div
                className="text-base text-gray-900"
                dangerouslySetInnerHTML={{ __html: submission.formDescription }}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
              <div className="text-base text-gray-900">
                <p>Email: {submission.contactEmail}</p>
                <p>Phone: {submission.contactPhone}</p>
                <p>Address: {submission.contactAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Submitted Data</h3>
              <div className="space-y-2">
                {submission.formFields.map((field, index) => {
                  const fieldKey = `field_${index}`
                  const value = submission.submissionData[fieldKey]

                  // Only display fields that had a value submitted
                  if (value !== undefined && value !== null && value !== "") {
                    return (
                      <div key={fieldKey} className="border-b pb-2">
                        <span className="font-medium text-gray-700">{field.label}:</span>
                        <span className="ml-2 text-gray-900">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </span>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
              <p className="text-base text-gray-900">{new Date(submission.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* User Information & Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Here you will find information like user's IP address, location, device, which package or free API you can
            use.
          </h2>

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
              <h3 className="text-sm font-medium text-gray-500">Device Information</h3>
              <p className="text-base text-gray-900 break-all">{submission.userAgent}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                {submission.status}
              </span>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <p className="text-sm text-gray-600 mb-3">
                From here, the admin can update the status to indicate whether they are viewing this information.
              </p>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-3"
              >
                <option value="pending">pending</option>
                <option value="completed">completed</option>
                <option value="try again">try again</option>
                <option value="ignore">ignore</option>
              </select>

              <button
                onClick={updateStatus}
                disabled={updating || selectedStatus === submission.status}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Submit"}
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-base text-gray-900">{new Date(submission.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
