// ─── Booking Model ───────────────────────────────────────────
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    serviceType: string;
    date: string;
    time: string;
    address: string;
    notes?: string;
    paymentMethod: 'cod';
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    amount: number;
    // Populated fields (virtual)
    user?: {
        name: string;
        email: string;
        phone: string;
    };
    worker?: {
        name: string;
        service: string;
        hourlyRate: number;
        avatar: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        workerId: {
            type: Schema.Types.ObjectId,
            ref: 'Worker',
            required: [true, 'Worker ID is required'],
        },
        serviceType: {
            type: String,
            required: [true, 'Service type is required'],
        },
        date: {
            type: String,
            required: [true, 'Booking date is required'],
        },
        time: {
            type: String,
            required: [true, 'Booking time is required'],
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cod'],
            default: 'cod',
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
            default: 'pending',
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for common queries
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ workerId: 1, createdAt: -1 });
BookingSchema.index({ status: 1 });

BookingSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString?.() ?? ret.userId;
        ret.workerId = ret.workerId?.toString?.() ?? ret.workerId;
        return ret;
    },
});

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
