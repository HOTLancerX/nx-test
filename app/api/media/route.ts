import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';
import type { NxMedia, NxMediaCreateInput } from '@/schema/nx_medias';
import { ObjectId } from 'mongodb';

// GET endpoint for fetching media
export async function GET(request: Request) {
  try {
    await requireAdminAuth();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    const [media, total] = await Promise.all([
      db.collection<NxMedia>('nx_medias')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<NxMedia>('nx_medias').countDocuments(query)
    ]);

    return NextResponse.json({
      media: media.map(m => ({
        ...m,
        _id: m._id.toString(),
        userId: m.userId.toString()
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Unauthorized or Internal Server Error' },
      { status: 401 }
    );
  }
}

// POST endpoint for URL-based media creation
export async function POST(request: Request) {
  try {
    const session = await requireAdminAuth();
    const { urls, postId } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { message: 'URLs array is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(session.id);

    // Validate URLs before processing
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    const mediaToInsert: NxMediaCreateInput[] = validUrls.map(url => ({
      url,
      type: url.match(/\.(jpeg|jpg|gif|webp|png)$/i) ? 'image' : 
           url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'document',
      size: 0, // Size not available for URLs
      title: url.split('/').pop() || 'Untitled',
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await db.collection<NxMediaCreateInput>('nx_medias').insertMany(mediaToInsert);

    if (postId) {
      await db.collection('nx_posts').updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { gallery: { $each: validUrls } } }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      urls: validUrls
    });
  } catch (error) {
    console.error('Error adding media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating media metadata
export async function PUT(request: Request) {
  try {
    await requireAdminAuth();
    const { _id, title, alt } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { message: 'Media ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection<NxMedia>('nx_medias').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { 
          title,
          alt,
          updatedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({
      success: result.modifiedCount === 1,
      message: result.modifiedCount === 1 
        ? 'Media updated successfully' 
        : 'No changes made'
    });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing media
export async function DELETE(request: Request) {
  try {
    await requireAdminAuth();
    const { _id } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { message: 'Media ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // First get the media to delete the file from R2
    const media = await db.collection<NxMedia>('nx_medias').findOne({
      _id: new ObjectId(_id)
    });

    if (!media) {
      return NextResponse.json(
        { message: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from R2 (implementation depends on your R2 setup)
    // await deleteFromR2(media.url);

    // Then delete from database
    const result = await db.collection<NxMedia>('nx_medias').deleteOne({
      _id: new ObjectId(_id)
    });

    return NextResponse.json({
      success: result.deletedCount === 1,
      message: result.deletedCount === 1 
        ? 'Media deleted successfully' 
        : 'Media not found'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}