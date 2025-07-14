import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

async function verifyUserAndPost(request: Request, id: string) {
    const cookieStore = await cookies(); // ✅ Await this
    const token = cookieStore.get('auth-token')?.value;
    if (!token) throw new Error('Authentication required');

    const decoded = verifyToken(token);
    if (!decoded) throw new Error('Invalid token');

    const { db } = await connectToDatabase();
    const post = await db.collection('nx_posts').findOne({ _id: new ObjectId(id), user_id: new ObjectId(decoded.id) });

    if (!post) throw new Error('Post not found or unauthorized');

    return { db, post, userId: decoded.id };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { post } = await verifyUserAndPost(request, params.id);
        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await verifyUserAndPost(request, params.id);
        const updatedData = await request.json();
        
        await db.collection('nx_posts').updateOne(
            { _id: new ObjectId(params.id) },
            { $set: { ...updatedData, modified: new Date() } }
        );

        return NextResponse.json({ message: "Post updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await verifyUserAndPost(request, params.id);

        await db.collection('nx_posts').deleteOne({ _id: new ObjectId(params.id) });

        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
}