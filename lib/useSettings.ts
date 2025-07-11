"use client"
import { useState, useEffect } from "react"

export default function useSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/settings', {
          cache: 'no-store' // Ensure fresh data
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        console.error("Settings fetch error:", err)
        setError(err instanceof Error ? err.message : 'Failed to load settings')
        // Fallback to empty settings
        setSettings({})
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    refresh: async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/settings', {
          cache: 'no-store'
        })
        const data = await response.json()
        setSettings(data)
        setError(null)
      } catch (err) {
        console.error("Refresh error:", err)
        setError(err instanceof Error ? err.message : 'Refresh failed')
      } finally {
        setLoading(false)
      }
    }
  }
}