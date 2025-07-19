// components/layout/NewsStyles.tsx
import Link from 'next/link'
import Image from 'next/image'
import Slider from 'react-slick'
import { useRef } from 'react'

interface Post {
  _id: string
  title: string
  slug: string
  content: string
  images?: string
  date: string
}

interface NewsStylesProps {
  posts: Post[]
  mobileGrid: number
  desktopGrid: number
}

export function NewsStyle1({ posts, mobileGrid, desktopGrid }: NewsStylesProps) {
  return (
    <div className={`grid grid-cols-${mobileGrid} md:grid-cols-${desktopGrid} gap-4`}>
      {posts.map(post => (
        <div key={post._id} className="rounded border border-gray-200">
          <div className="w-full md:h-46 h-28 rounded-t-lg">
            {post.images && (
              <Image
                src={post.images}
                alt={post.title}
                width={800}
                height={300}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
          <div className="p-2">
            <h3 className="font-semibold text-base mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 line-clamp-2">
                {post.title}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {new Date(post.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 line-clamp-2">
              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function NewsStyle2({ posts, desktopGrid }: NewsStylesProps) {
  return (
    <div className="w-full">
      {posts.length > 0 && (
        <div className="mb-6 border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-center">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                <Link href={`/blog/${posts[0].slug}`} className="hover:text-blue-600">
                  {posts[0].title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {new Date(posts[0].date).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                {posts[0].content.replace(/<[^>]*>/g, '').substring(0, 800)}...
              </p>
            </div>
            {posts[0].images && (
              <Image
                src={posts[0].images}
                alt={posts[0].title}
                width={800}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>
      )}
      
      {posts.length > 1 && (
        <div className={`grid grid-cols-1 md:grid-cols-${desktopGrid} gap-4`}>
          {posts.slice(1).map(post => (
            <div key={post._id} className="border border-gray-200 rounded-lg overflow-hidden">
              {post.images && (
                <Image
                  src={post.images}
                  alt={post.title}
                  width={800}
                  height={300}
                  className="w-full h-auto rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              <div className="p-3">
                <h3 className="font-semibold mb-1">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-xs">
                  {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function NewsStyle3({ posts, desktopGrid }: NewsStylesProps) {
  return (
    <div className="w-full">
      {posts.length > 0 && (
        <div className="mb-6 border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                <Link href={`/blog/${posts[0].slug}`} className="hover:text-blue-600">
                  {posts[0].title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {new Date(posts[0].date).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                {posts[0].content.replace(/<[^>]*>/g, '').substring(0, 200)}...
              </p>
            </div>
            {posts[0].images ? (
              <Image
                src={posts[0].images || "/placeholder.svg"}
                alt={posts[0].title}
                width={800}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
      
      {posts.length > 2 && (
        <div className={`mb-6 grid grid-cols-1 md:grid-cols-${desktopGrid} gap-4`}>
          {posts.slice(1, posts.length - 1).map(post => (
            <div key={post._id} className="border rounded-lg overflow-hidden">
              {post.images ? (
                <Image
                  src={post.images || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={300}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="p-3">
                <h3 className="font-semibold mb-1">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-xs">
                  {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {posts.length > 1 && (
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts[posts.length - 1].images ? (
              <Image
                src={posts[posts.length - 1].images || "/placeholder.svg"}
                alt={posts[posts.length - 1].title}
                width={800}
                height={300}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                <Link href={`/blog/${posts[posts.length - 1].slug}`} className="hover:text-blue-600">
                  {posts[posts.length - 1].title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {new Date(posts[posts.length - 1].date).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                {posts[posts.length - 1].content.replace(/<[^>]*>/g, '').substring(0, 200)}...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function NewsStyle4({ posts, mobileGrid, desktopGrid }: NewsStylesProps) {
  const sliderRef = useRef<Slider>(null)

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: desktopGrid,
    slidesToScroll: desktopGrid,
    arrows: false, // We'll use our custom arrows
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: mobileGrid,
          slidesToScroll: mobileGrid
        }
      }
    ]
  }

  const goToNext = () => {
    sliderRef.current?.slickNext()
  }

  const goToPrev = () => {
    sliderRef.current?.slickPrev()
  }

  return (
    <div className="relative news-carousel">
      {/* Custom Arrow Buttons */}
      <button 
        onClick={goToPrev}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <Slider ref={sliderRef} {...settings}>
        {posts.map(post => (
          <div key={post._id} className="px-2">
            <div className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className="w-full h-48 rounded-t-lg">
                {post.images ? (
                  <Image
                    src={post.images || "/placeholder.svg"}
                    alt={post.title}
                    width={800}
                    height={300}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-base mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 line-clamp-2">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 line-clamp-2">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}