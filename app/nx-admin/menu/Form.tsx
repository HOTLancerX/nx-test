"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, GripVertical, X, Search } from "lucide-react"

interface MenuItem {
  _id?: string
  title: string
  url?: string
  icon?: string
  type: "post" | "page" | "category" | "custom"
  target?: "_blank" | "_self"
  referenceId?: string
  children?: MenuItem[]
  position: number
}

interface MenuFormProps {
  initialData?: {
    _id?: string
    title?: string
    location?: string
    items?: MenuItem[]
  }
  onSuccess?: () => void
}

export default function MenuForm({ initialData, onSuccess }: MenuFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || "")
  const [location, setLocation] = useState(initialData?.location || "main")
  const [items, setItems] = useState<MenuItem[]>(initialData?.items || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [draggedItem, setDraggedItem] = useState<{
    id: string
    parentId: string | null
    index: number
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<{
    id: string
    position: "before" | "after" | "inside"
  } | null>(null)

  // Left sidebar state
  const [activeTab, setActiveTab] = useState<"pages" | "posts" | "categories" | "custom">("pages")
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [customLinkTitle, setCustomLinkTitle] = useState("")
  const [customLinkUrl, setCustomLinkUrl] = useState("")

  // Expanded sections in left sidebar
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["pages", "posts", "categories", "custom"]),
  )

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      // Fetch posts
      const postsResponse = await fetch("/api/post?type=post")
      const postsData = await postsResponse.json()
      setPosts(postsData.posts || [])

      // Fetch pages
      const pagesResponse = await fetch("/api/post?type=page")
      const pagesData = await pagesResponse.json()
      setPages(pagesData.posts || [])

      // Fetch categories
      const categoriesResponse = await fetch("/api/category?type=post_category")
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData.categories || [])
    } catch (error) {
      console.error("Error fetching content:", error)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const findMenuItem = useCallback((items: MenuItem[], id: string): [MenuItem | null, MenuItem[] | null, number] => {
    for (let i = 0; i < items.length; i++) {
      if (items[i]._id === id) {
        return [items[i], items, i]
      }
      if (items[i].children) {
        const [found, parent, index] = findMenuItem(items[i].children!, id)
        if (found) {
          return [found, parent, index]
        }
      }
    }
    return [null, null, -1]
  }, [])

  const removeMenuItem = useCallback((items: MenuItem[], id: string): MenuItem[] => {
    return items.filter((item) => {
      if (item._id === id) {
        return false
      }
      if (item.children) {
        item.children = removeMenuItem(item.children, id)
      }
      return true
    })
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, id: string, parentId: string | null, index: number) => {
    setDraggedItem({ id, parentId, index })
    e.dataTransfer.setData("text/plain", "")
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault()
      if (!draggedItem || draggedItem.id === id) return

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const y = e.clientY - rect.top
      const height = rect.height

      if (y < height * 0.25) {
        setDropTarget({ id, position: "before" })
      } else if (y > height * 0.75) {
        setDropTarget({ id, position: "after" })
      } else {
        setDropTarget({ id, position: "inside" })
      }
    },
    [draggedItem],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!draggedItem || !dropTarget) {
        setDraggedItem(null)
        setDropTarget(null)
        return
      }

      const [draggedNode] = findMenuItem(items, draggedItem.id)
      if (!draggedNode) return

      let newItems = [...items]
      newItems = removeMenuItem(newItems, draggedItem.id)

      const insertItem = (
        items: MenuItem[],
        targetId: string,
        position: "before" | "after" | "inside",
        currentLevel = 0,
      ): MenuItem[] => {
        return items.flatMap((item) => {
          if (item._id === targetId) {
            if (position === "before") {
              return [draggedNode, item]
            } else if (position === "after") {
              return [item, draggedNode]
            } else if (position === "inside" && currentLevel < 10) {
              return {
                ...item,
                children: [...(item.children || []), draggedNode],
              }
            }
          }
          if (item.children) {
            const newChildren = insertItem(item.children, targetId, position, currentLevel + 1)
            if (newChildren !== item.children) {
              return { ...item, children: newChildren }
            }
          }
          return item
        })
      }

      newItems = insertItem(newItems, dropTarget.id, dropTarget.position, 1)
      setItems(newItems)
      setDraggedItem(null)
      setDropTarget(null)
    },
    [draggedItem, dropTarget, findMenuItem, items, removeMenuItem],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDropTarget(null)
  }, [])

  const addCustomMenuItem = useCallback(() => {
    if (!customLinkTitle.trim() || !customLinkUrl.trim()) return

    const newItem: MenuItem = {
      _id: `custom-${Date.now()}`,
      title: customLinkTitle,
      url: customLinkUrl,
      type: "custom",
      position: items.length + 1,
    }
    setItems([...items, newItem])
    setCustomLinkTitle("")
    setCustomLinkUrl("")
  }, [items, customLinkTitle, customLinkUrl])

  const addSelectedItems = useCallback(() => {
    const newItems = selectedItems.map((content) => ({
      _id: `${content.type || activeTab}-${content._id}`,
      title: content.title || content.name,
      type: content.type || activeTab,
      referenceId: content._id,
      position: items.length + 1,
    }))
    setItems([...items, ...newItems])
    setSelectedItems([])
  }, [activeTab, items, selectedItems])

  const updateMenuItem = useCallback(
    (id: string, updates: Partial<MenuItem>) => {
      const updateItems = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item._id === id) {
            return { ...item, ...updates }
          }
          if (item.children) {
            return {
              ...item,
              children: updateItems(item.children),
            }
          }
          return item
        })
      }
      setItems(updateItems(items))
    },
    [items],
  )

  const removeMenuItemById = useCallback(
    (id: string) => {
      setItems(removeMenuItem(items, id))
    },
    [items, removeMenuItem],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = initialData?._id ? `/api/menu/${initialData._id}` : "/api/menu"
      const method = initialData?._id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          location,
          items,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save menu")
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/nx-admin/menu")
      }
    } catch (error) {
      console.error("Error saving menu:", error)
      setError(error instanceof Error ? error.message : "Failed to save menu")
    } finally {
      setLoading(false)
    }
  }

  const renderMenuItem = useCallback(
    (item: MenuItem, parentId: string | null = null, index = 0, level = 0) => {
      const isExpanded = expandedItems.has(item._id!)
      const isDropTarget = dropTarget?.id === item._id
      const marginLeft = level * 20

      return (
        <div key={item._id} className="w-full">
          <div
            draggable="true"
            onDragStart={(e) => handleDragStart(e, item._id!, parentId, index)}
            onDragOver={(e) => handleDragOver(e, item._id!)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`
              relative flex items-center gap-2 p-3 border-l-4 bg-white cursor-move transition-all
              ${isDropTarget && dropTarget?.position === "inside" ? "border-l-blue-500 bg-blue-50" : "border-l-gray-300"}
              ${draggedItem?.id === item._id ? "opacity-50" : ""}
              hover:bg-gray-50
            `}
            style={{ marginLeft: `${marginLeft}px` }}
          >
            {isDropTarget && dropTarget?.position === "before" && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500" />
            )}
            {isDropTarget && dropTarget?.position === "after" && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500" />
            )}

            <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />

            {item.children && item.children.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(item._id!)}
                className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}

            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateMenuItem(item._id!, { title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="Navigation Label"
                />

                {item.type === "custom" && (
                  <input
                    type="text"
                    value={item.url || ""}
                    onChange={(e) => updateMenuItem(item._id!, { url: e.target.value })}
                    placeholder="URL"
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  />
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                  <select
                    value={item.target || "_self"}
                    onChange={(e) =>
                      updateMenuItem(item._id!, {
                        target: e.target.value as "_blank" | "_self",
                      })
                    }
                    className="text-xs border border-gray-300 rounded px-1 py-0.5"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeMenuItemById(item._id!)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {item.children && item.children.length > 0 && isExpanded && (
            <div className="border-l border-gray-200 ml-4">
              {item.children.map((child, idx) => renderMenuItem(child, item._id!, idx, level + 1))}
            </div>
          )}
        </div>
      )
    },
    [
      dropTarget,
      draggedItem,
      expandedItems,
      handleDragEnd,
      handleDragOver,
      handleDragStart,
      handleDrop,
      removeMenuItemById,
      toggleExpand,
      updateMenuItem,
    ],
  )

  const filteredContent = (content: any[]) => {
    if (!searchTerm) return content
    return content.filter((item) => (item.title || item.name).toLowerCase().includes(searchTerm.toLowerCase()))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {initialData?._id ? "Edit Menu" : "Create New Menu"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add menu items from the left column and arrange them by dragging and dropping.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/nx-admin/menu")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? "Saving..." : "Save Menu"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Enter menu name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="main">Main Menu</option>
                  <option value="footer-1">Footer Column 1</option>
                  <option value="footer-2">Footer Column 2</option>
                  <option value="top-bar">Top Bar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Content Sections */}
          <div className="divide-y divide-gray-200">
            {/* Pages Section */}
            <div className="p-4">
              <button
                onClick={() => toggleSection("pages")}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-blue-600"
              >
                <span>Pages</span>
                {expandedSections.has("pages") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedSections.has("pages") && (
                <div className="mt-3 space-y-2">
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredContent(pages).map((page) => (
                      <label
                        key={page._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.some((item) => item._id === page._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, { ...page, type: "page" }])
                            } else {
                              setSelectedItems(selectedItems.filter((item) => item._id !== page._id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 truncate">{page.title}</span>
                      </label>
                    ))}
                  </div>
                  {selectedItems.filter((item) => item.type === "page").length > 0 && (
                    <button
                      onClick={addSelectedItems}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add to Menu
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Posts Section */}
            <div className="p-4">
              <button
                onClick={() => toggleSection("posts")}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-blue-600"
              >
                <span>Posts</span>
                {expandedSections.has("posts") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedSections.has("posts") && (
                <div className="mt-3 space-y-2">
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredContent(posts).map((post) => (
                      <label
                        key={post._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.some((item) => item._id === post._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, { ...post, type: "post" }])
                            } else {
                              setSelectedItems(selectedItems.filter((item) => item._id !== post._id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 truncate">{post.title}</span>
                      </label>
                    ))}
                  </div>
                  {selectedItems.filter((item) => item.type === "post").length > 0 && (
                    <button
                      onClick={addSelectedItems}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add to Menu
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Categories Section */}
            <div className="p-4">
              <button
                onClick={() => toggleSection("categories")}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-blue-600"
              >
                <span>Categories</span>
                {expandedSections.has("categories") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedSections.has("categories") && (
                <div className="mt-3 space-y-2">
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredContent(categories).map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.some((item) => item._id === category._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, { ...category, type: "category" }])
                            } else {
                              setSelectedItems(selectedItems.filter((item) => item._id !== category._id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 truncate">{category.title || category.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedItems.filter((item) => item.type === "category").length > 0 && (
                    <button
                      onClick={addSelectedItems}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add to Menu
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Custom Links Section */}
            <div className="p-4">
              <button
                onClick={() => toggleSection("custom")}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-blue-600"
              >
                <span>Custom Links</span>
                {expandedSections.has("custom") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedSections.has("custom") && (
                <div className="mt-3 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={customLinkTitle}
                      onChange={(e) => setCustomLinkTitle(e.target.value)}
                      placeholder="Link Text"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={customLinkUrl}
                      onChange={(e) => setCustomLinkUrl(e.target.value)}
                      placeholder="URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={addCustomMenuItem}
                    disabled={!customLinkTitle.trim() || !customLinkUrl.trim()}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Menu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-gray-200 min-h-96">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Menu Structure</h2>
              <p className="text-sm text-gray-600 mt-1">
                Drag items to reorder them. You can also drag items into other items to create sub-menus.
              </p>
            </div>

            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
                  <p className="text-gray-600">Add items from the left sidebar to start building your menu.</p>
                </div>
              ) : (
                <div className="space-y-2">{items.map((item, index) => renderMenuItem(item, null, index))}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
