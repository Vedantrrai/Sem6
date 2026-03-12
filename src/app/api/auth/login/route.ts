// POST /api/auth/login
// Login with email + password, returns JWT
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get user including password field (normally excluded)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'No account found with this email' },
                { status: 401 }
            );
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: 'Incorrect password' },
                { status: 401 }
            );
        }

        // Generate token
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });

        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar,
        };

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse,
        });
    } catch (error: unknown) {
        console.error('Login error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
