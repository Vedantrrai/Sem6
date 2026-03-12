// POST /api/seed
// Seeds the MongoDB database with the initial workers from mockData.
// Run once by calling: POST http://localhost:3000/api/seed
// Protected: pass the JWT of an admin user, OR use SEED_SECRET header.
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Worker from '@/models/Worker';
import User from '@/models/User';
import { workers as mockWorkers, services as mockServices } from '@/lib/mockData';

const SEED_SECRET = process.env.SEED_SECRET || 'kaamon_seed_2024';

export async function POST(req: NextRequest) {
    try {
        // Simple secret check so seed can't be called by anyone
        const secret = req.headers.get('x-seed-secret');
        if (secret !== SEED_SECRET) {
            return NextResponse.json({ success: false, error: 'Invalid seed secret' }, { status: 403 });
        }

        await connectDB();

        // ── Seed default admin account ───────────────────────────
        const adminExists = await User.findOne({ role: 'admin' });
        let adminResult = 'Admin already exists, skipped';
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: 'admin@kaamon.com',
                password: 'admin123',
                role: 'admin',
                phone: '+91 9000000001',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            });
            adminResult = 'Admin created → admin@kaamon.com / admin123';
        }

        // ── Seed demo user account ────────────────────────────────
        const userExists = await User.findOne({ email: 'user@kaamon.com' });
        let userResult = 'Demo user already exists, skipped';
        if (!userExists) {
            await User.create({
                name: 'Demo User',
                email: 'user@kaamon.com',
                password: 'user1234',
                role: 'user',
                phone: '+91 9000000002',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user',
            });
            userResult = 'Demo user created → user@kaamon.com / user1234';
        }

        // ── Seed Workers ─────────────────────────────────────────
        const existingCount = await Worker.countDocuments();
        let workerResult = `Workers already seeded (${existingCount} found), skipped`;

        if (existingCount === 0) {
            const workerDocs = mockWorkers.map(w => ({
                name: w.name,
                service: w.service,
                rating: w.rating,
                reviews: w.reviews,
                hourlyRate: w.hourlyRate,
                experience: w.experience,
                avatar: w.avatar,
                skills: w.skills,
                availability: w.availability as 'Available' | 'Busy',
                completedJobs: w.completedJobs,
                description: w.description,
                isVerified: true,
            }));

            await Worker.insertMany(workerDocs);
            workerResult = `${workerDocs.length} workers seeded successfully`;
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            results: {
                admin: adminResult,
                user: userResult,
                workers: workerResult,
                servicesNote: `${mockServices.length} services available (stored in mockData, not DB)`,
            },
        });
    } catch (error: unknown) {
        console.error('Seed error:', error);
        const message = error instanceof Error ? error.message : 'Seed failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
