import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Create appointment
router.post('/', async(req, res) => {
    try {
        const {
            name,
            phone,
            department,
            preferredDate,
            message
        } = req.body;

        if (!name || !phone || !department) {
            return res.status(400).json({
                message: 'Name, phone and department are required'
            });
        }

        const appointment = await Appointment.create({
            name: String(name).trim(),
            phone: String(phone).trim(),
            department: String(department).trim(),
            preferredDate: preferredDate || '',
            message: message ? String(message).trim() : ''
        });

        console.log('✅ Appointment saved to MongoDB:', appointment._id);

        return res.status(201).json({
            message: 'Appointment request received',
            appointment
        });

    } catch (err) {
        console.error('❌ Appointment save error:', err);

        return res.status(500).json({
            message: 'Unable to save appointment',
            error: err.message
        });
    }
});

// Get appointments
router.get('/', async(req, res) => {
    try {
        const appointments = await Appointment
            .find()
            .sort({ createdAt: -1 });

        return res.json(appointments);

    } catch (err) {
        console.error('❌ Appointment fetch error:', err);

        return res.status(500).json({
            message: 'Unable to load appointments',
            error: err.message
        });
    }
});

// Update appointment status
router.patch('/:id/status', async(req, res) => {
    try {
        const allowedStatuses = [
            'new',
            'contacted',
            'confirmed',
            'completed',
            'cancelled'
        ];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: 'Invalid status'
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, { status: req.body.status }, { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        return res.json(appointment);

    } catch (err) {
        console.error('❌ Appointment update error:', err);

        return res.status(500).json({
            message: 'Unable to update appointment',
            error: err.message
        });
    }
});

export default router;