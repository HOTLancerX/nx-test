// components/layout/NewsTabs.tsx
"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NewsStyle1, NewsStyle2, NewsStyle3, NewsStyle4 } from './NewsStyles'

interface NewsTabsProps {
  settings: {
    title?: string
    categories: Array<{
      _id: string
      title: string
      slug: string
    }>
    postLimit: number
    desktopGrid: number
    mobileGrid: number
    style?: number // 1, 2, or 3
  }
}

interface Post {
  _id: string
  title: string
  slug: string
  content: string
  images?: string
  date: string
}

export default function NewsTabs({ settings }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [posts, setPosts] = useState<Record<number, Post[]>>({})
  const [loading, setLoading] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (settings.categories.length > 0) {
      fetchPostsForTab(activeTab)
    }
  }, [activeTab, settings.categories])

  const fetchPostsForTab = async (tabIndex: number) => {
    if (posts[tabIndex] || loading[tabIndex]) return

    setLoading(prev => ({ ...prev, [tabIndex]: true }))
    
    try {
      const categoryId = settings.categories[tabIndex]._id
      const response = await fetch(
        `/api/news-tabs?categoryId=${categoryId}&limit=${settings.postLimit || 5}`
      )
      
      if (!response.ok) throw new Error('Failed to fetch posts')
      
      const categoryPosts = await response.json()
      
      setPosts(prev => ({
        ...prev,
        [tabIndex]: categoryPosts
      }))
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(prev => ({ ...prev, [tabIndex]: false }))
    }
  }

  const renderPosts = () => {
    const currentPosts = posts[activeTab] || []
    if (!currentPosts.length) return null

    switch (settings.style) {
      case 4:
        return <NewsStyle4 posts={currentPosts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
      case 2:
        return <NewsStyle2 posts={currentPosts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
      case 3:
        return <NewsStyle3 posts={currentPosts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
      case 1:
      default:
        return <NewsStyle1 posts={currentPosts} desktopGrid={settings.desktopGrid} mobileGrid={settings.mobileGrid} />
    }
  }

  return (
    <div className="container mx-auto px-2">
      <div className='flex items-center justify-between mb-4'>
        {settings.title && (
          <h2 className="text-xl font-bold">{settings.title}</h2>
        )}
        
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border border-gray-200 divide-x divide-gray-200">
          {settings.categories.map((category, index) => (
            <button
              key={category._id}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === index
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      
      {/* Tab Content */}
      <div className="tab-content">
        {loading[activeTab] ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          renderPosts()
        )}
      </div>
      
      {/* View All Link */}
      {posts[activeTab]?.length > 0 && (
        <div className="mt-4 text-right">
          <Link 
            href={`/category/${settings.categories[activeTab].slug}`}
            className="text-blue-600 hover:underline"
          >
            All {settings.categories[activeTab].title} Posts →
          </Link>
        </div>
      )}
    </div>
  )
}