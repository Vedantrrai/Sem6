// POST /api/bookings              → Create a booking (authenticated users)
// GET  /api/bookings              → Get bookings (user sees own, admin sees all)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Worker from '@/models/Worker';
import { authenticateRequest } from '@/lib/jwt';

// GET /api/bookings
export async function GET(req: NextRequest) {
    try {
        const payload = authenticateRequest(req);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = {};

        // Regular users see only their bookings; admins see all; workers see jobs for their profile
        if (payload.role === 'worker') {
            const worker = await Worker.findOne({ userId: payload.userId });
            if (worker) {
                filter.workerId = worker._id;
            } else {
                return NextResponse.json({ success: true, count: 0, bookings: [] });
            }
        } else if (payload.role !== 'admin') {
            filter.userId = payload.userId;
        }

        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate('workerId', 'name service hourlyRate avatar rating')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: bookings.length,
            bookings: bookings.map(b => ({
                ...b,
                id: (b._id as { toString(): string }).toString(),
                userId: (b.userId as unknown as { _id: { toString(): string }; name: string; email: string; phone: string }),
                workerId: (b.workerId as unknown as { _id: { toString(): string }; name: string; service: string; hourlyRate: number; avatar: string; rating: number }),
            })),
        });
    } catch (error: unknown) {
        console.error('GET /api/bookings error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// POST /api/bookings
export async function POST(req: NextRequest) {
    try {
        const payload = authenticateRequest(req);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Please login to make a booking' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { workerId, date, time, address, notes, amount } = body;

        if (!workerId || !date || !time || !address) {
            return NextResponse.json(
                { success: false, error: 'workerId, date, time, and address are required' },
                { status: 400 }
            );
        }

        // Verify worker exists and is available
        const worker = await Worker.findById(workerId);
        if (!worker) {
            return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
        }
        if (worker.availability !== 'Available') {
            return NextResponse.json({ success: false, error: 'This worker is currently not available' }, { status: 400 });
        }

        const booking = await Booking.create({
            userId: payload.userId,
            workerId,
            serviceType: worker.service,
            date,
            time,
            address,
            notes,
            amount: amount || worker.hourlyRate,
            paymentMethod: 'cod',
            status: 'pending',
        });

        // Populate the response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('workerId', 'name service hourlyRate avatar rating')
            .lean();

        return NextResponse.json(
            {
                success: true,
                message: 'Booking created successfully!',
                booking: { ...populatedBooking, id: (populatedBooking!._id as { toString(): string }).toString() },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('POST /api/bookings error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create booking';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
