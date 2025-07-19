// app/api/news-tabs/route.ts
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const posts = await db
      .collection('nx_posts')
      .find({
        'taxonomy.term_id': new ObjectId(categoryId),
        type: 'post',
        status: 'publish'
      })
      .sort({ date: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching news tabs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}