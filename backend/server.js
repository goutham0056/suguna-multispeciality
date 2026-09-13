import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

import Review from './models/Review.js';
import Appointment from './models/Appointment.js';
import Enquiry from './models/Enquiry.js';

dotenv.config();

// --------------------------------------------------
// DNS
// --------------------------------------------------

dns.setServers(['8.8.8.8']);

// --------------------------------------------------
// APP
// --------------------------------------------------

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_URL =
    process.env.CLIENT_URL ||
    'http://localhost:5173';

const JWT_SECRET =
    process.env.JWT_SECRET ||
    'change-this-secret-in-production';

// --------------------------------------------------
// SECURITY / MIDDLEWARE
// --------------------------------------------------

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin',
        },
    })
);

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: '100kb',
    })
);

const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', publicLimiter);

// --------------------------------------------------
// STATIC DATA
// --------------------------------------------------

const departments = [{
        id: 'general-medicine',
        name: 'General Medicine',
        description: 'Complete primary and preventive care',
    },
    {
        id: 'gastroenterology',
        name: 'Gastroenterology',
        description: 'Digestive health and advanced endoscopy',
    },
    {
        id: 'pulmonology',
        name: 'Pulmonology',
        description: 'Respiratory and lung care',
    },
    {
        id: 'cardiology',
        name: 'Cardiology',
        description: 'Heart health, ECG, ECHO and cardiac screening',
    },
    {
        id: 'diabetology',
        name: 'Diabetology',
        description: 'Personalised diabetes management',
    },
    {
        id: 'ent',
        name: 'ENT',
        description: 'Ear, nose and throat care',
    },
    {
        id: 'pediatrics',
        name: 'Pediatrics',
        description: 'Care for infants and children',
    },
    {
        id: 'womens-health',
        name: 'Women’s Health',
        description: 'Dedicated women’s healthcare',
    },
    {
        id: 'orthopaedics',
        name: 'Orthopaedics',
        description: 'Bone and joint care',
    },
    {
        id: 'dermatology',
        name: 'Dermatology',
        description: 'Skin and hair care',
    },
    {
        id: 'urology-nephrology',
        name: 'Urology & Nephrology',
        description: 'Urinary and kidney care',
    },
    {
        id: 'ophthalmology',
        name: 'Ophthalmology',
        description: 'Eye health and vision care',
    },
];

const diagnostics = [
    'H. Pylori Breath Test',
    'Lactose Intolerance Test',
    'Capsule Endoscopy',
    'ECG',
    'ECHO',
    'Ultrasound Scan',
    'Digital X-Ray',
    'Stress ECG / Treadmill Test',
    '24x7 Manometry',
    'Spirometry',
];

const facilities = [
    '24×7 Emergency Care',
    'Physiotherapy',
    'Endoscopy',
    'Laparoscopic Surgery',
    'Operation Theatre',
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const clean = (value, max = 1500) =>
    typeof value === 'string' ?
    value.trim().slice(0, max) :
    '';

const validPhone = (value) =>
    /^[0-9+()\-\s]{7,20}$/.test(
        String(value || '')
    );

// --------------------------------------------------
// HEALTH
// --------------------------------------------------

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Suguna Multispeciality API',
        time: new Date().toISOString(),
    });
});

// --------------------------------------------------
// DEPARTMENTS
// --------------------------------------------------

app.get('/api/departments', (req, res) => {
    res.json(departments);
});

// --------------------------------------------------
// DIAGNOSTICS
// --------------------------------------------------

app.get('/api/diagnostics', (req, res) => {
    res.json(diagnostics);
});

// --------------------------------------------------
// FACILITIES
// --------------------------------------------------

app.get('/api/facilities', (req, res) => {
    res.json(facilities);
});

// --------------------------------------------------
// SITE STATISTICS
// --------------------------------------------------

app.get(
    '/api/site/stats',
    async(req, res) => {
        try {
            const [
                appointments,
                enquiries,
                approvedReviews,
            ] = await Promise.all([
                Appointment.countDocuments(),
                Enquiry.countDocuments(),
                Review.countDocuments({
                    approved: true,
                }),
            ]);

            res.json({
                departments: departments.length,
                diagnostics: diagnostics.length,
                appointments,
                enquiries,
                approvedReviews,
            });
        } catch (error) {
            console.error(
                'Statistics error:',
                error
            );

            res.status(500).json({
                message: 'Unable to load statistics',
            });
        }
    }
);

// --------------------------------------------------
// PUBLIC REVIEWS
// --------------------------------------------------

app.get(
    '/api/reviews',
    async(req, res) => {
        try {
            const reviews =
                await Review.find({
                    approved: true,
                })
                .sort({
                    createdAt: -1,
                })
                .limit(50)
                .lean();

            res.json(reviews);
        } catch (error) {
            console.error(
                'Review fetch error:',
                error
            );

            res.status(500).json({
                message: 'Unable to load reviews',
            });
        }
    }
);

// --------------------------------------------------
// SUBMIT REVIEW
// --------------------------------------------------

app.post(
    '/api/reviews',
    writeLimiter,
    async(req, res) => {
        try {
            const name = clean(
                req.body.name,
                80
            );

            const message = clean(
                req.body.message,
                1000
            );

            const rating =
                Number(req.body.rating);

            if (!name ||
                !message ||
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {
                return res.status(400).json({
                    message: 'Name, rating and review are required',
                });
            }

            const review =
                await Review.create({
                    name,
                    rating,
                    message,
                    approved: false,
                });

            res.status(201).json({
                message: 'Thank you. Your review is submitted for approval.',
                review,
            });
        } catch (error) {
            console.error(
                'Review save error:',
                error
            );

            res.status(500).json({
                message: 'Unable to save review',
            });
        }
    }
);

// --------------------------------------------------
// CREATE APPOINTMENT
// --------------------------------------------------

app.post(
    '/api/appointments',
    writeLimiter,
    async(req, res) => {
        try {
            const name = clean(
                req.body.name,
                80
            );

            const phone = clean(
                req.body.phone,
                20
            );

            const department = clean(
                req.body.department,
                100
            );

            const preferredDate =
                clean(
                    req.body.preferredDate,
                    30
                );

            const message = clean(
                req.body.message,
                500
            );

            if (!name ||
                !validPhone(phone) ||
                !department
            ) {
                return res.status(400).json({
                    message: 'Please provide a valid name, phone number and department',
                });
            }

            const appointment =
                await Appointment.create({
                    name,
                    phone,
                    department,
                    preferredDate,
                    message,
                });

            console.log(
                '✅ Appointment saved:',
                appointment._id
            );

            res.status(201).json({
                message: 'Appointment request received',
                appointment,
            });
        } catch (error) {
            console.error(
                'Appointment save error:',
                error
            );

            res.status(500).json({
                message: 'Unable to save appointment',
            });
        }
    }
);

// --------------------------------------------------
// ADMIN AUTHENTICATION
// --------------------------------------------------

function adminOnly(req, res, next) {
    const header =
        req.headers.authorization || '';

    const token =
        header.startsWith('Bearer ') ?
        header.slice(7) :
        '';

    try {
        const payload =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (!payload ||
            payload.role !== 'admin'
        ) {
            throw new Error(
                'Invalid admin role'
            );
        }

        req.admin = payload;

        next();
    } catch (error) {
        res.status(401).json({
            message: 'Admin authentication required',
        });
    }
}

// --------------------------------------------------
// ADMIN LOGIN
// --------------------------------------------------

app.post(
    '/api/admin/login',
    writeLimiter,
    (req, res) => {
        const key = clean(
            req.body.key,
            200
        );

        if (!process.env.ADMIN_KEY ||
            key !== process.env.ADMIN_KEY
        ) {
            return res.status(401).json({
                message: 'Invalid admin key',
            });
        }

        const token =
            jwt.sign({
                    role: 'admin',
                },
                JWT_SECRET, {
                    expiresIn: '8h',
                }
            );

        res.json({
            token,
            expiresIn: '8h',
        });
    }
);

// --------------------------------------------------
// ADMIN APPOINTMENTS
// --------------------------------------------------

app.get(
    '/api/appointments',
    adminOnly,
    async(req, res) => {
        try {
            const appointments =
                await Appointment.find()
                .sort({
                    createdAt: -1,
                })
                .limit(200)
                .lean();

            res.json(appointments);
        } catch (error) {
            console.error(
                'Appointment fetch error:',
                error
            );

            res.status(500).json({
                message: 'Unable to load appointments',
            });
        }
    }
);

// --------------------------------------------------
// UPDATE APPOINTMENT STATUS
// --------------------------------------------------

app.patch(
    '/api/appointments/:id/status',
    adminOnly,
    async(req, res) => {
        try {
            const allowed = [
                'new',
                'contacted',
                'confirmed',
                'completed',
                'cancelled',
            ];

            if (!allowed.includes(
                    req.body.status
                )) {
                return res.status(400).json({
                    message: 'Invalid status',
                });
            }

            const item =
                await Appointment.findByIdAndUpdate(
                    req.params.id, {
                        status: req.body.status,
                    }, {
                        new: true,
                        runValidators: true,
                    }
                );

            if (!item) {
                return res.status(404).json({
                    message: 'Appointment not found',
                });
            }

            res.json(item);
        } catch (error) {
            console.error(
                'Appointment status error:',
                error
            );

            res.status(500).json({
                message: 'Unable to update appointment',
            });
        }
    }
);

// --------------------------------------------------
// UPDATE ADMIN-ONLY APPOINTMENT DETAILS
// --------------------------------------------------

app.patch(
    '/api/appointments/:id/admin-details',
    adminOnly,
    async(req, res) => {
        try {
            const assignedDoctor =
                clean(
                    req.body.assignedDoctor,
                    120
                );

            const adminDetails =
                clean(
                    req.body.adminDetails,
                    1500
                );

            const adminNotes =
                clean(
                    req.body.adminNotes,
                    2000
                );

            const item =
                await Appointment.findByIdAndUpdate(
                    req.params.id, {
                        assignedDoctor,
                        adminDetails,
                        adminNotes,
                    }, {
                        new: true,
                        runValidators: true,
                    }
                );

            if (!item) {
                return res.status(404).json({
                    message: 'Appointment not found',
                });
            }

            console.log(
                '✅ Admin appointment details updated:',
                item._id
            );

            res.json(item);
        } catch (error) {
            console.error(
                'Admin appointment details error:',
                error
            );

            res.status(500).json({
                message: 'Unable to update appointment details',
            });
        }
    }
);

// --------------------------------------------------
// CREATE ENQUIRY
// --------------------------------------------------

app.post(
    '/api/enquiries',
    writeLimiter,
    async(req, res) => {
        try {
            const name = clean(
                req.body.name,
                80
            );

            const phone = clean(
                req.body.phone,
                20
            );

            const email = clean(
                req.body.email,
                120
            );

            const subject =
                clean(
                    req.body.subject,
                    120
                ) ||
                'General Enquiry';

            const message = clean(
                req.body.message,
                1500
            );

            if (!name ||
                !validPhone(phone) ||
                !message
            ) {
                return res.status(400).json({
                    message: 'Name, valid phone and message are required',
                });
            }

            const enquiry =
                await Enquiry.create({
                    name,
                    phone,
                    email,
                    subject,
                    message,
                });

            res.status(201).json({
                message: 'Enquiry received',
                enquiry,
            });
        } catch (error) {
            console.error(
                'Enquiry save error:',
                error
            );

            res.status(500).json({
                message: 'Unable to save enquiry',
            });
        }
    }
);

// --------------------------------------------------
// ADMIN ENQUIRIES
// --------------------------------------------------

app.get(
    '/api/enquiries',
    adminOnly,
    async(req, res) => {
        try {
            const enquiries =
                await Enquiry.find()
                .sort({
                    createdAt: -1,
                })
                .limit(200)
                .lean();

            res.json(enquiries);
        } catch (error) {
            console.error(
                'Enquiry fetch error:',
                error
            );

            res.status(500).json({
                message: 'Unable to load enquiries',
            });
        }
    }
);

// --------------------------------------------------
// UPDATE ENQUIRY STATUS
// --------------------------------------------------

app.patch(
    '/api/enquiries/:id/status',
    adminOnly,
    async(req, res) => {
        try {
            const allowed = [
                'new',
                'read',
                'resolved',
            ];

            if (!allowed.includes(
                    req.body.status
                )) {
                return res.status(400).json({
                    message: 'Invalid status',
                });
            }

            const item =
                await Enquiry.findByIdAndUpdate(
                    req.params.id, {
                        status: req.body.status,
                    }, {
                        new: true,
                    }
                );

            if (!item) {
                return res.status(404).json({
                    message: 'Enquiry not found',
                });
            }

            res.json(item);
        } catch (error) {
            console.error(
                'Enquiry update error:',
                error
            );

            res.status(500).json({
                message: 'Unable to update enquiry',
            });
        }
    }
);

// --------------------------------------------------
// ADMIN REVIEWS
// --------------------------------------------------

app.get(
    '/api/admin/reviews',
    adminOnly,
    async(req, res) => {
        try {
            const reviews =
                await Review.find()
                .sort({
                    createdAt: -1,
                })
                .limit(200)
                .lean();

            res.json(reviews);
        } catch (error) {
            console.error(
                'Admin review fetch error:',
                error
            );

            res.status(500).json({
                message: 'Unable to load reviews',
            });
        }
    }
);

// --------------------------------------------------
// APPROVE / REJECT REVIEW
// --------------------------------------------------

app.patch(
    '/api/admin/reviews/:id/approval',
    adminOnly,
    async(req, res) => {
        try {
            const approved =
                Boolean(
                    req.body.approved
                );

            const item =
                await Review.findByIdAndUpdate(
                    req.params.id, {
                        approved,
                    }, {
                        new: true,
                    }
                );

            if (!item) {
                return res.status(404).json({
                    message: 'Review not found',
                });
            }

            res.json(item);
        } catch (error) {
            console.error(
                'Review approval error:',
                error
            );

            res.status(500).json({
                message: 'Unable to update review',
            });
        }
    }
);

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use(
    (err, req, res, next) => {
        console.error(
            'Unexpected server error:',
            err
        );

        res.status(500).json({
            message: 'Unexpected server error',
        });
    }
);

// --------------------------------------------------
// MONGODB CONNECTION
// --------------------------------------------------

console.log(
    'MongoDB URI loaded:',
    process.env.MONGODB_URI ?
    'YES' :
    'NO'
);

mongoose
    .connect(
        process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
        }
    )
    .then(() => {
        console.log(
            'MongoDB connected successfully'
        );

        app.listen(
            PORT,
            () => {
                console.log(
                    `Suguna Multispeciality API running on http://localhost:${PORT}`
                );
            }
        );
    })
    .catch((error) => {
        console.error(
            'MongoDB connection failed:',
            error.message
        );

        process.exit(1);
    });