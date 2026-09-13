import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  HeartPulse, Phone, MapPin, Clock, Ambulance, CalendarDays, Send,
  ArrowRight, ShieldCheck, Stethoscope, Activity, ScanLine, Menu, X,
  CheckCircle2, MessageCircle, UserRound, ClipboardCheck, Sparkles,
  Building2
} from 'lucide-react';
import './styles.css';
import AdminDashboard from './AdminDashboard.jsx';

import logo from './assets/images/logo.jpg';
import doctorRajasekar from './assets/images/doctor-rajasekar.jpg';
import doctorGayathri from './assets/images/doctor-Gayathri.jpg';
import hospitalHero from './assets/images/hospital-hero.jpg';
import hospitalAbout from './assets/images/hospital-about.jpg';
import hospitalGallery1 from './assets/images/hospital-gallery-1.jpg';
import hospitalGallery2 from './assets/images/hospital-gallery-2.jpg';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PHONE = '9442745744';

/* -------------------------------------------------------
   HOSPITAL CONTENT
------------------------------------------------------- */

const departments = [
  ['General Medicine', 'Complete primary and preventive care'],
  ['Gastroenterology', 'Digestive health and advanced endoscopy'],
  ['Pulmonology', 'Respiratory and lung care'],
  ['Cardiology', 'Heart health, ECG, ECHO and cardiac screening'],
  ['Diabetology', 'Personalised diabetes management'],
  ['ENT', 'Ear, nose and throat care'],
  ['Pediatrics', 'Care for infants and children'],
  ['Women’s Health', 'Dedicated women’s healthcare'],
  ['Orthopaedics', 'Bone and joint care'],
  ['Dermatology', 'Skin and hair care'],
  ['Urology & Nephrology', 'Urinary and kidney care'],
  ['Ophthalmology', 'Eye health and vision care'],
];

const specialTreatments = [
  {
    title: 'Emergency Care',
    description: '24×7 support for urgent medical needs and immediate assessment.',
  },
  {
    title: 'Cardiac Care',
    description: 'Heart-focused consultation, ECG, ECHO and cardiac screening.',
  },
  {
    title: 'Snake Bite & Poison Management',
    description: 'Urgent evaluation and medical management for bites and poisoning emergencies.',
  },
  {
    title: 'General Medicine',
    description: 'Comprehensive care for common illnesses, chronic conditions and preventive needs.',
  },
  {
    title: 'General Surgery',
    description: 'Surgical consultation and procedure support for appropriate conditions.',
  },
  {
    title: 'Obstetrics / Maternity',
    description: 'Dedicated women’s and maternity care with consultation and follow-up.',
  },
  {
    title: 'Fracture Treatment',
    description: 'Evaluation and care for fractures, injuries and musculoskeletal concerns.',
  },
  {
    title: 'Pulmonology',
    description: 'Respiratory and lung care for breathing-related concerns.',
  },
  {
    title: 'Dermatology',
    description: 'Care for skin, hair and related dermatological concerns.',
  },
  {
    title: 'Urology & Nephrology',
    description: 'Urinary-system and kidney-related consultation and evaluation.',
  },
];

const diagnostics = [
  {
    title: 'Full Body Health Check-up',
    description: 'Comprehensive health screening and routine evaluation.',
  },
  {
    title: 'Automated Blood Test Laboratory',
    description: 'Laboratory investigations and routine blood testing support.',
  },
  {
    title: 'Special Gastrointestinal Tests',
    description: 'Specialised investigations for gastrointestinal conditions.',
  },
  {
    title: 'H. Pylori Breath Test',
    description: 'Breath-based testing for H. pylori evaluation.',
  },
  {
    title: 'Lactose Intolerance Test',
    description: 'Testing support for suspected lactose intolerance.',
  },
  {
    title: 'Capsule Endoscopy',
    description: 'Small-bowel visualisation using capsule endoscopy.',
  },
  {
    title: 'ECG',
    description: 'Electrocardiogram testing for cardiac assessment.',
  },
  {
    title: 'ECHO',
    description: 'Echocardiography for structural and functional heart assessment.',
  },
  {
    title: 'Ultrasound Scan',
    description: 'Ultrasound imaging for diagnostic evaluation.',
  },
  {
    title: 'Digital X-Ray',
    description: 'Digital radiography for diagnostic imaging.',
  },
  {
    title: 'Stress ECG (Treadmill)',
    description: 'Exercise-based cardiac stress assessment.',
  },
  {
    title: '24×7 Manometry',
    description: 'Manometry-based assessment of gastrointestinal function.',
  },
  {
    title: 'Spirometry',
    description: 'Pulmonary function testing for respiratory assessment.',
  },
  {
    title: 'Pharmacy',
    description: 'Convenient access to medicines and pharmacy support.',
  },
];

const facilities = [
  {
    title: '24×7 Emergency Care',
    description: 'Urgent medical support whenever you need it.',
  },
  {
    title: 'Physiotherapy',
    description: 'Rehabilitation and mobility-focused supportive care.',
  },
  {
    title: 'Endoscopy',
    description: 'Endoscopic diagnostic and procedure support.',
  },
  {
    title: 'Laparoscopic Surgery',
    description: 'Minimally invasive surgical procedure support.',
  },
  {
    title: 'Operation Theatre',
    description: 'Dedicated operating theatre facilities for procedures and surgery.',
  },
];

const testimonials = [
  { name: 'Puvi S.P', text: 'Friendly doctor and working staffs very good.', rating: 5 },
  {
    name: 'Thirumal M',
    text: 'Friendly doctor. Patiently hearing our concern and suggesting the best medicine. Treatment was good.',
    rating: 5,
  },
  {
    name: 'dr dr',
    text: 'Patient care is utmost preference in this hospital. Service is good. Satisfied.',
    rating: 5,
  },
  {
    name: 'Thavaselvam D',
    text: 'Best hospital and caring patients and explain very well.',
    rating: 5,
  },
];

/* -------------------------------------------------------
   DEPARTMENT DETAIL PAGES
------------------------------------------------------- */

const departmentDetails = {
  'General Medicine': {
    subtitle: 'Complete primary and preventive care',
    description:
      'Comprehensive medical care for common illnesses, chronic conditions, preventive health needs and routine health evaluation.',
    services: [
      'General health consultation',
      'Fever and common infections',
      'Blood pressure management',
      'Diabetes screening and management',
      'Preventive health check-ups',
      'Routine medical evaluation',
    ],
  },
  Gastroenterology: {
    subtitle: 'Digestive health and advanced endoscopy',
    description:
      'Specialised care for digestive system conditions with consultation, evaluation and advanced diagnostic support.',
    services: [
      'Digestive disorder consultation',
      'Acidity and gastric problems',
      'Liver and digestive health evaluation',
      'H. Pylori testing',
      'Endoscopy services',
      'Capsule endoscopy',
    ],
  },
  Pulmonology: {
    subtitle: 'Respiratory and lung care',
    description:
      'Focused respiratory care for breathing problems, lung conditions and related health concerns.',
    services: [
      'Respiratory consultation',
      'Asthma evaluation',
      'Breathing difficulty assessment',
      'Chronic respiratory care',
      'Spirometry',
      'Lung health evaluation',
    ],
  },
  Cardiology: {
    subtitle: 'Heart health, ECG, ECHO and cardiac screening',
    description:
      'Comprehensive cardiac evaluation and screening focused on heart health and early detection of cardiovascular concerns.',
    services: [
      'Cardiac consultation',
      'ECG',
      'ECHO',
      'Cardiac screening',
      'Blood pressure evaluation',
      'Heart health assessment',
    ],
  },
  Diabetology: {
    subtitle: 'Personalised diabetes management',
    description:
      'Personalised care for diabetes prevention, monitoring and long-term management.',
    services: [
      'Diabetes consultation',
      'Blood sugar evaluation',
      'Diabetes monitoring',
      'Lifestyle guidance',
      'Complication screening',
      'Long-term diabetes management',
    ],
  },
  ENT: {
    subtitle: 'Ear, nose and throat care',
    description:
      'Specialised evaluation and treatment support for conditions affecting the ear, nose and throat.',
    services: [
      'Ear care',
      'Nose and sinus evaluation',
      'Throat consultation',
      'Hearing-related evaluation',
      'Sinus problems',
      'ENT health assessment',
    ],
  },
  Pediatrics: {
    subtitle: 'Care for infants and children',
    description:
      'Dedicated healthcare support for infants, children and growing families.',
    services: [
      'Child health consultation',
      'Infant care',
      'Growth monitoring',
      'Common childhood illnesses',
      'Preventive care',
      'General pediatric evaluation',
    ],
  },
  'Women’s Health': {
    subtitle: 'Dedicated women’s healthcare',
    description:
      'Patient-focused healthcare services addressing general and specialised health needs of women.',
    services: [
      'Women’s health consultation',
      'Preventive health check-ups',
      'Women’s wellness evaluation',
      'Routine health assessment',
      'General medical care',
      'Personalised care guidance',
    ],
  },
  Orthopaedics: {
    subtitle: 'Bone and joint care',
    description:
      'Care focused on bones, joints, muscles and mobility-related concerns.',
    services: [
      'Bone and joint consultation',
      'Joint pain evaluation',
      'Musculoskeletal assessment',
      'Injury evaluation',
      'Mobility-related concerns',
      'Orthopaedic health assessment',
    ],
  },
  Dermatology: {
    subtitle: 'Skin and hair care',
    description:
      'Specialised care for skin, hair and related dermatological concerns.',
    services: [
      'Skin consultation',
      'Acne and skin problems',
      'Hair and scalp concerns',
      'Skin infection evaluation',
      'General dermatology care',
      'Skin health guidance',
    ],
  },
  'Urology & Nephrology': {
    subtitle: 'Urinary and kidney care',
    description:
      'Focused medical care for urinary-system and kidney-related health concerns.',
    services: [
      'Urinary health consultation',
      'Kidney health evaluation',
      'Urinary infection assessment',
      'Kidney-related screening',
      'Stone-related evaluation',
      'Renal health assessment',
    ],
  },
  Ophthalmology: {
    subtitle: 'Eye health and vision care',
    description:
      'Comprehensive eye and vision care with evaluation and screening support.',
    services: [
      'Eye consultation',
      'Vision assessment',
      'Eye health screening',
      'Common eye condition evaluation',
      'Preventive eye care',
      'General ophthalmic assessment',
    ],
  },
};

const departmentSlug = (title) =>
  title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[’']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

/* -------------------------------------------------------
   REUSABLE CARD
------------------------------------------------------- */

function ContentCard({ number, icon, title, description }) {
  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid rgba(8,59,89,.10)',
        borderRadius: '22px',
        padding: '26px',
        boxShadow: '0 14px 40px rgba(8,59,89,.07)',
        minHeight: '190px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform .25s ease, box-shadow .25s ease',
      }}
    >
      <div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: '#e8f7f5',
            color: '#0b918d',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 20,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '.12em',
            color: '#9ab0b8',
            marginBottom: 8,
          }}
        >
          {String(number).padStart(2, '0')}
        </div>
        <h3 style={{ margin: '0 0 10px', fontSize: 21 }}>{title}</h3>
        <p style={{ margin: 0, color: '#607780', lineHeight: 1.65 }}>
          {description}
        </p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------
   DEPARTMENT PAGE
------------------------------------------------------- */

function DepartmentPage({ department }) {
  const details = departmentDetails[department];

  if (!details) {
    window.location.replace('/');
    return null;
  }

  return (
    <div>
      <div className="topbar">
        <div><Ambulance size={16} /> 24×7 Emergency Care</div>
        <div>
          <Clock size={16} /> Open 24 Hours <span className="dot">•</span>
          <Phone size={16} /> {PHONE}
        </div>
      </div>

      <nav>
        <a className="brand" href="/#home">
          <div className="brand-mark">
            <img src={logo} alt="Suguna Multispeciality logo" />
          </div>
          <div><b>SUGUNA</b><span>MULTISPECIALITY</span></div>
        </a>

        <div className="navlinks">
          {['Home', 'About', 'Departments', 'Diagnostics', 'Doctors', 'Gallery', 'Reviews', 'Contact'].map(
            (x) => <a key={x} href={`/#${x.toLowerCase()}`}>{x}</a>
          )}
        </div>

        <a href="/#appointment" className="nav-cta">Book Appointment</a>
      </nav>

      <main>
        <section className="section" style={{ paddingTop: 90 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <a
              href="/#departments"
              className="text-link"
              style={{ display: 'inline-flex', marginBottom: 30 }}
            >
              ← Back to Departments
            </a>

            <p className="kicker">OUR DEPARTMENT</p>
            <h1 style={{ fontSize: 'clamp(42px,6vw,76px)', marginBottom: 12 }}>
              {department}
            </h1>
            <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
              {details.subtitle}
            </p>
            <p
              className="lead"
              style={{ maxWidth: 850, lineHeight: 1.8, marginBottom: 42 }}
            >
              {details.description}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                gap: 18,
                marginBottom: 45,
              }}
            >
              {details.services.map((service, i) => (
                <article
                  key={service}
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,.08)',
                    borderRadius: 18,
                    padding: 24,
                    boxShadow: '0 12px 35px rgba(0,0,0,.06)',
                  }}
                >
                  <Stethoscope size={25} />
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      margin: '14px 0 8px',
                      opacity: .55,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 style={{ margin: 0 }}>{service}</h3>
                </article>
              ))}
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg,#083b59,#0b918d)',
                borderRadius: 24,
                padding: 35,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 25,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, letterSpacing: 1, opacity: .8 }}>
                  NEED A CONSULTATION?
                </p>
                <h2 style={{ margin: '0 0 8px', fontSize: 30 }}>
                  Book an Appointment
                </h2>
                <p style={{ margin: 0, opacity: .9 }}>
                  Our team can help guide you to the appropriate consultation.
                </p>
              </div>
              <a
                href={`/?department=${encodeURIComponent(department)}#appointment`}
                className="primary"
              >
                Book Appointment <ArrowRight />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">SUGUNA <span>MULTISPECIALITY</span></div>
        <p>Compassionate Care. Complete Health.</p>
        <small>
          © {new Date().getFullYear()} Suguna Multispeciality. All rights reserved.
          {' · '}<a className="admin-link" href="/admin">Admin</a>
        </small>
      </footer>

      <a className="call-float" href={`tel:${PHONE}`} aria-label="Call Suguna Multispeciality">
        <Phone />
      </a>
    </div>
  );
}

/* -------------------------------------------------------
   MAIN WEBSITE
------------------------------------------------------- */

function WebsiteApp() {
  const [menu, setMenu] = useState(false);
  const [review, setReview] = useState({ name: '', rating: 5, message: '' });
  const [appointment, setAppointment] = useState({
    name: '',
    phone: '',
    department: 'General Medicine',
    date: '',
    message: '',
  });
  const [reviewStatus, setReviewStatus] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [enquiry, setEnquiry] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Enquiry',
    message: '',
  });
  const [enquiryStatus, setEnquiryStatus] = useState('');
  const [liveReviews, setLiveReviews] = useState([]);

  useEffect(() => {
    fetch(`${API}/reviews`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setLiveReviews)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedDepartment = params.get('department');
    if (selectedDepartment && departments.some(([name]) => name === selectedDepartment)) {
      setAppointment((prev) => ({ ...prev, department: selectedDepartment }));
    }
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReviewStatus('');

    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (!res.ok) throw new Error();

      setReviewStatus('Thank you. Your review has been submitted for approval.');
      setReview({ name: '', rating: 5, message: '' });
    } catch {
      setReviewStatus('Unable to reach the server right now. Please try again in a moment.');
    }

    setLoading(false);
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEnquiryStatus('');

    try {
      const res = await fetch(`${API}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry),
      });

      if (!res.ok) throw new Error();

      setEnquiryStatus('Thanks. Your enquiry has been received. Our team will contact you soon.');
      setEnquiry({
        name: '',
        phone: '',
        email: '',
        subject: 'General Enquiry',
        message: '',
      });
    } catch {
      setEnquiryStatus('Unable to reach the server right now. Please try again in a moment.');
    }

    setLoading(false);
  };

  const submitAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAppointmentStatus('');

    const payload = {
      ...appointment,
      preferredDate: appointment.date,
    };

    try {
      const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      setAppointmentStatus(
        'Appointment request received. Our team will contact you shortly.'
      );

      setAppointment({
        name: '',
        phone: '',
        department: 'General Medicine',
        date: '',
        message: '',
      });
    } catch {
      setAppointmentStatus(
        'Unable to submit the appointment right now. Please call the hospital for assistance.'
      );
    }

    setLoading(false);
  };

  const allReviews = [
    ...testimonials,
    ...liveReviews.map((r) => ({
      name: r.name,
      text: r.message,
      rating: r.rating,
    })),
  ]
    .filter(
      (r, i, a) =>
        a.findIndex((x) => x.name === r.name && x.text === r.text) === i
    )
    .slice(0, 8);

  return (
    <div>
      <div className="topbar">
        <div><Ambulance size={16} /> 24×7 Emergency Care</div>
        <div>
          <Clock size={16} /> Open 24 Hours <span className="dot">•</span>
          <Phone size={16} /> {PHONE}
        </div>
      </div>

      <nav>
        <a className="brand" href="#home">
          <div className="brand-mark">
            <img src={logo} alt="Suguna Multispeciality logo" />
          </div>
          <div>
            <b>SUGUNA</b>
            <span>MULTISPECIALITY</span>
          </div>
        </a>

        <div className={menu ? 'navlinks open' : 'navlinks'}>
          {[
            'Home',
            'About',
            'Departments',
            'Diagnostics',
            'Treatments',
            'Doctors',
            'Gallery',
            'Reviews',
            'Contact',
          ].map((x) => (
            <a
              key={x}
              onClick={() => setMenu(false)}
              href={`#${x.toLowerCase()}`}
            >
              {x}
            </a>
          ))}
        </div>

        <a href="#appointment" className="nav-cta">
          Book Appointment
        </a>

        <button
          className="menu"
          aria-label="Open menu"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </nav>

      <main id="home">
        {/* HERO */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <ShieldCheck /> Trusted Multispeciality Healthcare
            </div>

            <h1>
              Compassionate Care.
              <br />
              <em>Complete Health.</em>
            </h1>

            <p>
              Specialist consultation, advanced diagnostics and patient-centred
              care in one trusted healthcare destination.
            </p>

            <div className="hero-actions">
              <a href="#appointment" className="primary">
                Book an Appointment <ArrowRight />
              </a>
              <a href={`tel:${PHONE}`} className="secondary">
                <Phone /> Call Hospital
              </a>
            </div>

            <div className="trust-row">
              <div><b>24×7</b><span>Emergency Care</span></div>
              <div><b>{diagnostics.length}+</b><span>Diagnostic Services</span></div>
              <div><b>{departments.length}+</b><span>Specialist Services</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div
              className="photo hero-photo asset-image"
              style={{ backgroundImage: `url(${hospitalHero})` }}
              aria-label="Suguna hospital exterior"
            >
              <div className="image-caption">
                <b>Suguna Multispeciality</b>
                <small>Dharmapuri • 24×7 Emergency Care</small>
              </div>
            </div>

            <div className="floating-card emergency">
              <Ambulance />
              <div>
                <b>24×7 Emergency</b>
                <span>Immediate medical support</span>
              </div>
            </div>

            <div className="floating-card location">
              <MapPin />
              <div>
                <b>Pennagaram</b>
                <span>Dharmapuri</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="quick-grid">
          <a href="#appointment">
            <CalendarDays />
            <div>
              <b>Book Appointment</b>
              <span>Schedule your consultation</span>
            </div>
            <ArrowRight />
          </a>

          <a href="#diagnostics">
            <ScanLine />
            <div>
              <b>Advanced Diagnostics</b>
              <span>Tests, scans and cardiac care</span>
            </div>
            <ArrowRight />
          </a>

          <a href={`tel:${PHONE}`}>
            <Activity />
            <div>
              <b>Emergency Support</b>
              <span>24×7 care when it matters</span>
            </div>
            <ArrowRight />
          </a>
        </section>

        {/* ABOUT */}
        <section id="about" className="section split">
          <div
            className="about-image photo asset-image"
            style={{ backgroundImage: `url(${hospitalAbout})` }}
            aria-label="Suguna hospital exterior"
          >
            <div className="image-caption">
              <b>Our Hospital</b>
              <small>Patient-centred care in a trusted local facility</small>
            </div>
          </div>

          <div>
            <p className="kicker">ABOUT SUGUNA</p>
            <h2>
              Healthcare built around <em>people.</em>
            </h2>

            <p className="lead">
              Suguna Multispeciality brings specialist consultation, diagnostic
              services and compassionate patient care together with a simple
              goal — helping patients and families access the right care with
              clarity and confidence.
            </p>

            <div className="checks">
              <span><CheckCircle2 /> Patient-first approach</span>
              <span><CheckCircle2 /> Specialist medical care</span>
              <span><CheckCircle2 /> Advanced diagnostics</span>
              <span><CheckCircle2 /> 24×7 emergency availability</span>
            </div>

            <a className="text-link" href="#departments">
              Explore our services <ArrowRight />
            </a>
          </div>
        </section>

        {/* FEATURE BAND */}
        <section className="section feature-band">
          <div className="feature-card">
            <Sparkles />
            <b>Compassionate care</b>
            <span>Clear communication and a patient-focused experience.</span>
          </div>
          <div className="feature-card">
            <ClipboardCheck />
            <b>Integrated diagnostics</b>
            <span>Important tests and investigations in one care journey.</span>
          </div>
          <div className="feature-card">
            <HeartPulse />
            <b>Emergency ready</b>
            <span>24-hour availability for urgent medical support.</span>
          </div>
          <div className="feature-card">
            <UserRound />
            <b>Personal attention</b>
            <span>Consultation that focuses on individual patient needs.</span>
          </div>
        </section>

        {/* DEPARTMENTS */}
        <section id="departments" className="section tint">
          <div className="section-head">
            <div>
              <p className="kicker">OUR DEPARTMENTS</p>
              <h2>Specialist care for <em>every need.</em></h2>
            </div>
            <a href="#appointment" className="outline">
              Consult a Doctor <ArrowRight />
            </a>
          </div>

          <div className="dept-grid">
            {departments.map(([title, desc], i) => (
              <article
                className="dept-card"
                key={title}
                onClick={() =>
                  (window.location.href = `/department/${departmentSlug(title)}`)
                }
                style={{ cursor: 'pointer' }}
              >
                <span className="number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Stethoscope />
                <h3>{title}</h3>
                <p>{desc}</p>
                <ArrowRight />
              </article>
            ))}
          </div>
        </section>

        {/* SPECIAL TREATMENTS */}
        <section id="treatments" className="section">
          <div className="section-head">
            <div>
              <p className="kicker">SPECIAL TREATMENTS</p>
              <h2>
                Focused care for <em>important needs.</em>
              </h2>
            </div>
            <a href="#appointment" className="outline">
              Book Consultation <ArrowRight />
            </a>
          </div>

          <p
            className="lead"
            style={{
              maxWidth: 820,
              marginBottom: 42,
            }}
          >
            Dedicated treatment and procedure support across emergency,
            medical, surgical and specialist care pathways.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
              gap: 20,
            }}
          >
            {specialTreatments.map((item, i) => (
              <ContentCard
                key={item.title}
                number={i + 1}
                title={item.title}
                description={item.description}
                icon={<HeartPulse size={23} />}
              />
            ))}
          </div>
        </section>

        {/* DIAGNOSTICS */}
        <section id="diagnostics" className="section tint">
          <div className="section-head">
            <div>
              <p className="kicker">ADVANCED DIAGNOSTICS</p>
              <h2>
                Clarity for better <em>decisions.</em>
              </h2>
            </div>
            <a href="#appointment" className="outline">
              Ask About a Test <ArrowRight />
            </a>
          </div>

          <p className="lead" style={{ maxWidth: 820, marginBottom: 42 }}>
            Diagnostic investigations and screening services to support
            consultation, diagnosis and ongoing patient care.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
              gap: 20,
            }}
          >
            {diagnostics.map((item, i) => (
              <ContentCard
                key={item.title}
                number={i + 1}
                title={item.title}
                description={item.description}
                icon={<ScanLine size={23} />}
              />
            ))}
          </div>
        </section>

        {/* FACILITIES */}
        <section id="facilities" className="section">
          <div className="section-head">
            <div>
              <p className="kicker">HOSPITAL FACILITIES & PROCEDURES</p>
              <h2>
                Built for <em>complete care.</em>
              </h2>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
              gap: 20,
            }}
          >
            {facilities.map((item, i) => (
              <ContentCard
                key={item.title}
                number={i + 1}
                title={item.title}
                description={item.description}
                icon={<Building2 size={23} />}
              />
            ))}
          </div>
        </section>

        {/* DOCTORS */}
        <section id="doctors" className="section tint">
          <div className="section-head">
            <div>
              <p className="kicker">OUR DOCTORS</p>
              <h2>Experienced care with <em>personal attention.</em></h2>
            </div>
          </div>

          <div className="doctor-grid">
            <article className="doctor-card">
              <div
                className="doctor-photo photo real-photo"
                style={{ backgroundImage: `url(${doctorRajasekar})` }}
                aria-label="Dr. G. Rajasekar"
              >
                <div className="image-caption">
                  <b>Dr. G. Rajasekar</b>
                  <small>Consultant</small>
                </div>
              </div>
              <div className="doctor-info">
                <p>GENERAL MEDICINE & MULTISPECIALITY CARE</p>
                <h3>Dr. G. Rajasekar</h3>
                <span>M.B.B.S., M.S.</span>
                <div className="tags">
                  <i>C.USG</i>
                  <i>F.ECHO</i>
                  <i>C.Endoscopy</i>
                  <i>C.Diabetes</i>
                  <i>Cardiology</i>
                  <i>Toxicology</i>
                </div>
              </div>
            </article>

            <article className="doctor-card">
              <div
                className="doctor-photo photo real-photo"
                style={{ backgroundImage: `url(${doctorGayathri})` }}
                aria-label="Dr. G. Gayathri"
              >
                <div className="image-caption">
                  <b>Dr. G. Gayathri</b>
                  <small>Consultant</small>
                </div>
              </div>
              <div className="doctor-info">
                <p>WOMEN’S & GENERAL PHYSICIAN</p>
                <h3>Dr. G. Gayathri</h3>
                <span>M.B.B.S., C.USG.</span>
                <div className="tags">
                  <i>Women’s Health</i>
                  <i>General Care</i>
                  <i>C.USG</i>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* APPOINTMENT */}
        <section id="appointment" className="section appointment">
          <div className="section-head">
            <div>
              <p className="kicker">BOOK AN APPOINTMENT</p>
              <h2>
                Let’s plan your <em>visit.</em>
              </h2>
            </div>
          </div>

          <div className="appointment-wrap">
            <div className="appointment-copy">
              <div className="appointment-icon">
                <CalendarDays />
              </div>
              <h3>Request a consultation</h3>
              <p>
                Share your basic details and preferred department/date. Your
                request will be securely sent to the hospital administration.
              </p>

              <div className="appointment-points">
                <span><CheckCircle2 /> Specialist consultation</span>
                <span><CheckCircle2 /> Diagnostic support</span>
                <span><CheckCircle2 /> 24×7 emergency availability</span>
              </div>
            </div>

            <form onSubmit={submitAppointment} className="appointment-form">
              <div className="form-two">
                <input
                  required
                  placeholder="Your name"
                  value={appointment.name}
                  onChange={(e) =>
                    setAppointment({ ...appointment, name: e.target.value })
                  }
                />
                <input
                  required
                  type="tel"
                  placeholder="Mobile number"
                  value={appointment.phone}
                  onChange={(e) =>
                    setAppointment({ ...appointment, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-two">
                <select
                  value={appointment.department}
                  onChange={(e) =>
                    setAppointment({
                      ...appointment,
                      department: e.target.value,
                    })
                  }
                >
                  {departments.map(([name]) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={appointment.date}
                  onChange={(e) =>
                    setAppointment({ ...appointment, date: e.target.value })
                  }
                />
              </div>

              <textarea
                rows="5"
                placeholder="Reason for consultation / message"
                value={appointment.message}
                onChange={(e) =>
                  setAppointment({ ...appointment, message: e.target.value })
                }
              />

              {appointmentStatus && (
                <div className="success">{appointmentStatus}</div>
              )}

              <button className="primary" disabled={loading} type="submit">
                {loading ? 'Submitting...' : 'Submit Appointment Request'}
                <Send />
              </button>
            </form>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="section tint">
          <div className="section-head">
            <div>
              <p className="kicker">OUR FACILITY</p>
              <h2>Care in a trusted <em>environment.</em></h2>
            </div>
          </div>

          <div className="gallery">
            <div
              className="photo gallery-main asset-image"
              style={{ backgroundImage: `url(${hospitalGallery1})` }}
              aria-label="Suguna hospital exterior"
            >
              <div className="image-caption">
                <b>Hospital Exterior</b>
                <small>Our facility in Dharmapuri</small>
              </div>
            </div>

            <div
              className="photo asset-image"
              style={{ backgroundImage: `url(${hospitalGallery2})` }}
              aria-label="Suguna hospital and services"
            >
              <div className="image-caption">
                <b>Hospital & Services</b>
                <small>Specialist and diagnostic care</small>
              </div>
            </div>

            <div
              className="photo asset-image"
              style={{ backgroundImage: `url(${hospitalHero})` }}
              aria-label="Suguna emergency care facility"
            >
              <div className="image-caption">
                <b>24×7 Care</b>
                <small>Emergency support when you need it</small>
              </div>
            </div>

            <div className="gallery-text">
              <b>24×7</b>
              <span>
                Emergency care, diagnostics and specialist support when you
                need it.
              </span>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" className="section reviews">
          <div className="section-head">
            <div>
              <p className="kicker">PATIENT VOICES</p>
              <h2>
                Trusted by the people we <em>care for.</em>
              </h2>
            </div>
            <div className="rating-big">
              <b>5.0</b>
              <span>★★★★★</span>
              <small>Patient feedback</small>
            </div>
          </div>

          <div className="review-grid">
            {allReviews.map((r) => (
              <article
                className="review-card"
                key={`${r.name}-${r.text}`}
              >
                <div className="stars">{'★'.repeat(r.rating)}</div>
                <p>“{r.text}”</p>
                <b>{r.name}</b>
              </article>
            ))}
          </div>

          <div className="review-form-wrap">
            <div>
              <p className="kicker">SHARE YOUR EXPERIENCE</p>
              <h3>Your feedback helps us improve.</h3>
              <p>
                Reviews are checked before they are displayed publicly.
              </p>
            </div>

            <form onSubmit={submitReview}>
              <input
                required
                placeholder="Your name"
                value={review.name}
                onChange={(e) =>
                  setReview({ ...review, name: e.target.value })
                }
              />

              <select
                value={review.rating}
                onChange={(e) =>
                  setReview({
                    ...review,
                    rating: Number(e.target.value),
                  })
                }
              >
                {[5, 4, 3, 2, 1].map((x) => (
                  <option key={x} value={x}>
                    {x} Star{x > 1 ? 's' : ''}
                  </option>
                ))}
              </select>

              <textarea
                required
                rows="5"
                placeholder="Tell us about your experience"
                value={review.message}
                onChange={(e) =>
                  setReview({ ...review, message: e.target.value })
                }
              />

              {reviewStatus && (
                <div className="success">{reviewStatus}</div>
              )}

              <button className="primary" disabled={loading} type="submit">
                {loading ? 'Sending...' : 'Submit Review'} <Send />
              </button>
            </form>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section contact">
          <div>
            <p className="kicker">VISIT SUGUNA</p>
            <h2>Here when you <em>need us.</em></h2>
          </div>

          <div className="contact-cards">
            <a href={`tel:${PHONE}`}>
              <Phone />
              <span>Call Us</span>
              <b>{PHONE}</b>
            </a>

            <a
              href="https://maps.google.com/?q=161/44+A3,+East+Coast+Rd,+Pennagaram,+Kumarasamipatti,+Dharmapuri,+Tamil+Nadu+636701"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin />
              <span>Address</span>
              <b>
                161/44 A3, East Coast Rd, Pennagaram, Kumarasamipatti,
                Dharmapuri, Tamil Nadu 636701
              </b>
            </a>

            <div>
              <Clock />
              <span>Availability</span>
              <b>Open 24 Hours</b>
            </div>
          </div>

          <div className="contact-enquiry">
            <div>
              <p className="kicker">SEND A MESSAGE</p>
              <h3>
                Need help choosing a <em>service?</em>
              </h3>
              <p>
                For non-emergency questions, send your details and our team
                can guide you.
              </p>
            </div>

            <form onSubmit={submitEnquiry}>
              <div className="form-two">
                <input
                  required
                  placeholder="Your name"
                  value={enquiry.name}
                  onChange={(e) =>
                    setEnquiry({ ...enquiry, name: e.target.value })
                  }
                />
                <input
                  required
                  type="tel"
                  placeholder="Mobile number"
                  value={enquiry.phone}
                  onChange={(e) =>
                    setEnquiry({ ...enquiry, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-two">
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={enquiry.email}
                  onChange={(e) =>
                    setEnquiry({ ...enquiry, email: e.target.value })
                  }
                />

                <select
                  value={enquiry.subject}
                  onChange={(e) =>
                    setEnquiry({
                      ...enquiry,
                      subject: e.target.value,
                    })
                  }
                >
                  <option>General Enquiry</option>
                  <option>Department Information</option>
                  <option>Diagnostic Test</option>
                  <option>Appointment Help</option>
                  <option>Emergency Information</option>
                  <option>Special Treatment</option>
                </select>
              </div>

              <textarea
                required
                rows="4"
                placeholder="How can we help?"
                value={enquiry.message}
                onChange={(e) =>
                  setEnquiry({ ...enquiry, message: e.target.value })
                }
              />

              {enquiryStatus && (
                <div className="success">{enquiryStatus}</div>
              )}

              <button className="primary" disabled={loading} type="submit">
                {loading ? 'Sending...' : 'Send Enquiry'} <Send />
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          SUGUNA <span>MULTISPECIALITY</span>
        </div>
        <p>Compassionate Care. Complete Health.</p>
        <small>
          © {new Date().getFullYear()} Suguna Multispeciality. All rights
          reserved. {' · '}
          <a className="admin-link" href="/admin">Admin</a>
        </small>
      </footer>

      <a
        className="call-float"
        href={`tel:${PHONE}`}
        aria-label="Call Suguna Multispeciality"
      >
        <Phone />
      </a>
    </div>
  );
}

/* -------------------------------------------------------
   APP ROUTING
------------------------------------------------------- */

function App() {
  const path = window.location.pathname;

  if (path.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  if (path.startsWith('/department/')) {
    const slug = path
      .replace('/department/', '')
      .replace(/\/$/, '');

    const match = departments.find(
      ([title]) => departmentSlug(title) === slug
    );

    return (
      <DepartmentPage department={match ? match[0] : null} />
    );
  }

  return <WebsiteApp />;
}

createRoot(document.getElementById('root')).render(<App />);
