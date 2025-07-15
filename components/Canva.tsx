"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import html2canvas from "html2canvas"
import "suneditor/dist/css/suneditor.min.css"

// Import templates
import Template1 from "./canva/template-1"
import Template2 from "./canva/template-2"
import Template3 from "./canva/template-3"

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false })

interface PostOption {
  _id: string
  title: string
  slug: string
}

interface EditorData {
  title: string
  content: string
  images: string
  watermark: string
  date: string
  userName: string
  userImage: string
}

interface StylesData {
  bgType: "gradient" | "solid" | "image"
  gradient1: string
  gradient2: string
  gradientAngle: number
  solidColor: string
  backgroundImage: string
  titleColor: string
  highlightColor: string
  titleFontSize: number
  descriptionColor: string
  descriptionFontSize: number
  dateColor: string
  userColor: string
}

const presetGradients = [
  { color1: "#555555", color2: "#555555", angle: 66 },
  { color1: "#EEEEEE", color2: "#000000", angle: 5 },
  { color1: "#FF6B6B", color2: "#FFE66D", angle: 90 },
  { color1: "#4ECDC4", color2: "#1A535C", angle: 45 },
]

const presetSolids = [{ color: "#555555" }, { color: "#EEEEEE" }, { color: "#3498DB" }, { color: "#2ECC71" }]

const presetImages = [
  "/placeholder.svg?height=600&width=800",
  "/placeholder.svg?height=700&width=900",
  "/placeholder.svg?height=500&width=700",
]

export default function Canva() {
  const [activeTab, setActiveTab] = useState<"editor" | "styles">("editor")
  const [postsList, setPostsList] = useState<PostOption[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editorData, setEditorData] = useState<EditorData>({
    title: "",
    content: "",
    images: "",
    watermark: "",
    date: new Date().toISOString().split("T")[0],
    userName: "",
    userImage: "",
  })

  const [stylesData, setStylesData] = useState<StylesData>({
    bgType: "solid",
    gradient1: "#555555",
    gradient2: "#555555",
    gradientAngle: 66,
    solidColor: "#FFFFFF",
    backgroundImage: "",
    titleColor: "#000000",
    highlightColor: "#FF0000",
    titleFontSize: 55,
    descriptionColor: "#333333",
    descriptionFontSize: 16,
    dateColor: "#666666",
    userColor: "#666666",
  })

  // Use an array of refs for each template preview div
  const templateRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch posts and set latest as default
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Use the new /api/canva route
        const response = await fetch("/api/canva", { credentials: "include" })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setPostsList(data.posts)
        if (data.latestPost) {
          setSelectedPostId(data.latestPost._id)
          setEditorData(data.latestPost)
        } else if (data.posts.length > 0) {
          // Fallback to first post if no latestPost is explicitly returned
          const firstPostId = data.posts[0]._id
          setSelectedPostId(firstPostId)
          // Fetch full data for the first post using the new /api/canva/[id] route
          const firstPostResponse = await fetch(`/api/canva/${firstPostId}`, { credentials: "include" })
          if (firstPostResponse.ok) {
            const firstPostData = await firstPostResponse.json()
            setEditorData(firstPostData)
          } else {
            throw new Error(`HTTP error! status: ${firstPostResponse.status} for first post fallback`)
          }
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err)
        setError(`Failed to fetch initial post data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Handle post selection change
  useEffect(() => {
    const loadPostData = async () => {
      if (!selectedPostId || postsList.length === 0) return

      // Use the new /api/canva/[id] route
      try {
        const response = await fetch(`/api/canva/${selectedPostId}`, { credentials: "include" })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setEditorData(data)
      } catch (err: any) {
        console.error("Error loading selected post:", err)
        setError(`Failed to load selected post data: ${err.message}`)
      }
    }
    loadPostData()
  }, [selectedPostId, postsList])

  const handleEditorDataChange = useCallback((field: keyof EditorData, value: string) => {
    setEditorData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleStylesDataChange = useCallback((field: keyof StylesData, value: string | number) => {
    setStylesData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const parseTitle = useCallback((title: string, highlightColor: string, defaultColor: string): React.ReactNode => {
    const parts = title.split(/\[h\](.*?)\[\/h\]/g)
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is the highlighted part
        return (
          <span key={index} style={{ color: highlightColor }}>
            {part}
          </span>
        )
      }
      // This is the default part
      return (
        <span key={index} style={{ color: defaultColor }}>
          {part}
        </span>
      )
    })
  }, [])

  const handleDownload = async (templateIndex: number) => {
    const targetElement = templateRefs.current[templateIndex]
    if (!targetElement) {
      console.error("Template element not ready for screenshot.")
      return
    }

    // Temporarily set the dimensions of the target element for screenshot
    const originalWidth = targetElement.style.width
    const originalHeight = targetElement.style.height
    const originalPosition = targetElement.style.position
    const originalZIndex = targetElement.style.zIndex
    const originalTransform = targetElement.style.transform
    const originalScale = targetElement.style.transform.includes("scale")
      ? targetElement.style.transform.match(/scale$$([^)]+)$$/)?.[1]
      : "1"

    // To ensure it renders at 1200x1200 for screenshot, we might need to temporarily
    // adjust its size and position to be visible and correctly rendered by html2canvas.
    // A common strategy is to move it off-screen and scale it.
    targetElement.style.width = "1200px"
    targetElement.style.height = "1200px"
    targetElement.style.position = "absolute"
    targetElement.style.top = "-9999px"
    targetElement.style.left = "-9999px"
    targetElement.style.zIndex = "9999"
    targetElement.style.transform = "scale(1)" // Ensure no scaling from CSS affects html2canvas

    // Wait for content to render with new dimensions
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const canvas = await html2canvas(targetElement, {
        useCORS: true, // Important for images from different origins
        allowTaint: true,
        backgroundColor: null, // Transparent background if needed
        width: 1200, // Target width for the canvas
        height: 1200, // Target height for the canvas
        scale: 1, // Use scale 1 as we've set the target element size
      })

      const link = document.createElement("a")
      link.download = `canva-template-${templateIndex + 1}.png`
      link.href = canvas.toDataURL("image/png")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Error capturing screenshot:", err)
      alert("Failed to capture screenshot. Please check console for details.")
    } finally {
      // Restore original dimensions and styles
      targetElement.style.width = originalWidth
      targetElement.style.height = originalHeight
      targetElement.style.position = originalPosition
      targetElement.style.top = ""
      targetElement.style.left = ""
      targetElement.style.zIndex = originalZIndex
      targetElement.style.transform = originalTransform
    }
  }

  const copyPostInfo = useCallback(() => {
    const postTitle = editorData.title.replace(/\[h\]|\[\/h\]/g, "") // Remove [h] tags for copy
    const postUrl = `${window.location.origin}/blog/${postsList.find((p) => p._id === selectedPostId)?.slug || ""}`
    const textToCopy = `Title: ${postTitle}\nURL: ${postUrl}`
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => alert("Post title and URL copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err))
  }, [editorData.title, selectedPostId, postsList])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  const templates = [Template1, Template2, Template3]

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Canva-like Image Generator</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Editor Panel */}
        <div className="lg:w-1/3 bg-white rounded-lg shadow-md p-6">
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${activeTab === "editor" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
              onClick={() => setActiveTab("editor")}
            >
              Editor
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "styles" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
              onClick={() => setActiveTab("styles")}
            >
              Styles
            </button>
          </div>

          {activeTab === "editor" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="post-select" className="block mb-1 font-semibold">
                  Select Post
                </label>
                <select
                  id="post-select"
                  value={selectedPostId}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {postsList.length === 0 && <option value="">No posts available</option>}
                  {postsList.map((post) => (
                    <option key={post._id} value={post._id}>
                      {post.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="block mb-1 font-semibold">Title</p>
                <textarea
                  rows={2}
                  value={editorData.title}
                  onChange={(e) => handleEditorDataChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">Use [h]text[/h] to highlight parts of the title.</p>
              </div>

              <div>
                <p className="block mb-1 font-semibold">Description</p>
                <SunEditor
                  defaultValue={editorData.content}
                  onChange={(val) => handleEditorDataChange("content", val)}
                  setOptions={{
                    height: "150px",
                    buttonList: [
                      ["bold", "underline", "italic"],
                      ["fontColor", "hiliteColor"],
                      ["align", "list"],
                      ["link", "image"],
                    ],
                  }}
                />
              </div>

              <div>
                <p className="block mb-1 font-semibold">Images URL</p>
                <input
                  type="url"
                  value={editorData.images}
                  onChange={(e) => handleEditorDataChange("images", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
                {editorData.images && (
                  <img
                    src={editorData.images || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 max-w-full h-auto rounded-md"
                  />
                )}
              </div>

              <div>
                <p className="block mb-1 font-semibold">Watermark URL</p>
                <input
                  type="url"
                  value={editorData.watermark}
                  onChange={(e) => handleEditorDataChange("watermark", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/watermark.png"
                />
                {editorData.watermark && (
                  <img
                    src={editorData.watermark || "/placeholder.svg"}
                    alt="Watermark Preview"
                    className="mt-2 max-w-full h-auto rounded-md"
                  />
                )}
              </div>

              <div>
                <p className="block mb-1 font-semibold">Date</p>
                <input
                  type="date"
                  value={editorData.date}
                  onChange={(e) => handleEditorDataChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <p className="block mb-1 font-semibold">User Name</p>
                <input
                  type="text"
                  value={editorData.userName}
                  onChange={(e) => handleEditorDataChange("userName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <p className="block mb-1 font-semibold">User Image URL</p>
                <input
                  type="url"
                  value={editorData.userImage}
                  onChange={(e) => handleEditorDataChange("userImage", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/user.jpg"
                />
                {editorData.userImage && (
                  <img
                    src={editorData.userImage || "/placeholder.svg"}
                    alt="User Preview"
                    className="mt-2 w-12 h-12 rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "styles" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="bg-type" className="block mb-1 font-semibold">
                  Background Type
                </label>
                <select
                  id="bg-type"
                  value={stylesData.bgType}
                  onChange={(e) => handleStylesDataChange("bgType", e.target.value as StylesData["bgType"])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient Color</option>
                  <option value="image">Background Image</option>
                </select>
              </div>

              {stylesData.bgType === "gradient" && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="font-semibold">Custom Gradient</h3>
                  <div className="flex gap-2">
                    <div>
                      <label htmlFor="gradient1" className="block text-sm mb-1">
                        Color 1
                      </label>
                      <input
                        type="color"
                        id="gradient1"
                        value={stylesData.gradient1}
                        onChange={(e) => handleStylesDataChange("gradient1", e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                    <div>
                      <label htmlFor="gradient2" className="block text-sm mb-1">
                        Color 2
                      </label>
                      <input
                        type="color"
                        id="gradient2"
                        value={stylesData.gradient2}
                        onChange={(e) => handleStylesDataChange("gradient2", e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <strong>Angle</strong>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={stylesData.gradientAngle}
                      onChange={(e) => handleStylesDataChange("gradientAngle", Number(e.target.value))}
                      className="border h-8 w-28"
                    />
                    <span>{stylesData.gradientAngle}°</span>
                  </div>
                  <h3 className="font-semibold mt-4">Preset Gradients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presetGradients.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setStylesData((prev) => ({
                            ...prev,
                            gradient1: preset.color1,
                            gradient2: preset.color2,
                            gradientAngle: preset.angle,
                            bgType: "gradient",
                          }))
                        }
                        className="h-12 rounded-md border"
                        style={{
                          background: `linear-gradient(${preset.angle}deg, ${preset.color1}, ${preset.color2})`,
                        }}
                        title={`Angle: ${preset.angle}°`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {stylesData.bgType === "solid" && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="font-semibold">Custom Solid Color</h3>
                  <div>
                    <label htmlFor="solid-color" className="block text-sm mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      id="solid-color"
                      value={stylesData.solidColor}
                      onChange={(e) => handleStylesDataChange("solidColor", e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  <h3 className="font-semibold mt-4">Preset Solid Colors</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {presetSolids.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setStylesData((prev) => ({
                            ...prev,
                            solidColor: preset.color,
                            bgType: "solid",
                          }))
                        }
                        className="h-10 rounded-md border"
                        style={{ backgroundColor: preset.color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {stylesData.bgType === "image" && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="font-semibold">Custom Background Image</h3>
                  <div>
                    <label htmlFor="bg-image-url" className="block text-sm mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="bg-image-url"
                      value={stylesData.backgroundImage}
                      onChange={(e) => handleStylesDataChange("backgroundImage", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://example.com/background.jpg"
                    />
                    {stylesData.backgroundImage && (
                      <img
                        src={stylesData.backgroundImage || "/placeholder.svg"}
                        alt="Background Preview"
                        className="mt-2 max-w-full h-auto rounded-md"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold mt-4">Preset Background Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presetImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setStylesData((prev) => ({
                            ...prev,
                            backgroundImage: imgUrl,
                            bgType: "image",
                          }))
                        }
                        className="h-24 rounded-md border bg-cover bg-center"
                        style={{ backgroundImage: `url(${imgUrl})` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="block mb-1 font-semibold">Title Color</p>
                <input
                  type="color"
                  value={stylesData.titleColor}
                  onChange={(e) => handleStylesDataChange("titleColor", e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <p className="block mb-1 font-semibold">Title Highlight Color</p>
                <input
                  type="color"
                  value={stylesData.highlightColor}
                  onChange={(e) => handleStylesDataChange("highlightColor", e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <p className="block mb-1 font-semibold">Title Font Size (px)</p>
                <input
                  type="number"
                  value={stylesData.titleFontSize}
                  onChange={(e) => handleStylesDataChange("titleFontSize", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <p className="block mb-1 font-semibold">Description Color</p>
                <input
                  type="color"
                  value={stylesData.descriptionColor}
                  onChange={(e) => handleStylesDataChange("descriptionColor", e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <p className="block mb-1 font-semibold">Description Font Size (px)</p>
                <input
                  type="number"
                  value={stylesData.descriptionFontSize}
                  onChange={(e) => handleStylesDataChange("descriptionFontSize", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <p className="block mb-1 font-semibold">Date Color</p>
                <input
                  type="color"
                  value={stylesData.dateColor}
                  onChange={(e) => handleStylesDataChange("dateColor", e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <p className="block mb-1 font-semibold">User Color</p>
                <input
                  type="color"
                  value={stylesData.userColor}
                  onChange={(e) => handleStylesDataChange("userColor", e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview and Download Section */}
        <div className="lg:w-2/3 space-y-8">
          <div>
            <textarea
              rows={2}
              readOnly
              value={`Title: ${editorData.title.replace(/\[h\]|\[\/h\]/g, "")}\nURL: ${window.location.origin}/blog/${postsList.find((p) => p._id === selectedPostId)?.slug || ""}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <button onClick={copyPostInfo} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Copy Title & URL
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((TemplateComponent, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <h3 className="font-semibold mb-2">Template {index + 1}</h3>
                <div className="w-full aspect-video border border-gray-300 rounded-md overflow-hidden mb-4">
                  {/* Direct rendering of TemplateComponent */}
                  <div
                    ref={(el) => {
                      templateRefs.current[index] = el;
                    }}
                    className="w-full h-full" // Base size for preview
                    style={{
                      // Ensure the component fills its container for preview
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <TemplateComponent data={editorData} styles={stylesData} parseTitle={parseTitle} />
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(index)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
