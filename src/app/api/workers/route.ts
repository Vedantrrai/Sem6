// GET  /api/workers          → list all workers (with optional filters)
// POST /api/workers          → create a new worker (admin only)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Worker from '@/models/Worker';
import { authenticateRequest } from '@/lib/jwt';

// GET /api/workers
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const service = searchParams.get('service');
        const availability = searchParams.get('availability');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const sort = searchParams.get('sort') || 'rating'; // rating | price | experience

        // Build filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = {};
        if (service && service !== 'All') filter.service = service;
        if (availability) filter.availability = availability;
        const userId = searchParams.get('userId');
        if (userId) filter.userId = userId;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { service: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Build sort
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortObj: Record<string, any> = {};
        if (sort === 'price') sortObj.hourlyRate = 1;
        else if (sort === 'reviews') sortObj.reviews = -1;
        else sortObj.rating = -1;

        const workers = await Worker.find(filter).sort(sortObj).limit(limit).lean();

        return NextResponse.json({
            success: true,
            count: workers.length,
            workers: workers.map(w => ({ ...w, id: (w._id as { toString(): string }).toString() })),
        });
    } catch (error: unknown) {
        console.error('GET /api/workers error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch workers' }, { status: 500 });
    }
}

// POST /api/workers  (admin only)
export async function POST(req: NextRequest) {
    try {
        const payload = authenticateRequest(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        const {
            name, service, hourlyRate, experience,
            skills, description, phone, email, avatar,
        } = body;

        if (!name || !service || !hourlyRate || !experience) {
            return NextResponse.json(
                { success: false, error: 'name, service, hourlyRate, and experience are required' },
                { status: 400 }
            );
        }

        const worker = await Worker.create({
            name, service, hourlyRate, experience,
            skills: skills || [],
            description,
            phone,
            email,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            rating: 4.5,
            reviews: 0,
            completedJobs: 0,
            availability: 'Available',
        });

        return NextResponse.json(
            { success: true, message: 'Worker created', worker },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('POST /api/workers error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create worker';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
