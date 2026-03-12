// GET /api/admin/stats  → Platform overview stats for admin dashboard
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Worker from '@/models/Worker';
import Booking from '@/models/Booking';
import { authenticateRequest } from '@/lib/jwt';

export async function GET(req: NextRequest) {
    try {
        const payload = authenticateRequest(req);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const [
            totalUsers,
            totalWorkers,
            totalBookings,
            bookingsByStatus,
            recentBookings,
            availableWorkers,
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Worker.countDocuments(),
            Booking.countDocuments(),
            Booking.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
            ]),
            Booking.find()
                .populate('workerId', 'name service')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            Worker.countDocuments({ availability: 'Available' }),
        ]);

        // Calculate total revenue from completed bookings
        const completedStats = bookingsByStatus.find(s => s._id === 'completed');
        const totalRevenue = completedStats?.revenue || 0;

        // Build status breakdown
        const statusBreakdown: Record<string, number> = {};
        bookingsByStatus.forEach(s => {
            statusBreakdown[s._id] = s.count;
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalWorkers,
                totalBookings,
                totalRevenue,
                availableWorkers,
                statusBreakdown,
                recentBookings: recentBookings.map(b => ({
                    ...b,
                    id: (b._id as { toString(): string }).toString(),
                })),
            },
        });
    } catch (error: unknown) {
        console.error('GET /api/admin/stats error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
