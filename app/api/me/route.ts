import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET() {
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

        const { db } = await connectToDatabase();
        const user = await db.collection('nx_users').findOne({ _id: new ObjectId(decoded.id) });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { password, ...userData } = user;

        return NextResponse.json(userData);

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
