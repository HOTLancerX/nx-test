import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies(); // ✅ Await this
        const token = cookieStore.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = 10;
        const skip = (page - 1) * limit;

        const { db } = await connectToDatabase();
        
        const query = { user_id: new ObjectId(decoded.id) };
        const posts = await db.collection('nx_posts').find(query).sort({ date: -1 }).skip(skip).limit(limit).toArray();
        const totalPosts = await db.collection('nx_posts').countDocuments(query);

        return NextResponse.json({
            posts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page
        });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies(); // ✅ Await this
        const token = cookieStore.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        
        const postData = await request.json();

        const { db } = await connectToDatabase();

        const newPost = {
            ...postData,
            user_id: new ObjectId(decoded.id),
            date: new Date(),
            modified: new Date(),
        };

        const result = await db.collection('nx_posts').insertOne(newPost);

        return NextResponse.json({ message: "Post created successfully", postId: result.insertedId });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}