"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface QnAItem {
  question: string
  answer: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, any>>({
    logo: "",
    siteurl: "",
    QnA: [] as QnAItem[],
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({
          logo: data.logo || "",
          siteurl: data.siteurl || "",
          QnA: data.QnA || [],
          ...data,
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (title: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        const error = await response.json()
        alert(error.message || "Error saving settings")
      }
    } catch (error) {
      alert("Error saving settings")
    } finally {
      setLoading(false)
    }
  }

  const addQnAItem = () => {
    const newQnA = [...settings.QnA, { question: "", answer: "" }]
    handleChange("QnA", newQnA)
  }

  const updateQnAItem = (index: number, field: "question" | "answer", value: string) => {
    const newQnA = [...settings.QnA]
    newQnA[index][field] = value
    handleChange("QnA", newQnA)
  }

  const removeQnAItem = (index: number) => {
    const newQnA = settings.QnA.filter((_: any, i: number) => i !== index)
    handleChange("QnA", newQnA)
  }

  if (fetchLoading) {
    return <div className="text-center py-8">Loading settings...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Site Settings</h3>
            <p className="mt-1 text-sm text-gray-600">
              Configure your website settings including logo, URLs, and content.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {/* Logo Setting */}
                <div>
                  <h1 className="text-base font-medium text-gray-900 mb-2">Logo</h1>
                  <input
                    type="text"
                    title="logo"
                    value={settings.logo || ""}
                    onChange={(e) => handleChange("logo", e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    placeholder="Enter site logo text"
                  />
                </div>

                {/* Site URL Setting */}
                <div>
                  <h1 className="text-base font-medium text-gray-900 mb-2">Site URL</h1>
                  <input
                    type="url"
                    title="siteurl"
                    value={settings.siteurl || ""}
                    onChange={(e) => handleChange("siteurl", e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    placeholder="https://example.com"
                  />
                </div>

                {/* QnA Setting */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-base font-medium text-gray-900">Q&A Section</h1>
                    <button
                      type="button"
                      onClick={addQnAItem}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Q&A
                    </button>
                  </div>

                  {settings.QnA && settings.QnA.length > 0 ? (
                    <div className="space-y-4">
                      {settings.QnA.map((item: QnAItem, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-medium text-gray-700">Q&A #{index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => removeQnAItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => updateQnAItem(index, "question", e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                                placeholder="Enter question"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                              <textarea
                                value={item.answer}
                                onChange={(e) => updateQnAItem(index, "answer", e.target.value)}
                                rows={3}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                                placeholder="Enter answer"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No Q&A items added yet.</p>
                      <button type="button" onClick={addQnAItem} className="mt-2 text-blue-600 hover:text-blue-800">
                        Add your first Q&A
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-base font-medium text-gray-900 mb-4">Additional Settings</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                      <input
                        type="text"
                        value={settings.site_title || ""}
                        onChange={(e) => handleChange("site_title", e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        placeholder="Enter site title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                      <textarea
                        value={settings.site_description || ""}
                        onChange={(e) => handleChange("site_description", e.target.value)}
                        rows={3}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        placeholder="Enter site description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={settings.contact_email || ""}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={settings.phone || ""}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
