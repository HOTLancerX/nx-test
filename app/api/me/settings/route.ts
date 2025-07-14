import { NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

async function upsertUserMeta(db: any, userId: ObjectId, title: string, content: string) {
    await db.collection('nx_users_meta').updateOne(
        { nx_users: userId, title },
        { $set: { content, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
    );
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies(); // ✅ Await this
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

        const { db } = await connectToDatabase();
        const user = await db.collection('nx_users').findOne({ _id: new ObjectId(decoded.id) });

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        
        const userMeta = await db.collection('nx_users_meta').find({ nx_users: user._id }).toArray();
        const metaData = userMeta.reduce<Record<string, string>>((acc, meta) => {
            acc[meta.title] = meta.content;
            return acc;
            }, {});

        

        const { password, ...userData } = user;

        return NextResponse.json({ ...userData, ...metaData });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

        const { db } = await connectToDatabase();
        const userId = new ObjectId(decoded.id);

        const data = await request.json();
        const { facebook_link, bio, about, ...userData } = data;

        if (userData.password) {
            userData.password = await hashPassword(userData.password);
        } else {
            delete userData.password;
        }

        // 🛑 Remove _id if present
        delete userData._id;

        // Slug uniqueness check
        if (userData.slug) {
            const existingUser = await db.collection('nx_users').findOne({ slug: userData.slug, _id: { $ne: userId } });
            if (existingUser) {
                return NextResponse.json({ message: "Slug already in use." }, { status: 409 });
            }
        }

        await db.collection('nx_users').updateOne(
            { _id: userId },
            { $set: { ...userData, updatedAt: new Date() } }
        );

        if (facebook_link !== undefined) await upsertUserMeta(db, userId, 'facebook_link', facebook_link);
        if (bio !== undefined) await upsertUserMeta(db, userId, 'bio', bio);
        if (about !== undefined) await upsertUserMeta(db, userId, 'about', about);

        return NextResponse.json({ message: 'Settings updated successfully' });

    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
