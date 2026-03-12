// GET    /api/workers/[id]   → get single worker
// PUT    /api/workers/[id]   → update worker (admin)
// DELETE /api/workers/[id]   → delete worker (admin)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Worker from '@/models/Worker';
import { authenticateRequest } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid worker ID' }, { status: 400 });
        }
        await connectDB();
        const worker = await Worker.findById(id).lean();
        if (!worker) {
            return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, worker: { ...worker, id: (worker._id as { toString(): string }).toString() } });
    } catch (error: unknown) {
        console.error('GET /api/workers/[id] error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = authenticateRequest(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid worker ID' }, { status: 400 });
        }
        await connectDB();
        const body = await req.json();
        const worker = await Worker.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!worker) {
            return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, worker });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = authenticateRequest(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid worker ID' }, { status: 400 });
        }
        await connectDB();
        const worker = await Worker.findByIdAndDelete(id);
        if (!worker) {
            return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Worker deleted' });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
