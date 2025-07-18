"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

interface MenuItem {
  _id: string
  title: string
  url?: string
  type: 'custom' | 'post' | 'page' | 'category'
  referenceId?: string | { $oid: string }
  position: number
  children?: MenuItem[]
}

interface SlugResponse {
  slug: string
}

interface MenuProps {
  location: string
  style?: 'horizontal' | 'vertical'
  className?: string
}

export default function Menu({ location, style = 'horizontal', className = '' }: MenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [slugs, setSlugs] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`/api/menu/list?location=${location}`)
        if (response.ok) {
          const data = await response.json()
          setMenuItems(data.items || [])
          
          // Extract all reference IDs to fetch slugs
          const referenceIds: {id: string, type: 'post' | 'page' | 'category'}[] = []
          
          const extractIds = (items: MenuItem[]) => {
            items.forEach(item => {
              if (item.type !== 'custom' && item.referenceId) {
                const id = typeof item.referenceId === 'object' 
                  ? item.referenceId.$oid 
                  : item.referenceId
                referenceIds.push({id, type: item.type})
              }
              if (item.children) {
                extractIds(item.children)
              }
            })
          }
          
          extractIds(data.items || [])
          
          // Fetch slugs for all reference IDs
          if (referenceIds.length > 0) {
            const slugsResponse = await fetch('/api/menu/slugs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ references: referenceIds })
            })
            
            if (slugsResponse.ok) {
              const slugsData = await slugsResponse.json()
              setSlugs(slugsData.slugs || {})
            }
          }
        }
      } catch (error) {
        console.error("Error fetching menu:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [location])

  const getItemUrl = (item: MenuItem): string => {
    if (item.type === 'custom') return `/${item.url}` || '#'
    
    const referenceId = typeof item.referenceId === 'object' 
      ? item.referenceId.$oid 
      : item.referenceId

    if (!referenceId) return '#'

    // Get the slug from our fetched data
    const slug = slugs[`${item.type}-${referenceId}`] || referenceId

    switch (item.type) {
      case 'page':
        return `/${slug}`
      case 'post':
        return `/blog/${slug}`
      case 'category':
        return `/category/${slug}`
      default:
        return '#'
    }
  }

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <li key={item._id} className="relative group">
        <Link
          href={getItemUrl(item)}
          className={`block px-4 py-2 hover:text-blue-600 transition-colors ${
            style === 'horizontal' ? '' : 'pl-8'
          }`}
        >
          {item.title}
        </Link>
        {item.children && item.children.length > 0 && (
          <ul
            className={`${
              style === 'horizontal'
                ? 'absolute left-0 top-full hidden group-hover:block bg-white shadow-md min-w-[200px] z-10'
                : 'pl-4 hidden group-hover:block'
            }`}
          >
            {renderMenuItems(item.children)}
          </ul>
        )}
      </li>
    ))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <nav className={className}>
      <ul
        className={`flex ${
          style === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'
        }`}
      >
        {renderMenuItems(menuItems)}
      </ul>
    </nav>
  )
}