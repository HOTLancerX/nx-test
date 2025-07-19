import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';
import type { NxMediaCreateInput } from '@/schema/nx_medias';
import { ObjectId } from 'mongodb';
import { uploadToR2 } from '@/lib/r2';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const session = await requireAdminAuth();
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const postId = formData.get('postId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files provided' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(session.id);
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Validate file
        const MAX_SIZE = 20 * 1024 * 1024; // 20MB
        if (file.size > MAX_SIZE) {
          throw new Error(`File too large (max ${MAX_SIZE/1024/1024}MB)`);
        }

        const validTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'video/mp4', 'video/webm', 'video/quicktime'
        ];
        if (!validTypes.includes(file.type)) {
          throw new Error('Unsupported file type');
        }

        // Upload to R2
        const url = await uploadToR2(file);
        uploadedUrls.push(url);

        // Create media record
        const mediaData: NxMediaCreateInput = {
          url,
          title: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection<NxMediaCreateInput>('nx_medias').insertOne(mediaData);
      } catch (error) {
        errors.push(`${file.name}: ${(error as Error).message}`);
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    // Associate with post if needed
    if (postId && uploadedUrls.length > 0) {
      await db.collection('nx_posts').updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { gallery: { $each: uploadedUrls } } }
      );
    }

    return new NextResponse(JSON.stringify({
      success: true,
      urls: uploadedUrls,
      errors,
      message: `Uploaded ${uploadedUrls.length} of ${files.length} files`
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}