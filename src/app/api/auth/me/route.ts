// GET /api/auth/me
// Returns the currently authenticated user's profile
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/jwt';

export async function GET(req: NextRequest) {
    try {
        const payload = authenticateRequest(req);
        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
            },
        });
    } catch (error: unknown) {
        console.error('Auth/me error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
