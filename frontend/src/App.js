import React, { useState, useEffect } from 'react';

const DEPARTMENTS = {
  'Pothole': { name: 'PWD (Public Works Department)', phone: '1800-XXX-XXXX', email: 'pwd@municipal.gov.in' },
  'Water Leak': { name: 'Water Supply Board', phone: '1800-XXX-XXXX', email: 'water@municipal.gov.in' },
  'Broken Light': { name: 'Electricity Department', phone: '1800-XXX-XXXX', email: 'electricity@municipal.gov.in' },
  'Garbage': { name: 'Sanitation Department', phone: '1800-XXX-XXXX', email: 'sanitation@municipal.gov.in' },
  'Damaged Road': { name: 'PWD (Public Works Department)', phone: '1800-XXX-XXXX', email: 'pwd@municipal.gov.in' },
  'Other': { name: 'General Municipal Helpline', phone: '1800-XXX-XXXX', email: 'helpdesk@municipal.gov.in' },
};

const API_BASE = 'https://community-hero-production.up.railway.app';

const STEPS = [
  { key: 'open', label: 'Issue Raised' },
  { key: 'verified', label: 'Verified' },
  { key: 'in-progress', label: 'Work Started' },
  { key: 'resolved', label: 'Resolved' },
];

const statusColor = (status) => {
  if (status === 'resolved') return { background: '#d4edda', color: '#155724' };
  if (status === 'verified') return { background: '#fff3cd', color: '#856404' };
  if (status === 'in-progress') return { background: '#cce5ff', color: '#004085' };
  return { background: '#e2e3e5', color: '#383d41' };
};

function getStepIndex(status) {
  const idx = STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ---------------- STATUS STEPPER ----------------
function StatusStepper({ status, compact }) {
  const currentIndex = getStepIndex(status);

  const styles = {
    wrapper: { display: 'flex', alignItems: 'center', margin: compact ? '10px 0' : '20px 0' },
    stepWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    circle: (done, current) => ({
      width: compact ? '18px' : '28px',
      height: compact ? '18px' : '28px',
      borderRadius: '50%',
      background: done ? '#4338ca' : '#e0e0e0',
      color: done ? 'white' : '#999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: compact ? '10px' : '13px',
      fontWeight: '700',
      border: current ? '3px solid #c7d2fe' : 'none',
      transition: 'all 0.3s',
    }),
    line: (done) => ({
      flex: 1,
      height: '3px',
      background: done ? '#4338ca' : '#e0e0e0',
      transition: 'all 0.3s',
    }),
    label: {
      fontSize: compact ? '9px' : '11px',
      marginTop: '6px',
      textAlign: 'center',
      color: '#555',
      fontWeight: '600',
      maxWidth: '70px',
    },
  };

  return (
    <div style={styles.wrapper}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step.key}>
          <div style={styles.stepWrap}>
            <div style={styles.circle(i <= currentIndex, i === currentIndex)}>
              {i <= currentIndex ? '✓' : i + 1}
            </div>
            {!compact && <div style={styles.label}>{step.label}</div>}
          </div>
          {i < STEPS.length - 1 && <div style={styles.line(i < currentIndex)} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function App() {
  const [view, setView] = useState('landing');
  const [stats, setStats] = useState({ totalIssues: 0, byCategory: [] });
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchIssues();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/issues/stats/all`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (err) {}
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/issues`);
      const data = await res.json();
      if (data.success) setIssues(data.issues);
    } catch (err) {}
  };

  return view === 'landing' ? (
    <LandingPage onGetStarted={() => setView('report')} stats={stats} issues={issues} />
  ) : (
    <ReportPage onBack={() => setView('landing')} issues={issues} refreshIssues={() => { fetchIssues(); fetchStats(); }} />
  );
}

// ---------------- LANDING PAGE ----------------
function LandingPage({ onGetStarted, stats, issues }) {
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const recentResolved = issues.filter(i => i.status === 'resolved').slice(0, 3);

  const styles = {
    page: { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#222' },
    nav: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 40px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      position: 'sticky', top: 0, zIndex: 10,
    },
    logo: { fontSize: '22px', fontWeight: '800', color: '#4338ca' },
    loginBtn: {
      padding: '10px 22px', borderRadius: '8px', border: '2px solid #4338ca',
      background: 'white', color: '#4338ca', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
    },
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white', padding: '90px 20px 70px', textAlign: 'center',
    },
    heroTitle: { fontSize: '46px', fontWeight: '800', margin: '0 0 16px 0' },
    heroSubtitle: { fontSize: '19px', opacity: 0.92, maxWidth: '600px', margin: '0 auto 35px' },
    ctaBtn: {
      padding: '16px 36px', fontSize: '17px', fontWeight: '700', borderRadius: '10px',
      border: 'none', background: 'white', color: '#4338ca', cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
    statsBar: { display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '50px', flexWrap: 'wrap' },
    statBox: { textAlign: 'center' },
    statNum: { fontSize: '36px', fontWeight: '800' },
    statLabel: { fontSize: '14px', opacity: 0.85 },
    section: { maxWidth: '1000px', margin: '0 auto', padding: '70px 20px' },
    sectionTitle: { fontSize: '30px', fontWeight: '800', textAlign: 'center', marginBottom: '40px' },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' },
    featureCard: { background: '#f8f9ff', borderRadius: '14px', padding: '28px', border: '1px solid #e0e4ff' },
    featureIcon: { fontSize: '30px', marginBottom: '12px' },
    featureTitle: { fontWeight: '700', fontSize: '16px', marginBottom: '8px' },
    featureText: { fontSize: '13px', color: '#666', lineHeight: '1.5' },
    resolvedGrid: { display: 'grid', gap: '16px' },
    resolvedCard: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', background: 'white', borderRadius: '10px',
      border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    },
    footer: { background: '#1a1a2e', color: '#aaa', textAlign: 'center', padding: '30px', fontSize: '13px' },
  };

  const features = [
    { icon: '📸', title: 'Image-based Reporting', text: 'Snap a photo and let AI categorize the issue automatically.' },
    { icon: '🤖', title: 'AI Categorization', text: 'Gemini-powered analysis detects category and severity instantly.' },
    { icon: '📍', title: 'Geo-Location Mapping', text: 'Every issue is pinned with precise GPS coordinates.' },
    { icon: '✅', title: 'Community Verification', text: 'Neighbors confirm issues, increasing report credibility.' },
    { icon: '📊', title: 'Real-Time Tracking', text: 'Track status from Open → Verified → In Progress → Resolved.' },
    { icon: '🏛️', title: 'Direct to Authorities', text: 'Auto-routes reports to the right municipal department.' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.nav}>
        <div style={styles.logo}>🏘️ Community Hero</div>
        <button style={styles.loginBtn} onClick={() => alert('Login coming soon!')}>Login</button>
      </div>

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>See It. Report It. Fix It.</h1>
        <p style={styles.heroSubtitle}>
          A hyperlocal platform that turns citizens into changemakers — report potholes,
          leaks, and broken infrastructure in seconds, and track them till resolved.
        </p>
        <button style={styles.ctaBtn} onClick={onGetStarted}>📤 Report an Issue</button>

        <div style={styles.statsBar}>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.totalIssues || issues.length}</div>
            <div style={styles.statLabel}>Issues Reported</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{resolvedCount}</div>
            <div style={styles.statLabel}>Issues Resolved</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.byCategory?.length || 0}</div>
            <div style={styles.statLabel}>Categories Tracked</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How Community Hero Helps</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureText}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.section, background: '#fafafe' }}>
        <h2 style={styles.sectionTitle}>Recently Resolved</h2>
        <div style={styles.resolvedGrid}>
          {recentResolved.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888' }}>No resolved issues yet — be the first to report one!</p>
          )}
          {recentResolved.map((issue) => (
            <div key={issue._id} style={styles.resolvedCard}>
              <div>
                <strong>{issue.category}</strong> — {issue.description}
                <div style={{ fontSize: '12px', color: '#888' }}>{issue.location?.address}</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', ...statusColor(issue.status) }}>
                ✅ Resolved
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>Built for the community, by the community. © 2026 Community Hero.</div>
    </div>
  );
}

// ---------------- REPORT PAGE ----------------
function ReportPage({ onBack, issues, refreshIssues }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  const [department, setDepartment] = useState(null);
  const [newIssueStatus, setNewIssueStatus] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus(`📍 ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => setLocationStatus('⚠️ Location permission denied — using default')
      );
    } else {
      setLocationStatus('⚠️ Geolocation not supported');
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !image) {
      setMessage('Please fill all fields!');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setDepartment(null);
    setNewIssueStatus(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageBase64 = reader.result.split(',')[1];

        const response = await fetch(`${API_BASE}/api/issues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            description,
            latitude: location ? location.lat : 25.3176,
            longitude: location ? location.lng : 82.9739,
            address: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Unknown location',
            userId: 'user123'
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessageType('success');
          setMessage('✅ Issue reported successfully!');
          const category = data.analysis?.category || data.issue?.category || 'Other';
          setDepartment(DEPARTMENTS[category] || DEPARTMENTS['Other']);
          setNewIssueStatus('open');
          setDescription('');
          setImage(null);
          setPreview(null);
          refreshIssues();
        } else {
          setMessageType('error');
          setMessage('❌ Error: ' + data.error);
        }
        setLoading(false);
      };
      reader.readAsDataURL(image);
    } catch (error) {
      setMessageType('error');
      setMessage('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await fetch(`${API_BASE}/api/issues/${id}/verify`, { method: 'POST' });
      refreshIssues();
    } catch (err) {}
  };

  const styles = {
    page: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh', padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    container: {
      maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
      padding: '30px 20px', textAlign: 'center', position: 'relative',
    },
    backBtn: {
      position: 'absolute', left: '20px', top: '20px', background: 'rgba(255,255,255,0.2)',
      border: 'none', color: 'white', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px',
    },
    title: { fontSize: '28px', margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', opacity: 0.9, margin: 0 },
    locationBar: { fontSize: '13px', opacity: 0.85, marginTop: '10px' },
    content: { padding: '40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontWeight: '600', color: '#333', fontSize: '14px' },
    input: { padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' },
    button: {
      padding: '14px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
      fontWeight: '600', cursor: 'pointer', marginTop: '10px',
    },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    preview: { maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    messageSuccess: {
      padding: '15px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px',
      color: '#155724', marginTop: '20px', textAlign: 'center', fontSize: '14px',
    },
    messageError: {
      padding: '15px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px',
      color: '#721c24', marginTop: '20px', textAlign: 'center', fontSize: '14px',
    },
    departmentBox: {
      padding: '18px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px',
      marginTop: '15px', fontSize: '14px', color: '#333',
    },
    deptTitle: { fontWeight: '700', marginBottom: '8px', color: '#4338ca' },
    historySection: { marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' },
    historyTitle: { fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: '#333' },
    historyItem: { padding: '12px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', marginRight: '8px' },
    verifyBtn: {
      marginTop: '6px', padding: '5px 12px', fontSize: '11px', borderRadius: '6px',
      border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4338ca', cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}>← Home</button>
          <h1 style={styles.title}>🏘️ Community Hero</h1>
          <p style={styles.subtitle}>Report local issues. Make a difference!</p>
          <p style={styles.locationBar}>{locationStatus}</p>
        </div>

        <div style={styles.content}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📝 Issue Description:</label>
              <input
                type="text"
                placeholder="Pothole, water leak, broken light..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📸 Upload Image:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={styles.input} />
              {preview && <img src={preview} alt="Preview" style={styles.preview} />}
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.button, ...(loading && styles.buttonDisabled) }}>
              {loading ? '⏳ Submitting...' : '📤 Report Issue'}
            </button>
          </form>

          {message && (
            <div style={messageType === 'success' ? styles.messageSuccess : styles.messageError}>{message}</div>
          )}

          {newIssueStatus && (
            <div>
              <StatusStepper status={newIssueStatus} />
            </div>
          )}

          {department && (
            <div style={styles.departmentBox}>
              <div style={styles.deptTitle}>📞 Reported to: {department.name}</div>
              <div>Phone: {department.phone}</div>
              <div>Email: {department.email}</div>
            </div>
          )}

          <div style={styles.historySection}>
            <div style={styles.historyTitle}>🗂️ Recent Reported Issues</div>
            {issues.length === 0 && <p style={{ fontSize: '13px', color: '#888' }}>No issues reported yet.</p>}
            {issues.slice(0, 10).map((issue) => (
              <div key={issue._id} style={styles.historyItem}>
                <span style={{ ...styles.badge, ...statusColor(issue.status) }}>{issue.status}</span>
                <strong>{issue.category}</strong> — {issue.description}
                <div style={{ color: '#888', marginTop: '4px' }}>{issue.location?.address || 'Unknown location'}</div>
                <StatusStepper status={issue.status} compact />
                <button style={styles.verifyBtn} onClick={() => handleVerify(issue._id)}>
                  👍 Verify ({issue.verifications || 0})
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;