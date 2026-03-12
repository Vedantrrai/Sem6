// POST /api/auth/register
// Register a new user (user / worker / admin)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Worker from '@/models/Worker';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, password, role, phone, address } = body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { success: false, error: 'Name, email, password, and phone are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: role || 'user',
            phone: phone.trim(),
            address: address?.trim(),
            avatar: body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        });

        // If role is worker, create a corresponding Worker profile
        let workerProfile = null;
        if (user.role === 'worker') {
            const { service, hourlyRate, experience, skills, description } = body;

            if (!service || !hourlyRate || !experience) {
                // We'll roll back the user creation if worker details are missing
                await User.findByIdAndDelete(user._id);
                return NextResponse.json(
                    { success: false, error: 'service, hourlyRate, and experience are required for workers' },
                    { status: 400 }
                );
            }

            workerProfile = await Worker.create({
                userId: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                service,
                hourlyRate: Number(hourlyRate),
                experience,
                skills: skills ? (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : skills) : [],
                description,
                rating: 5, // Default for new worker
                reviews: 0,
                completedJobs: 0,
                availability: 'Available',
            });
        }

        // Generate JWT
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

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully',
                token,
                user: userResponse,
                worker: workerProfile,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Register error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
