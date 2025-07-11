import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/db'
import type { NxPost } from '@/schema/nx_posts'
import type { NxTerm } from '@/schema/nx_terms'
import type { Metadata } from 'next'
import Pagination from '@/components/Pagination'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settings } from "@/lib/settings"
import Image from 'next/image'
import Layout from '@/components/layout/Layout'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const settings = await Settings()
  const { db } = await connectToDatabase()
  
  // First try to find by slug
  let category = await db.collection<NxTerm>('nx_terms').findOne({ 
    slug: params.slug,
    type: 'post_category'
  })

  // If not found by slug, try as ObjectId
  if (!category) {
    try {
      category = await db.collection<NxTerm>('nx_terms').findOne({ 
        _id: new ObjectId(params.slug),
        type: 'post_category'
      })
    } catch (e) {
      // Invalid ObjectId format
      return {}
    }
  }

  if (!category) return {}

  return {
    title: `${category.title} | ${settings.logo || "NX CMS"}`,
    description: category.content?.substring(0, 160) || '',
    alternates: {
      canonical: `${process.env.SITE_URL}/category/${category.slug || category._id.toString()}`,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const perPage = 10
  const skip = (currentPage - 1) * perPage

  const { db } = await connectToDatabase()
  
  // First try to find by slug
  let category = await db.collection<NxTerm>('nx_terms').findOne({ 
    slug: params.slug,
    type: 'post_category'
  })

  // If not found by slug, try as ObjectId
  if (!category) {
    try {
      category = await db.collection<NxTerm>('nx_terms').findOne({ 
        _id: new ObjectId(params.slug),
        type: 'post_category'
      })
    } catch (e) {
      // Invalid ObjectId format
      return notFound()
    }
  }

  if (!category) return notFound()

  const [posts, totalPosts] = await Promise.all([
    db.collection<NxPost>('nx_posts').find({
      'taxonomy.term_id': category._id,
      type: 'post',
      status: 'publish'
    })
    .sort({ date: -1 })
    .skip(skip)
    .limit(perPage)
    .toArray(),
    db.collection<NxPost>('nx_posts').countDocuments({
      'taxonomy.term_id': category._id,
      type: 'post',
      status: 'publish'
    })
  ])

  const totalPages = Math.ceil(totalPosts / perPage)

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {category.layout && (
        <Layout id={category.layout} />
      )}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{category.title}</h1>
        {category.content && (
          <div 
            className="prose max-w-none mb-6" 
            dangerouslySetInnerHTML={{ __html: category.content }} 
          />
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map((post) => (
          <article key={post._id.toString()} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {post.images ? (
              <Image
                src={post.images || "/placeholder.svg"}
                alt={post.title}
                width={800}
                height={300}
                className="w-full h-auto rounded-lg"
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
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <time 
                dateTime={post.date.toISOString()} 
                className="text-gray-500 text-sm"
              >
                {new Date(post.date).toLocaleDateString()}
              </time>
              {post.content && (
                <p className="mt-2 text-gray-600 line-clamp-2">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/category/${category.slug || category._id.toString()}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": category.title,
            "description": category.content?.substring(0, 160) || '',
            "url": `${process.env.SITE_URL}/category/${category.slug || category._id.toString()}`,
            "hasPart": posts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "url": `${process.env.SITE_URL}/blog/${post.slug}`,
              "datePublished": post.date.toISOString()
            }))
          }),
        }}
      />
    </div>
  )
}