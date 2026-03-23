// ─── Worker Model ────────────────────────────────────────────
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorker extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    service: string;
    rating: number;
    reviews: number;
    hourlyRate: number;
    experience: string;
    avatar: string;
    skills: string[];
    availability: 'Available' | 'Busy';
    completedJobs: number;
    description?: string;
    phone?: string;
    email?: string;
    userId?: mongoose.Types.ObjectId; // linked user account if worker registered
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const WorkerSchema = new Schema<IWorker>(
    {
        name: {
            type: String,
            required: [true, 'Worker name is required'],
            trim: true,
        },
        service: {
            type: String,
            required: [true, 'Service type is required'],
            enum: [
                'Plumber',
                'Electrician',
                'Carpenter',
                'Painter',
                'Cleaner',
                'AC Repair',
                'Driver',
                'Beautician',
            ],
        },
        rating: {
            type: Number,
            default: 4.5,
            min: 1,
            max: 5,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        hourlyRate: {
            type: Number,
            required: [true, 'Hourly rate is required'],
            min: [50, 'Hourly rate must be at least ₹50'],
        },
        experience: {
            type: String,
            required: [true, 'Experience is required'],
        },
        avatar: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        availability: {
            type: String,
            enum: ['Available', 'Busy'],
            default: 'Available',
        },
        completedJobs: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Add text index for searching
WorkerSchema.index({ name: 'text', service: 'text', description: 'text' });
WorkerSchema.index({ service: 1, availability: 1, rating: -1 });

WorkerSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
    },
});

const Worker: Model<IWorker> =
    mongoose.models.Worker || mongoose.model<IWorker>('Worker', WorkerSchema);

export default Worker;
