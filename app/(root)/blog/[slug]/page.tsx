import { connectToDatabase } from '@/lib/db'
import type { NxPost } from '@/schema/nx_posts'
import type { NxPostMeta, NxPostWithMeta } from '@/schema/nx_posts_meta'
import type { NxTerm } from '@/schema/nx_terms'
import type { NxUser } from '@/schema/nx_users'
import { WithId } from 'mongodb'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Settings } from "@/lib/settings"
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const settings = await Settings()
  const { db } = await connectToDatabase()

  const post = await db.collection<NxPost>('nx_posts').findOne({ 
    slug,
    type: 'post',
    status: 'publish'
  })

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found."
    }
  }

  return {
    title: `${post.title} | ${settings.logo || "NX CMS"}`,
    description: post.content.replace(/<[^>]*>/g, "").substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.replace(/<[^>]*>/g, "").substring(0, 160),
      images: post.images ? [{ url: post.images }] : [],
      type: 'article',
      publishedTime: post.date.toISOString(),
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`,
    },
  }
}

async function getPostData(slug: string) {
  const { db } = await connectToDatabase()

  const post = await db.collection<NxPost>('nx_posts').findOne({ 
    slug,
    type: 'post',
    status: 'publish'
  })

  if (!post) return null

  const metas = await db.collection<NxPostMeta>('nx_posts_meta')
    .find({ nx_posts: post._id })
    .toArray()

  const postWithMeta: NxPostWithMeta = {
    ...post,
  }

  metas.forEach((meta) => {
    postWithMeta[meta.title] = meta.content
  })

  const primaryCategoryId = post.taxonomy?.[0]?.term_id
  let category = primaryCategoryId
    ? await db.collection<NxTerm>('nx_terms').findOne({ _id: primaryCategoryId })
    : null

  let author = post.user_id
    ? await db.collection<NxUser>('nx_users').findOne({ _id: post.user_id })
    : null

  const relatedPosts: WithId<NxPost>[] = primaryCategoryId
    ? await db.collection<NxPost>('nx_posts').find({
        'taxonomy.term_id': primaryCategoryId,
        type: 'post',
        status: 'publish',
        _id: { $ne: post._id }
      }).sort({ date: -1 }).limit(10).toArray()
    : []

  return { post: postWithMeta, category, author, relatedPosts }
}

// ✅ Fixing the dynamic param here too
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPostData(slug)
  if (!data?.post) return <div className="max-w-4xl mx-auto py-8 px-4">Post not found</div>

  const { post, category, author, relatedPosts } = data

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>
          </li>
          {category && (
            <>
              <li>
                <div className="flex items-center">
                  <span className="mx-1">/</span>
                  <Link href={`/category/${category.slug}`} className="text-blue-600 hover:underline ml-1">
                    {category.title}
                  </Link>
                </div>
              </li>
            </>
          )}
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1">/</span>
              <span className="text-gray-500 ml-1">{post.hello}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 hover:bg-blue-200 transition"
          >
            {category.title}
          </Link>
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center space-x-4">
          {author && (
            <div className="flex items-center">
              {author.images && (
                <img
                  src={author.images || "/placeholder.svg"}
                  alt={author.username}
                  className="w-10 h-10 rounded-full mr-2"
                />
              )}
              <div>
                <Link href={`/users/${author.slug || author._id.toString()}`} className="font-medium hover:underline">
                  {author.username}
                </Link>
              </div>
            </div>
          )}

          <time dateTime={post.date.toISOString()} className="text-gray-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </header>

      {/* Featured Image */}
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

      {/* Article Content */}
      <div
        className="content block space-y-2 text-xl my-4 leading-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Gallery */}
      {post.gallery && post.gallery.length > 0 && (
        <div className="mb-12 grid grid-cols-2 md:grid-cols-3 gap-4">
          {post.gallery.map((image, index) => (
            <img
              key={index}
              src={image || "/placeholder.svg"}
              alt={`${post.title} gallery image ${index + 1}`}
              className="rounded-lg shadow"
            />
          ))}
        </div>
      )}

      {post.link && (
        <div className="mt-6 text-sm text-gray-600">
          <strong>RSS Link:</strong>{" "}
          <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {post.link}
          </a>
        </div>
      )}

      {/* Author Bio */}
      {author && (
        <section className="bg-gray-50 p-6 rounded-lg mb-12">
          <div className="flex items-center">
            {author.images && (
              <img
                src={author.images || "/placeholder.svg"}
                alt={author.username}
                className="w-16 h-16 rounded-full mr-4"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold">
                <Link href={`/users/${author.slug || author._id.toString()}`} className="hover:underline">
                  {author.username}
                </Link>
              </h3>
            </div>
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <article key={relatedPost._id?.toString()} className="bg-white rounded-lg shadow-md overflow-hidden">
                {relatedPost.images ? (
                  <Image
                    src={relatedPost.images || "/placeholder.svg"}
                    alt={relatedPost.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    <Link href={`/blog/${relatedPost.slug}`} className="hover:text-blue-600">
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{new Date(relatedPost.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {relatedPost.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.content.substring(0, 160),
            datePublished: post.date.toISOString(),
            dateModified: post.modified?.toISOString() || post.date.toISOString(),
            image: post.images ? [post.images] : [],
            author: {
              "@type": "Person",
              name: author?.username || "Unknown Author",
              url: author ? `${process.env.SITE_URL}/author/${author.slug || author._id.toString()}` : undefined,
            },
            publisher: {
              "@type": "Organization",
              name: process.env.SITE_NAME,
              logo: {
                "@type": "ImageObject",
                url: `${process.env.SITE_URL}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${process.env.SITE_URL}/blog/${post.slug}`,
            },
            ...(category
              ? {
                  articleSection: category.title,
                  keywords: [category.title],
                }
              : {}),
          }),
        }}
      />
    </article>
  )
}
