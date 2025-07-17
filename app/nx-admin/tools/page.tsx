"use client"
import { useState } from "react"
import type React from "react"

export default function AdminToolsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMessage, setImportMessage] = useState("")
  const [exportMessage, setExportMessage] = useState("")

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportMessage("")

      const response = await fetch("/api/tools/export", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()

        // Create and download JSON file
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `database-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
        setExportMessage("Database exported successfully!")
      } else {
        setExportMessage("Failed to export database. Please try again.")
      }
    } catch (error) {
      console.error("Export error:", error)
      setExportMessage("An error occurred during export.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/json") {
      setSelectedFile(file)
      setImportMessage("")
    } else {
      setSelectedFile(null)
      setImportMessage("Please select a valid JSON file.")
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setImportMessage("Please select a JSON file to import.")
      return
    }

    try {
      setIsImporting(true)
      setImportMessage("")

      // Read file content
      const fileContent = await selectedFile.text()
      const jsonData = JSON.parse(fileContent)

      const response = await fetch("/api/tools/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      })

      const result = await response.json()

      if (response.ok) {
        setImportMessage(`Import completed successfully! ${result.message || ""}`)
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById("jsonFile") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setImportMessage(result.message || "Failed to import data. Please try again.")
      }
    } catch (error) {
      console.error("Import error:", error)
      setImportMessage("Invalid JSON file or import failed. Please check the file format.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Tools</h1>
          <p className="mt-2 text-sm text-gray-700">Export and import database information.</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Export Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Export Database</h2>
          <p className="text-sm text-gray-600 mb-4">
            Download all database information as a JSON file. This includes all orders, products, and other data.
          </p>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>

          {exportMessage && (
            <div
              className={`mt-4 p-4 rounded-md ${exportMessage.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {exportMessage}
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Import Database</h2>
          <p className="text-sm text-gray-600 mb-4">
            Import data from a JSON file back to the database. Only new data will be added - existing data will not be
            modified.
          </p>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label htmlFor="jsonFile" className="block text-sm font-medium text-gray-700 mb-2">
                Select JSON File
              </label>
              <input
                type="file"
                id="jsonFile"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isImporting}
              />
            </div>

            <button
              type="submit"
              disabled={isImporting || !selectedFile}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? "Importing..." : "Submit"}
            </button>
          </form>

          {importMessage && (
            <div
              className={`mt-4 p-4 rounded-md ${importMessage.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {importMessage}
            </div>
          )}
        </div>

        {/* Warning Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Notes</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Export will download all database collections and documents</li>
            <li>• Import will only add new data - existing records will not be updated</li>
            <li>• Make sure to backup your database before importing large datasets</li>
            <li>• Only import JSON files that were exported from this system</li>
            <li>• The import process may take some time for large files</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
