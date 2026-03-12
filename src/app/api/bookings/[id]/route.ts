// GET   /api/bookings/[id]  → get single booking
// PATCH /api/bookings/[id]  → update booking status
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Worker from '@/models/Worker';
import { authenticateRequest } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = authenticateRequest(req);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid booking ID' }, { status: 400 });
        }
        await connectDB();
        const booking = await Booking.findById(id)
            .populate('workerId', 'name service hourlyRate avatar rating')
            .populate('userId', 'name email phone')
            .lean();

        if (!booking) {
            return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
        }

        // Users can only see their own bookings
        if (
            payload.role === 'user' &&
            (booking.userId as unknown as mongoose.Types.ObjectId).toString() !== payload.userId
        ) {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            booking: { ...booking, id: (booking._id as { toString(): string }).toString() },
        });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = authenticateRequest(req);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid booking ID' }, { status: 400 });
        }
        await connectDB();

        const body = await req.json();
        const { status } = body;

        const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
        }

        // Permission checks:
        // - User can only cancel their own bookings
        // - Worker can confirm/complete jobs assigned to them
        // - Admin can do anything
        if (payload.role === 'user') {
            if (booking.userId.toString() !== payload.userId) {
                return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
            }
            if (status !== 'cancelled') {
                return NextResponse.json({ success: false, error: 'Users can only cancel bookings' }, { status: 403 });
            }
        } else if (payload.role === 'worker') {
            const worker = await Worker.findOne({ userId: payload.userId });
            if (!worker || booking.workerId.toString() !== worker._id.toString()) {
                return NextResponse.json({ success: false, error: 'Access denied: not your assigned job' }, { status: 403 });
            }
        }

        booking.status = status;
        await booking.save();

        const updated = await Booking.findById(id)
            .populate('workerId', 'name service hourlyRate avatar')
            .lean();

        return NextResponse.json({
            success: true,
            message: `Booking status updated to ${status}`,
            booking: { ...updated, id: (updated!._id as { toString(): string }).toString() },
        });
    } catch (error: unknown) {
        console.error('PATCH /api/bookings/[id] error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
