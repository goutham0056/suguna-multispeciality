import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  RefreshCw,
  LogOut,
  Search,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  LayoutDashboard,
  Users,
  Bell,
  X,
  ChevronDown,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const appointmentStatuses = [
  'new',
  'contacted',
  'confirmed',
  'completed',
  'cancelled',
];

const enquiryStatuses = ['new', 'read', 'resolved'];

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusLabel = (value) => {
  const text = String(value || 'new');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function AdminDashboard() {
  const [token, setToken] = useState(
    () => localStorage.getItem('suguna_admin_token') || ''
  );
  const [key, setKey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [adminAppointment, setAdminAppointment] = useState({
    assignedDoctor: '',
    adminDetails: '',
    adminNotes: '',
  });
  const [savingAdminDetails, setSavingAdminDetails] = useState(false);

  const previousAppointmentIds = useRef(null);
  const notificationTimer = useRef(null);
  const [newAppointment, setNewAppointment] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  async function login(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid admin key');
      }

      localStorage.setItem('suguna_admin_token', data.token);
      setToken(data.token);
      setKey('');
    } catch (err) {
      setLoginError(err.message || 'Unable to login');
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('suguna_admin_token');
    setToken('');
    setAppointments([]);
    setEnquiries([]);
    setReviews([]);
    setStats(null);
    setSelectedAppointment(null);
    previousAppointmentIds.current = null;
    setNotificationCount(0);
    setNewAppointment(null);
  }

  function showAppointmentNotification(appointment) {
    setNewAppointment(appointment);
    setNotificationCount((count) => count + 1);

    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    notificationTimer.current = setTimeout(() => {
      setNewAppointment(null);
    }, 10000);
  }

  function dismissNotification() {
    setNewAppointment(null);
  }

  async function loadAll({ silent = false } = {}) {
    if (!token) return;

    if (!silent) setLoading(true);
    setError('');

    try {
      const [a, e, r, s] = await Promise.all([
        fetch(`${API}/appointments`, { headers: authHeaders }),
        fetch(`${API}/enquiries`, { headers: authHeaders }),
        fetch(`${API}/admin/reviews`, { headers: authHeaders }),
        fetch(`${API}/site/stats`),
      ]);

      if ([a, e, r].some((x) => x.status === 401)) {
        logout();
        throw new Error('Admin session expired. Please login again.');
      }

      const [ad, ed, rd, sd] = await Promise.all([
        a.json(),
        e.json(),
        r.json(),
        s.json(),
      ]);

      if (!a.ok) throw new Error(ad.message || 'Unable to load appointments');
      if (!e.ok) throw new Error(ed.message || 'Unable to load enquiries');
      if (!r.ok) throw new Error(rd.message || 'Unable to load reviews');

      const nextAppointments = Array.isArray(ad) ? ad : [];

      if (previousAppointmentIds.current !== null) {
        const previous = new Set(previousAppointmentIds.current);
        const added = nextAppointments.find(
          (item) => item._id && !previous.has(item._id)
        );
        if (added) showAppointmentNotification(added);
      }

      previousAppointmentIds.current = nextAppointments
        .map((item) => item._id)
        .filter(Boolean);

      setAppointments(nextAppointments);
      setEnquiries(Array.isArray(ed) ? ed : []);
      setReviews(Array.isArray(rd) ? rd : []);
      setStats(sd);
    } catch (err) {
      setError(err.message || 'Unable to load admin data');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const timer = setInterval(() => loadAll({ silent: true }), 5000);
    return () => clearInterval(timer);
  }, [token, authHeaders]);

  async function updateAppointment(id, status) {
    try {
      if (!appointmentStatuses.includes(status)) {
        throw new Error('Invalid appointment status');
      }

      const res = await fetch(`${API}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Unable to update appointment');
      }

      setAppointments((items) =>
        items.map((item) => (item._id === id ? data : item))
      );

      if (selectedAppointment?._id === id) {
        setSelectedAppointment(data);
      }

      setMessage('Appointment status updated successfully.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message || 'Unable to update appointment');
    }
  }

  function openAppointmentManager(appointment) {
    setSelectedAppointment(appointment);
    setAdminAppointment({
      assignedDoctor: appointment.assignedDoctor || '',
      adminDetails: appointment.adminDetails || '',
      adminNotes: appointment.adminNotes || '',
    });
    setError('');
    setMessage('');
  }

  async function saveAdminAppointmentDetails() {
    if (!selectedAppointment) return;

    setSavingAdminDetails(true);
    setError('');

    try {
      const res = await fetch(
        `${API}/appointments/${selectedAppointment._id}/admin-details`,
        {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify(adminAppointment),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          data.message || 'Unable to save appointment details'
        );
      }

      setAppointments((items) =>
        items.map((item) => (item._id === data._id ? data : item))
      );
      setSelectedAppointment(data);
      setMessage('Appointment details saved successfully.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message || 'Unable to save appointment details');
    } finally {
      setSavingAdminDetails(false);
    }
  }

  async function updateEnquiry(id, status) {
    try {
      if (!enquiryStatuses.includes(status)) {
        throw new Error('Invalid enquiry status');
      }

      const res = await fetch(`${API}/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Unable to update enquiry');
      }

      setEnquiries((items) =>
        items.map((item) => (item._id === id ? data : item))
      );

      setMessage('Enquiry status updated successfully.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message || 'Unable to update enquiry');
    }
  }

  async function updateReview(id, approved) {
    try {
      const res = await fetch(`${API}/admin/reviews/${id}/approval`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ approved }),
      });

      const data = await res.json();

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Unable to update review');
      }

      setReviews((items) =>
        items.map((item) => (item._id === id ? data : item))
      );

      setMessage(approved ? 'Review approved.' : 'Review hidden.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message || 'Unable to update review');
    }
  }

  const q = search.trim().toLowerCase();

  const filteredAppointments = appointments.filter((item) =>
    !q ||
    [
      item.name,
      item.phone,
      item.department,
      item.status,
      item.preferredDate,
      item.preferredTime,
      item.message,
      item.assignedDoctor,
      item.adminDetails,
      item.adminNotes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q)
  );

  const filteredEnquiries = enquiries.filter((item) =>
    !q ||
    [
      item.name,
      item.phone,
      item.email,
      item.subject,
      item.message,
      item.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q)
  );

  const filteredReviews = reviews.filter((item) =>
    !q ||
    [item.name, item.message, item.rating]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q)
  );

  const newAppointments = appointments.filter(
    (item) => String(item.status || 'new').toLowerCase() === 'new'
  ).length;

  const confirmedAppointments = appointments.filter(
    (item) => String(item.status || '').toLowerCase() === 'confirmed'
  ).length;

  const pendingReviews = reviews.filter((item) => !item.approved).length;

  const metricAppointments = stats?.appointments ?? appointments.length;
  const metricEnquiries = stats?.enquiries ?? enquiries.length;
  const metricReviews =
    stats?.approvedReviews ?? reviews.filter((item) => item.approved).length;
  const metricDepartments = stats?.departments ?? 12;

  if (!token) {
    return (
      <div className="suguna-admin-page" style={styles.page}>
        <div className="suguna-admin-login" style={styles.loginCard}>
          <div style={styles.loginLogo}>
            <div style={styles.loginLogoMark}>S</div>
            <div>
              <div style={styles.logoMain}>SUGUNA</div>
              <div style={styles.logoSub}>MULTISPECIALITY</div>
            </div>
          </div>

          <div style={styles.badge}>ADMIN PORTAL</div>

          <h1 style={styles.loginTitle}>Welcome back.</h1>
          <p style={styles.loginDescription}>
            Sign in to manage appointments, enquiries and patient reviews.
          </p>

          {loginError && (
            <div style={styles.error}>
              <AlertCircle size={17} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={login}>
            <label style={styles.label}>Admin Key</label>

            <input
              autoFocus
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              style={styles.input}
            />

            <button
              type="submit"
              style={{
                ...styles.primary,
                opacity: loginLoading || !key ? 0.6 : 1,
              }}
              disabled={loginLoading || !key}
            >
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={styles.secureText}>🔒 Secure admin access</div>

          <a href="/" style={styles.back}>
            ← Back to website
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="suguna-admin-page" style={styles.page}>
      <div style={styles.shell}>
        <header className="suguna-admin-header" style={styles.header}>
          <div>
            <div style={styles.logoRow}>
              <div style={styles.logoMark}>S</div>
              <div>
                <div style={styles.logoMain}>SUGUNA</div>
                <div style={styles.logoSub}>MULTISPECIALITY</div>
              </div>
            </div>
            <div style={styles.headerSub}>Hospital Administration</div>
          </div>

          <div className="suguna-admin-header-actions" style={styles.headerActions}>
            <button
              style={{
                ...styles.iconButton,
                ...(notificationCount > 0 ? styles.notificationActive : {}),
              }}
              onClick={() => {
                setTab('appointments');
                setNotificationCount(0);
                setNewAppointment(null);
              }}
              title="New appointments"
              aria-label="New appointments"
            >
              <Bell size={19} />
              {notificationCount > 0 && (
                <span style={styles.notificationBadge}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            <button
              style={styles.iconButton}
              onClick={() => loadAll()}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>

            <button style={styles.logout} onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {newAppointment && (
          <div style={styles.notificationToast} role="alert">
            <div style={styles.notificationIcon}>
              <Bell size={19} />
            </div>

            <div style={styles.notificationBody}>
              <strong style={styles.notificationTitle}>
                New Appointment Received
              </strong>
              <span style={styles.notificationText}>
                {newAppointment.name || 'Patient'} booked{' '}
                {newAppointment.department || 'an appointment'}
                {newAppointment.preferredDate
                  ? ` · ${newAppointment.preferredDate}`
                  : ''}
                {newAppointment.preferredTime
                  ? ` · ${newAppointment.preferredTime}`
                  : ''}
              </span>

              <div style={styles.notificationActions}>
                <button
                  style={styles.notificationView}
                  onClick={() => {
                    openAppointmentManager(newAppointment);
                    setTab('appointments');
                    setNotificationCount(0);
                    dismissNotification();
                  }}
                >
                  View Appointment
                </button>
                <button
                  style={styles.notificationDismiss}
                  onClick={dismissNotification}
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              style={styles.notificationClose}
              onClick={dismissNotification}
              aria-label="Close notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {(error || message) && (
          <div style={error ? styles.errorBar : styles.successBar}>
            {error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
            <span>{error || message}</span>
            <button
              onClick={() => {
                setError('');
                setMessage('');
              }}
              style={styles.close}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        <div style={styles.tabs}>
          {[
            ['overview', 'Overview', LayoutDashboard],
            ['appointments', 'Appointments', CalendarDays],
            ['enquiries', 'Enquiries', MessageSquare],
            ['reviews', 'Reviews', Star],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              style={tab === id ? styles.tabActive : styles.tab}
              onClick={() => {
                setTab(id);
                setSearch('');
              }}
            >
              <Icon size={17} />
              {label}
              {id === 'appointments' && newAppointments > 0 && (
                <b style={styles.count}>{newAppointments}</b>
              )}
              {id === 'reviews' && pendingReviews > 0 && (
                <b style={styles.count}>{pendingReviews}</b>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <section className="suguna-admin-hero" style={styles.heroPanel}>
              <div>
                <div style={styles.kicker}>LIVE HOSPITAL DATA</div>
                <h1 style={styles.title}>Good day, Admin.</h1>
                <p style={styles.muted}>
                  Patient appointments are checked automatically every 5
                  seconds. Keep this dashboard open to receive new appointment
                  alerts.
                </p>
              </div>

              <button style={styles.primarySmall} onClick={() => loadAll()}>
                <RefreshCw size={16} />
                Refresh data
              </button>
            </section>

            <div className="suguna-admin-grid4" style={styles.grid4}>
              <Metric
                icon={CalendarDays}
                label="Appointments"
                value={metricAppointments}
                detail={`${newAppointments} new`}
              />
              <Metric
                icon={CheckCircle2}
                label="Confirmed"
                value={confirmedAppointments}
                detail="Confirmed bookings"
              />
              <Metric
                icon={MessageSquare}
                label="Enquiries"
                value={metricEnquiries}
                detail="Patient messages"
              />
              <Metric
                icon={Star}
                label="Approved Reviews"
                value={metricReviews}
                detail={`${pendingReviews} pending`}
              />
            </div>

            <div className="suguna-admin-grid4" style={styles.grid4}>
              <ActionCard
                icon={<CalendarDays size={23} />}
                title="Appointments"
                text="Manage patient bookings"
                onClick={() => setTab('appointments')}
              />
              <ActionCard
                icon={<MessageSquare size={23} />}
                title="Enquiries"
                text="Review patient messages"
                onClick={() => setTab('enquiries')}
              />
              <ActionCard
                icon={<Star size={23} />}
                title="Reviews"
                text="Approve patient feedback"
                onClick={() => setTab('reviews')}
              />
              <ActionCard
                icon={<Users size={23} />}
                title="Departments"
                text={`${metricDepartments} specialist services`}
              />
            </div>

            <div style={styles.sectionRow}>
              <div>
                <h2 style={styles.sectionTitle}>Recent Appointments</h2>
                <p style={styles.sectionNote}>
                  Latest records from your database
                </p>
              </div>

              <button
                style={styles.linkButton}
                onClick={() => setTab('appointments')}
              >
                VIEW ALL
              </button>
            </div>

            <AppointmentTable
              rows={appointments.slice(0, 6)}
              onStatus={updateAppointment}
              onOpen={openAppointmentManager}
            />
          </>
        )}

        {tab === 'appointments' && (
          <>
            <SectionHeader
              title="Appointment Requests"
              note={`${appointments.length} live records · auto-refresh 5 sec`}
            />

            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search name, phone or department"
            />

            <AppointmentTable
              rows={filteredAppointments}
              onStatus={updateAppointment}
              onOpen={openAppointmentManager}
            />
          </>
        )}

        {tab === 'enquiries' && (
          <>
            <SectionHeader
              title="Patient Enquiries"
              note={`${enquiries.length} live records`}
            />

            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search name, email or subject"
            />

            <EnquiryTable
              rows={filteredEnquiries}
              onStatus={updateEnquiry}
            />
          </>
        )}

        {tab === 'reviews' && (
          <>
            <SectionHeader
              title="Patient Reviews"
              note={`${reviews.length} submitted reviews`}
            />

            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search reviews"
            />

            <ReviewTable
              rows={filteredReviews}
              onApproval={updateReview}
            />
          </>
        )}

        <footer style={styles.footer}>
          <div style={styles.footerBrand}>SUGUNA MULTISPECIALITY</div>
          <div>Hospital Administration · Live API</div>
        </footer>
      </div>

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          adminAppointment={adminAppointment}
          setAdminAppointment={setAdminAppointment}
          saving={savingAdminDetails}
          onSave={saveAdminAppointmentDetails}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div style={styles.metric}>
      <div style={styles.metricIcon}>
        <Icon size={22} />
      </div>

      <div style={styles.metricContent}>
        <div style={styles.metricLabel}>{label}</div>
        <div style={styles.metricValue}>{value}</div>
        <div style={styles.metricDetail}>{detail}</div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.actionCard,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={styles.actionIcon}>{icon}</div>
      <div>
        <div style={styles.actionTitle}>{title}</div>
        <div style={styles.actionText}>{text}</div>
      </div>
      {onClick && <div style={styles.actionArrow}>→</div>}
    </button>
  );
}

function SectionHeader({ title, note }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionNote}>{note}</p>
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div style={styles.searchWrap}>
      <Search size={19} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.searchInput}
      />
      {value && (
        <button
          style={styles.searchClear}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function AppointmentTable({ rows, onStatus, onOpen }) {
  if (!rows.length) {
    return <Empty text="No appointment requests found." />;
  }

  return (
    <div style={styles.tableCard}>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Department</th>
              <th>Date / Time</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong style={styles.patientName}>
                    {item.name || 'Unknown patient'}
                  </strong>
                  {item.message && (
                    <span style={styles.subcell}>{item.message}</span>
                  )}
                </td>

                <td>
                  <strong>{item.department || '—'}</strong>
                  {item.assignedDoctor && (
                    <span style={styles.subcell}>
                      Doctor: {item.assignedDoctor}
                    </span>
                  )}
                </td>

                <td>
                  <strong>
                    {item.preferredDate || '—'}
                    {item.preferredTime
                      ? ` · ${item.preferredTime}`
                      : ''}
                  </strong>
                  <span style={styles.subcell}>
                    Created {formatDate(item.createdAt)}
                  </span>
                </td>

                <td>
                  {item.phone ? (
                    <a
                      href={`tel:${item.phone}`}
                      style={styles.phone}
                    >
                      <Phone size={14} />
                      {item.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>

                <td>
                  <StatusSelect
                    value={item.status || 'new'}
                    options={appointmentStatuses}
                    onChange={(value) => onStatus(item._id, value)}
                  />
                </td>

                <td>
                  <button
                    style={styles.viewButton}
                    onClick={() => onOpen(item)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnquiryTable({ rows, onStatus }) {
  if (!rows.length) {
    return <Empty text="No patient enquiries found." />;
  }

  return (
    <div style={styles.tableCard}>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Contact</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name || '—'}</strong>
                </td>

                <td>
                  {item.phone ? (
                    <a href={`tel:${item.phone}`} style={styles.phone}>
                      <Phone size={14} />
                      {item.phone}
                    </a>
                  ) : (
                    '—'
                  )}

                  {item.email && (
                    <span style={styles.subcell}>{item.email}</span>
                  )}
                </td>

                <td>
                  <strong>{item.subject || 'General Enquiry'}</strong>
                </td>

                <td>
                  <span style={styles.messageCell}>
                    {item.message || '—'}
                  </span>
                </td>

                <td>{formatDate(item.createdAt)}</td>

                <td>
                  <StatusSelect
                    value={item.status || 'new'}
                    options={enquiryStatuses}
                    onChange={(value) => onStatus(item._id, value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewTable({ rows, onApproval }) {
  if (!rows.length) {
    return <Empty text="No reviews found." />;
  }

  return (
    <div className="suguna-admin-review-grid" style={styles.reviewGrid}>
      {rows.map((item) => (
        <article key={item._id} style={styles.reviewCard}>
          <div style={styles.reviewTop}>
            <div>
              <strong style={styles.reviewName}>
                {item.name || 'Anonymous'}
              </strong>

              <div style={styles.stars}>
                {'★'.repeat(Math.max(0, Math.min(5, Number(item.rating) || 0)))}
                {'☆'.repeat(
                  5 - Math.max(0, Math.min(5, Number(item.rating) || 0))
                )}
              </div>
            </div>

            <span
              style={
                item.approved
                  ? styles.approvedPill
                  : styles.pendingPill
              }
            >
              {item.approved ? 'Approved' : 'Pending'}
            </span>
          </div>

          <p style={styles.reviewText}>{item.message || '—'}</p>

          <div style={styles.reviewBottom}>
            <span style={styles.date}>{formatDate(item.createdAt)}</span>

            <button
              style={
                item.approved
                  ? styles.secondaryButton
                  : styles.approveButton
              }
              onClick={() => onApproval(item._id, !item.approved)}
            >
              {item.approved ? 'Hide review' : 'Approve review'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusSelect({ value, options, onChange }) {
  return (
    <div style={styles.selectWrap}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...styles.statusSelect,
          ...statusStyle(value),
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {statusLabel(option)}
          </option>
        ))}
      </select>
      <ChevronDown size={14} style={styles.selectChevron} />
    </div>
  );
}

function AppointmentModal({
  appointment,
  adminAppointment,
  setAdminAppointment,
  saving,
  onSave,
  onClose,
}) {
  return (
    <div style={styles.modalBackdrop} onMouseDown={onClose}>
      <div
        style={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.kicker}>APPOINTMENT DETAILS</div>
            <h2 style={styles.modalTitle}>
              {appointment.name || 'Patient'}
            </h2>
          </div>

          <button style={styles.closeModal} onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="suguna-admin-detail-grid" style={styles.detailGrid}>
          <Detail
            label="Department"
            value={appointment.department || '—'}
          />
          <Detail
            label="Preferred date"
            value={appointment.preferredDate || '—'}
          />
          <Detail
            label="Preferred time"
            value={appointment.preferredTime || '—'}
          />
          <Detail
            label="Phone"
            value={appointment.phone || '—'}
          />
        </div>

        {appointment.message && (
          <div style={styles.messageBox}>
            <div style={styles.modalLabel}>PATIENT MESSAGE</div>
            <div style={styles.messageText}>{appointment.message}</div>
          </div>
        )}

        <div style={styles.modalSection}>
          <label style={styles.modalLabel}>ASSIGNED DOCTOR</label>
          <input
            value={adminAppointment.assignedDoctor}
            onChange={(e) =>
              setAdminAppointment((current) => ({
                ...current,
                assignedDoctor: e.target.value,
              }))
            }
            placeholder="Enter doctor name"
            style={styles.modalInput}
          />

          <label style={styles.modalLabel}>ADMIN DETAILS</label>
          <textarea
            value={adminAppointment.adminDetails}
            onChange={(e) =>
              setAdminAppointment((current) => ({
                ...current,
                adminDetails: e.target.value,
              }))
            }
            placeholder="Internal appointment details"
            style={styles.modalTextarea}
          />

          <label style={styles.modalLabel}>ADMIN NOTES</label>
          <textarea
            value={adminAppointment.adminNotes}
            onChange={(e) =>
              setAdminAppointment((current) => ({
                ...current,
                adminNotes: e.target.value,
              }))
            }
            placeholder="Internal notes for hospital staff"
            style={styles.modalTextarea}
          />
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
          <button
            style={styles.approveButton}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save details'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detail}>
      <div style={styles.detailLabel}>{label}</div>
      <strong style={styles.detailValue}>{value}</strong>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>
        <CalendarDays size={25} />
      </div>
      <strong>{text}</strong>
      <span>New records will appear here automatically.</span>
    </div>
  );
}

function statusStyle(status) {
  const map = {
    new: {
      background: '#fff4dc',
      color: '#946300',
    },
    contacted: {
      background: '#edf4ff',
      color: '#315f9d',
    },
    confirmed: {
      background: '#e6f8f1',
      color: '#14795f',
    },
    completed: {
      background: '#e9f2f5',
      color: '#365a66',
    },
    cancelled: {
      background: '#fff0f0',
      color: '#b53b3b',
    },
    read: {
      background: '#edf4ff',
      color: '#315f9d',
    },
    resolved: {
      background: '#e6f8f1',
      color: '#14795f',
    },
  };

  return map[status] || map.new;
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f2f9f8',
    color: '#12354f',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '34px 24px 60px',
    boxSizing: 'border-box',
  },

  shell: {
    width: '100%',
    maxWidth: 1480,
    margin: '0 auto',
  },

  loginCard: {
    width: 'min(520px, 100%)',
    margin: '6vh auto 0',
    background: '#fff',
    border: '1px solid #dfeceb',
    borderRadius: 26,
    padding: 44,
    boxSizing: 'border-box',
    boxShadow: '0 20px 55px rgba(13, 66, 76, .10)',
  },

  loginLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    marginBottom: 34,
  },

  loginLogoMark: {
    width: 54,
    height: 54,
    borderRadius: 15,
    display: 'grid',
    placeItems: 'center',
    background: '#07898a',
    color: '#fff',
    fontSize: 27,
    fontWeight: 900,
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  logoMark: {
    width: 45,
    height: 45,
    borderRadius: 13,
    display: 'grid',
    placeItems: 'center',
    background: '#07898a',
    color: '#fff',
    fontSize: 22,
    fontWeight: 900,
  },

  logoMain: {
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: '.08em',
    color: '#123c58',
  },

  logoSub: {
    marginTop: 5,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: '.28em',
    color: '#07898a',
  },

  headerSub: {
    marginTop: 8,
    fontSize: 13,
    color: '#7b929c',
    paddingLeft: 57,
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: '#e7f7f5',
    color: '#07898a',
    borderRadius: 999,
    padding: '9px 13px',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '.12em',
    marginBottom: 18,
  },

  loginTitle: {
    margin: 0,
    fontSize: 43,
    lineHeight: 1.08,
    letterSpacing: '-.045em',
    color: '#12354f',
  },

  loginDescription: {
    color: '#708894',
    lineHeight: 1.7,
    fontSize: 15,
    margin: '12px 0 28px',
  },

  label: {
    display: 'block',
    color: '#536d78',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '.09em',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    height: 52,
    border: '1px solid #d8e5e4',
    borderRadius: 13,
    padding: '0 15px',
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
    color: '#163d55',
    background: '#fbfefd',
  },

  primary: {
    width: '100%',
    height: 54,
    border: 0,
    borderRadius: 13,
    background: '#07898a',
    color: '#fff',
    fontWeight: 900,
    fontSize: 14,
    letterSpacing: '.04em',
    cursor: 'pointer',
    marginTop: 16,
  },

  secureText: {
    textAlign: 'center',
    color: '#8ba0a8',
    fontSize: 12,
    marginTop: 18,
  },

  back: {
    display: 'block',
    textAlign: 'center',
    color: '#07898a',
    fontWeight: 800,
    textDecoration: 'none',
    marginTop: 20,
    fontSize: 13,
  },

  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    background: '#fff0f0',
    color: '#b53b3b',
    borderRadius: 11,
    padding: '12px 14px',
    marginBottom: 18,
    fontSize: 13,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 25,
    marginBottom: 27,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  iconButton: {
    position: 'relative',
    width: 46,
    height: 46,
    border: '1px solid #dbe7e6',
    borderRadius: 13,
    background: '#fff',
    color: '#087f81',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
  },

  notificationActive: {
    borderColor: '#07898a',
    boxShadow: '0 0 0 4px rgba(7,137,138,.08)',
  },

  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    borderRadius: 99,
    display: 'grid',
    placeItems: 'center',
    background: '#d94a4a',
    color: '#fff',
    fontSize: 10,
    fontWeight: 900,
    border: '2px solid #f2f9f8',
  },

  logout: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 46,
    border: '1px solid #dbe7e6',
    borderRadius: 13,
    background: '#fff',
    color: '#536d78',
    padding: '0 16px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  errorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fff0f0',
    color: '#b53b3b',
    padding: '13px 16px',
    borderRadius: 13,
    marginBottom: 18,
  },

  successBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#e8f8f2',
    color: '#14795f',
    padding: '13px 16px',
    borderRadius: 13,
    marginBottom: 18,
  },

  close: {
    marginLeft: 'auto',
    border: 0,
    background: 'transparent',
    fontSize: 21,
    cursor: 'pointer',
    color: 'inherit',
  },

  notificationToast: {
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 1000,
    width: 'min(430px, calc(100vw - 32px))',
    display: 'flex',
    gap: 13,
    background: '#fff',
    border: '1px solid #d8e9e6',
    borderRadius: 18,
    padding: 16,
    boxShadow: '0 20px 55px rgba(13, 66, 76, .18)',
  },

  notificationIcon: {
    flex: '0 0 auto',
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: '#e7f7f5',
    color: '#07898a',
  },

  notificationBody: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  notificationTitle: {
    color: '#12354f',
    fontSize: 14,
  },

  notificationText: {
    marginTop: 4,
    color: '#6f858f',
    fontSize: 12,
    lineHeight: 1.5,
  },

  notificationActions: {
    display: 'flex',
    gap: 8,
    marginTop: 11,
  },

  notificationView: {
    border: 0,
    borderRadius: 9,
    background: '#07898a',
    color: '#fff',
    padding: '8px 10px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  notificationDismiss: {
    border: '1px solid #dce7e6',
    borderRadius: 9,
    background: '#fff',
    color: '#637984',
    padding: '8px 10px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  notificationClose: {
    marginLeft: 'auto',
    alignSelf: 'flex-start',
    border: 0,
    background: 'transparent',
    color: '#7d9098',
    cursor: 'pointer',
    padding: 3,
  },

  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 24,
  },

  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #dbe7e6',
    borderRadius: 999,
    background: '#fff',
    color: '#627982',
    padding: '11px 16px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  tabActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #07898a',
    borderRadius: 999,
    background: '#07898a',
    color: '#fff',
    padding: '11px 18px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  count: {
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    borderRadius: 99,
    display: 'grid',
    placeItems: 'center',
    background: '#fff',
    color: '#07898a',
    fontSize: 10,
  },

  heroPanel: {
    background: 'linear-gradient(135deg, #ffffff, #eaf8f6)',
    border: '1px solid #dbe9e7',
    borderRadius: 24,
    padding: '30px 34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 25,
    marginBottom: 22,
    boxShadow: '0 12px 35px rgba(20, 79, 85, .05)',
  },

  kicker: {
    color: '#07898a',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '.16em',
  },

  title: {
    margin: '8px 0 7px',
    fontSize: 37,
    lineHeight: 1.1,
    letterSpacing: '-.045em',
    color: '#12354f',
  },

  muted: {
    margin: 0,
    color: '#728a94',
    lineHeight: 1.65,
    fontSize: 14,
    maxWidth: 720,
  },

  primarySmall: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 150,
    height: 46,
    border: 0,
    borderRadius: 12,
    background: '#07898a',
    color: '#fff',
    fontWeight: 900,
    cursor: 'pointer',
    padding: '0 15px',
    flex: '0 0 auto',
  },

  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
    marginBottom: 20,
  },

  metric: {
    minHeight: 145,
    background: '#fff',
    border: '1px solid #dfeae9',
    borderRadius: 20,
    padding: 22,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 15,
    boxShadow: '0 9px 26px rgba(22, 72, 80, .04)',
  },

  metricIcon: {
    width: 48,
    height: 48,
    flex: '0 0 auto',
    display: 'grid',
    placeItems: 'center',
    borderRadius: 14,
    background: '#e8f7f5',
    color: '#07898a',
  },

  metricContent: {
    minWidth: 0,
  },

  metricLabel: {
    color: '#6c838c',
    fontSize: 12,
    fontWeight: 850,
  },

  metricValue: {
    marginTop: 6,
    fontSize: 33,
    lineHeight: 1,
    fontWeight: 950,
    color: '#087f81',
  },

  metricDetail: {
    marginTop: 8,
    color: '#95a5aa',
    fontSize: 11,
  },

  actionCard: {
    position: 'relative',
    minHeight: 145,
    border: '1px solid #dfeae9',
    borderRadius: 20,
    background: '#fff',
    padding: 22,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    color: '#12354f',
    boxShadow: '0 9px 26px rgba(22, 72, 80, .04)',
  },

  actionIcon: {
    width: 48,
    height: 48,
    flex: '0 0 auto',
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    background: '#e8f7f5',
    color: '#07898a',
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: 950,
    marginTop: 3,
  },

  actionText: {
    marginTop: 7,
    color: '#78909a',
    fontSize: 12,
  },

  actionArrow: {
    position: 'absolute',
    right: 20,
    bottom: 18,
    color: '#07898a',
    fontSize: 23,
    fontWeight: 700,
  },

  sectionRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 20,
    margin: '31px 0 14px',
  },

  sectionHeader: {
    margin: '4px 0 14px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: 23,
    fontWeight: 950,
    letterSpacing: '-.025em',
    color: '#12354f',
  },

  sectionNote: {
    margin: '5px 0 0',
    color: '#8a9ca3',
    fontSize: 12,
  },

  linkButton: {
    border: 0,
    background: 'transparent',
    color: '#07898a',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '.08em',
    cursor: 'pointer',
  },

  searchWrap: {
    width: '100%',
    minHeight: 50,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #d9e7e5',
    borderRadius: 14,
    background: '#fff',
    padding: '0 14px',
    marginBottom: 17,
    color: '#7b929b',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 0,
    outline: 0,
    fontSize: 14,
    color: '#254a5e',
    background: 'transparent',
  },

  searchClear: {
    border: 0,
    background: 'transparent',
    color: '#7c9199',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
  },

  tableCard: {
    width: '100%',
    background: '#fff',
    border: '1px solid #dfeae9',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 9px 26px rgba(22, 72, 80, .04)',
  },

  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    minWidth: 1060,
    borderCollapse: 'collapse',
    fontSize: 13,
  },

  patientName: {
    color: '#183d54',
    fontSize: 14,
  },

  subcell: {
    display: 'block',
    color: '#91a0a6',
    fontSize: 11,
    marginTop: 5,
    maxWidth: 250,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  phone: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#07898a',
    textDecoration: 'none',
    fontWeight: 850,
    whiteSpace: 'nowrap',
  },

  messageCell: {
    display: 'block',
    maxWidth: 260,
    color: '#637984',
    lineHeight: 1.45,
  },

  selectWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },

  statusSelect: {
    appearance: 'none',
    border: 0,
    borderRadius: 9,
    minWidth: 120,
    padding: '9px 31px 9px 11px',
    fontWeight: 900,
    fontSize: 11,
    cursor: 'pointer',
    outline: 0,
  },

  selectChevron: {
    position: 'absolute',
    right: 9,
    pointerEvents: 'none',
  },

  viewButton: {
    border: '1px solid #d6e7e5',
    borderRadius: 9,
    background: '#fff',
    color: '#07898a',
    padding: '8px 13px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },

  reviewCard: {
    background: '#fff',
    border: '1px solid #dfeae9',
    borderRadius: 19,
    padding: 21,
    boxShadow: '0 9px 26px rgba(22, 72, 80, .04)',
  },

  reviewTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 15,
  },

  reviewName: {
    fontSize: 15,
    color: '#183d54',
  },

  stars: {
    marginTop: 6,
    color: '#d69b19',
    letterSpacing: 2,
    fontSize: 15,
  },

  approvedPill: {
    background: '#e6f8f1',
    color: '#14795f',
    padding: '6px 9px',
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 950,
    textTransform: 'uppercase',
    letterSpacing: '.07em',
  },

  pendingPill: {
    background: '#fff3dc',
    color: '#946300',
    padding: '6px 9px',
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 950,
    textTransform: 'uppercase',
    letterSpacing: '.07em',
  },

  reviewText: {
    color: '#5f747e',
    lineHeight: 1.7,
    fontSize: 14,
    margin: '17px 0',
  },

  reviewBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },

  date: {
    color: '#91a0a6',
    fontSize: 11,
  },

  approveButton: {
    border: 0,
    borderRadius: 9,
    background: '#07898a',
    color: '#fff',
    padding: '9px 13px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  secondaryButton: {
    border: '1px solid #d8e5e4',
    borderRadius: 9,
    background: '#fff',
    color: '#5d747e',
    padding: '9px 13px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  empty: {
    minHeight: 260,
    background: '#fff',
    border: '1px solid #dfeae9',
    borderRadius: 20,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: 9,
    color: '#84969d',
    textAlign: 'center',
    boxShadow: '0 9px 26px rgba(22, 72, 80, .04)',
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    background: '#e8f7f5',
    color: '#07898a',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 3,
  },

  footer: {
    marginTop: 42,
    padding: '29px 20px',
    borderRadius: 20,
    background: '#082d45',
    color: '#a7c1c8',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 1.8,
  },

  footerBrand: {
    color: '#fff',
    fontWeight: 950,
    letterSpacing: '.15em',
    marginBottom: 3,
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    background: 'rgba(7, 35, 48, .42)',
    backdropFilter: 'blur(5px)',
    display: 'grid',
    placeItems: 'center',
    padding: 20,
    boxSizing: 'border-box',
  },

  modal: {
    width: 'min(760px, 100%)',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 23,
    padding: 27,
    boxSizing: 'border-box',
    boxShadow: '0 30px 80px rgba(7, 35, 48, .25)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 20,
  },

  modalTitle: {
    margin: '7px 0 0',
    color: '#12354f',
    fontSize: 27,
    letterSpacing: '-.035em',
  },

  closeModal: {
    width: 40,
    height: 40,
    border: '1px solid #dce8e6',
    borderRadius: 11,
    background: '#fff',
    color: '#637984',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 11,
  },

  detail: {
    background: '#f5fbfa',
    border: '1px solid #e4eeec',
    borderRadius: 12,
    padding: 13,
  },

  detailLabel: {
    color: '#8b9da3',
    fontSize: 10,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    marginBottom: 5,
  },

  detailValue: {
    color: '#244a5e',
    fontSize: 13,
  },

  messageBox: {
    marginTop: 13,
    background: '#f5fbfa',
    borderRadius: 12,
    padding: '11px 13px',
  },

  messageText: {
    color: '#5e747e',
    fontSize: 13,
    lineHeight: 1.6,
  },

  modalSection: {
    marginTop: 20,
  },

  modalLabel: {
    display: 'block',
    margin: '12px 0 7px',
    color: '#627982',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '.09em',
  },

  modalInput: {
    width: '100%',
    height: 45,
    border: '1px solid #dbe8e6',
    borderRadius: 11,
    padding: '0 12px',
    boxSizing: 'border-box',
    outline: 0,
    color: '#294d5f',
    fontSize: 13,
  },

  modalTextarea: {
    width: '100%',
    minHeight: 85,
    resize: 'vertical',
    border: '1px solid #dbe8e6',
    borderRadius: 11,
    padding: 12,
    boxSizing: 'border-box',
    outline: 0,
    color: '#294d5f',
    fontSize: 13,
    fontFamily: 'inherit',
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
  },
};

const responsiveStyle = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  button, input, textarea, select { font: inherit; }

  table th,
  table td {
    text-align: left;
    padding: 16px 15px;
    border-bottom: 1px solid #edf2f1;
    vertical-align: middle;
  }

  table th {
    color: #81939a;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: .09em;
    font-weight: 950;
    background: #fbfdfc;
  }

  table tbody tr:hover {
    background: #fbfefd;
  }

  .spin {
    animation: sugunaSpin 1s linear infinite;
  }

  @keyframes sugunaSpin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1100px) {
    .suguna-admin-grid4 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 800px) {
    .suguna-admin-page {
      padding: 18px 14px 40px !important;
    }

    .suguna-admin-hero {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .suguna-admin-grid4 {
      grid-template-columns: 1fr !important;
    }

    .suguna-admin-review-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 600px) {
    .suguna-admin-login {
      padding: 27px !important;
    }

    .suguna-admin-header {
      align-items: flex-start !important;
    }

    .suguna-admin-header-actions {
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .suguna-admin-detail-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

function AdminDashboardWithResponsive() {
  return (
    <>
      <style>{responsiveStyle}</style>
      <div className="suguna-admin-page">
        <AdminDashboard />
      </div>
    </>
  );
}

export default AdminDashboardWithResponsive;
export { AdminDashboard };
