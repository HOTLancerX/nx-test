"use client"
import type React from "react"
import { useState, useEffect } from "react"

interface AdSettings {
  [key: string]: string // e.g., "ads_1": "<div>Ad Content</div>"
}

export default function AdsPage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [adSettings, setAdSettings] = useState<AdSettings>({})

  const NUM_ADS = 30 // As per requirement

  useEffect(() => {
    fetchAdSettings()
  }, [])

  const fetchAdSettings = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        const currentAds: AdSettings = {}
        for (let i = 1; i <= NUM_ADS; i++) {
          const adKey = `ads_${i}`
          currentAds[adKey] = data[adKey] || "" // Initialize with existing data or empty string
        }
        setAdSettings(currentAds)
      }
    } catch (error) {
      console.error("Error fetching ad settings:", error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setAdSettings((prev) => ({
      ...prev,
      [key]: value,
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
        body: JSON.stringify(adSettings), // Send all ad settings
      })

      if (response.ok) {
        alert("Ad settings saved successfully!")
      } else {
        const error = await response.json()
        alert(error.message || "Error saving ad settings")
      }
    } catch (error) {
      alert("Error saving ad settings")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="text-center py-8">Loading ad settings...</div>
  }

  return (
    <div>
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Ad Management</h3>
          <p className="mt-1 text-sm text-gray-600">
            Configure your website's ad slots. You can insert HTML code directly into each ad box.
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: NUM_ADS }, (_, i) => i + 1).map((num) => {
                  const adKey = `ads_${num}`
                  return (
                    <div key={adKey} className="bg-white rounded-md p-4">
                      <h4 className="text-base font-medium text-gray-900 mb-2">{adKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h4>
                      <div>
                        <label htmlFor={adKey} className="sr-only">
                          Ad Content for {adKey}
                        </label>
                        <textarea
                          id={adKey}
                          rows={3}
                          value={adSettings[adKey] || ""}
                          onChange={(e) => handleChange(adKey, e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                          placeholder="Enter HTML code for your ad"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Ad Settings"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}