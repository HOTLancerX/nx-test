import { connectToDatabase } from '@/lib/db'
import type { NxPost } from '@/schema/nx_posts'
import type { Metadata } from 'next'
import { Settings } from "@/lib/settings"
import { notFound } from 'next/navigation'
import Image from 'next/image'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const settings = await Settings()
  const { db } = await connectToDatabase()
  const page = await db.collection<NxPost>('nx_posts').findOne({ 
    slug: params.slug,
    type: 'page',
    status: 'publish'
  })

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: `${page.title} | ${settings.logo || "NX CMS"}`,
    description: page.content.substring(0, 160),
    openGraph: {
      title: page.title,
      description: page.content.substring(0, 160),
      images: page.images ? [{ url: page.images }] : [],
      type: 'article',
      publishedTime: page.date?.toISOString?.(),
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${params.slug}`,
    },
  }
}

export default async function Page({ params }: Props) {
  const { db } = await connectToDatabase()
  const page = await db.collection<NxPost>('nx_posts').findOne({ 
    slug: params.slug,
    type: 'page',
    status: 'publish'
  })

  if (!page) return notFound()

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.date && (
          <time dateTime={page.date.toISOString()} className="text-gray-500">
            {new Date(page.date).toLocaleDateString()}
          </time>
        )}
      </header>

      <div 
        className="prose max-w-none" 
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />

      {page.gallery && page.gallery.length > 0 && (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
          {page.gallery.map((image, index) => (
            <Image
              key={index}
              src={image}
              width={800}
              height={600}
              alt={`${page.title} gallery image ${index + 1}`}
              className="rounded-lg shadow"
            />
          ))}
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": page.title,
            "description": page.content.substring(0, 160),
            "datePublished": page.date?.toISOString(),
            "image": page.images ? [page.images] : [],
          }),
        }}
      />
    </article>
  )
}
