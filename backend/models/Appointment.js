import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    department: {
        type: String,
        required: true,
        trim: true
    },

    preferredDate: {
        type: String,
        default: ''
    },

    message: {
        type: String,
        default: '',
        trim: true
    },

    status: {
        type: String,
        enum: [
            'new',
            'contacted',
            'confirmed',
            'completed',
            'cancelled'
        ],
        default: 'new'
    },

    // ---------------------------------------------
    // ADMIN ONLY INFORMATION
    // ---------------------------------------------

    assignedDoctor: {
        type: String,
        default: '',
        trim: true,
        maxlength: 120
    },

    adminDetails: {
        type: String,
        default: '',
        trim: true,
        maxlength: 1500
    },

    adminNotes: {
        type: String,
        default: '',
        trim: true,
        maxlength: 2000
    }
}, {
    timestamps: true
});

export default mongoose.model(
    'Appointment',
    appointmentSchema
);