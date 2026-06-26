import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

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

const SUGGESTIONS = [
  'Pothole on the road',
  'Pothole near intersection',
  'Water leak from pipe',
  'Water leak on road',
  'Broken streetlight',
  'Streetlight not working',
  'Garbage overflow',
  'Garbage not collected',
  'Damaged road surface',
  'Open manhole',
  'Sewage overflow',
  'Broken footpath',
  'Fallen tree blocking road',
  'Illegal dumping',
];

const SEVERITY_LEVELS = [
  { key: 'Low', color: '#16a34a', bg: '#dcfce7' },
  { key: 'Medium', color: '#ca8a04', bg: '#fef9c3' },
  { key: 'High', color: '#ea580c', bg: '#ffedd5' },
  { key: 'Urgent', color: '#dc2626', bg: '#fee2e2' },
];

const statusColor = (status) => {
  if (status === 'resolved') return { background: '#d4edda', color: '#155724' };
  if (status === 'verified') return { background: '#fff3cd', color: '#856404' };
  if (status === 'in-progress') return { background: '#cce5ff', color: '#004085' };
  return { background: '#e2e3e5', color: '#383d41' };
};

const severityStyle = (level) => {
  const found = SEVERITY_LEVELS.find(s => s.key === level);
  return found ? { background: found.bg, color: found.color } : { background: '#eee', color: '#555' };
};

function getStepIndex(status) {
  const idx = STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function mapLink(location) {
  if (!location || !location.lat || !location.lng) return null;
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
}

// ---------------- STATUS STEPPER ----------------
function StatusStepper({ status, compact }) {
  const currentIndex = getStepIndex(status);

  const styles = {
    wrapper: { display: 'flex', alignItems: 'center', margin: compact ? '10px 0' : '20px 0' },
    stepWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    circle: (done, current) => ({
      width: compact ? '16px' : '28px',
      height: compact ? '16px' : '28px',
      borderRadius: '50%',
      background: done ? '#4338ca' : '#e0e0e0',
      color: done ? 'white' : '#999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: compact ? '9px' : '13px',
      fontWeight: '700',
      border: current ? '2px solid #c7d2fe' : 'none',
      transition: 'all 0.3s',
    }),
    line: (done) => ({
      flex: 1,
      height: '2px',
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

export default function CitizenDashboard() {
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

  const reporterCounts = {};
  issues.forEach(i => {
    const user = i.createdBy || 'anonymous';
    reporterCounts[user] = (reporterCounts[user] || 0) + 1;
  });
  const topReporters = Object.entries(reporterCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topCategory = stats.byCategory && stats.byCategory.length > 0
    ? [...stats.byCategory].sort((a, b) => b.count - a.count)[0]
    : null;
  const totalForPercent = stats.byCategory ? stats.byCategory.reduce((sum, c) => sum + c.count, 0) : 0;
  const topCategoryPercent = topCategory && totalForPercent > 0
    ? Math.round((topCategory.count / totalForPercent) * 100)
    : 0;

  const maxCategoryCount = stats.byCategory && stats.byCategory.length > 0
    ? Math.max(...stats.byCategory.map(c => c.count))
    : 1;

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
      padding: '16px 20px', background: 'white', borderRadius: '10px',
      border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    },
    resolvedCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    beforeAfterRow: { display: 'flex', gap: '10px', marginTop: '12px' },
    beforeAfterImg: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' },
    beforeAfterLabel: { fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '4px', fontWeight: '600' },
    footer: { background: '#1a1a2e', color: '#aaa', textAlign: 'center', padding: '30px', fontSize: '13px' },

    dashboardGrid: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px' },
    dashboardCard: {
      background: 'white', borderRadius: '14px', padding: '28px',
      border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    },
    cardTitle: { fontWeight: '700', fontSize: '16px', marginBottom: '18px', color: '#333' },
    barRow: { marginBottom: '14px' },
    barLabel: { fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' },
    barTrack: { background: '#eee', borderRadius: '6px', height: '10px', overflow: 'hidden' },
    barFill: (pct) => ({ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '6px' }),
    insightBox: {
      background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px',
      padding: '16px', fontSize: '13px', color: '#9a3412', marginTop: '10px',
    },
    leaderRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px',
    },
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
        <h2 style={styles.sectionTitle}>📊 Impact Dashboard</h2>
        <div style={styles.dashboardGrid}>
          <div style={styles.dashboardCard}>
            <div style={styles.cardTitle}>Issues by Category</div>
            {(!stats.byCategory || stats.byCategory.length === 0) && (
              <p style={{ fontSize: '13px', color: '#888' }}>No data yet.</p>
            )}
            {stats.byCategory && stats.byCategory.map((c) => (
              <div key={c._id} style={styles.barRow}>
                <div style={styles.barLabel}>
                  <span>{c._id || 'Other'}</span>
                  <span>{c.count}</span>
                </div>
                <div style={styles.barTrack}>
                  <div style={styles.barFill((c.count / maxCategoryCount) * 100)} />
                </div>
              </div>
            ))}

            {topCategory && (
              <div style={styles.insightBox}>
                📈 <strong>Predictive Insight:</strong> "{topCategory._id}" makes up {topCategoryPercent}% of all
                reports — this is the highest-priority issue type. Authorities may want to allocate
                resources here first.
              </div>
            )}
          </div>

          <div style={styles.dashboardCard}>
            <div style={styles.cardTitle}>🏆 Top Community Heroes</div>
            {topReporters.length === 0 && <p style={{ fontSize: '13px', color: '#888' }}>No reporters yet.</p>}
            {topReporters.map(([user, count], i) => (
              <div key={user} style={styles.leaderRow}>
                <span>{['🥇', '🥈', '🥉'][i]} {user}</span>
                <strong>{count} report{count > 1 ? 's' : ''}</strong>
              </div>
            ))}
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
              <div style={styles.resolvedCardTop}>
                <div>
                  <strong>{issue.category}</strong> — {issue.description}
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {issue.location?.address} • {formatDate(issue.createdAt)}
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', ...statusColor(issue.status) }}>
                  ✅ Resolved
                </span>
              </div>
              {issue.images && issue.images[0] && issue.afterImage && (
                <div style={styles.beforeAfterRow}>
                  <div style={{ flex: 1 }}>
                    <img src={`data:image/jpeg;base64,${issue.images[0]}`} alt="Before" style={styles.beforeAfterImg} />
                    <div style={styles.beforeAfterLabel}>BEFORE</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <img src={`data:image/jpeg;base64,${issue.afterImage}`} alt="After" style={styles.beforeAfterImg} />
                    <div style={styles.beforeAfterLabel}>AFTER</div>
                  </div>
                </div>
              )}
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  const [department, setDepartment] = useState(null);
  const [newIssueStatus, setNewIssueStatus] = useState(null);
  const [userSeverity, setUserSeverity] = useState('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [votedIssues, setVotedIssues] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  const filteredSuggestions = description.length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(description.toLowerCase())).slice(0, 5)
    : [];

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
            userId: 'user123',
            userSeverity,
            isAnonymous
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessageType('success');
          if (data.duplicate) {
            setMessage('⚠️ This issue was already reported nearby! Your report has been added as a verification on the existing issue.');
          } else {
            setMessage('✅ Issue reported successfully!');
          }
          const category = data.analysis?.category || data.issue?.category || 'Other';
          setDepartment(DEPARTMENTS[category] || DEPARTMENTS['Other']);
          setNewIssueStatus('open');
          setDescription('');
          setImage(null);
          setPreview(null);
          setUserSeverity('Medium');
          setIsAnonymous(false);
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

  const handleAdvanceStatus = async (id, newStatus, afterImage) => {
    try {
      await fetch(`${API_BASE}/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, afterImage })
      });
      refreshIssues();
    } catch (err) {}
  };

  const handleResolveWithPhoto = (id, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const afterImageBase64 = reader.result.split(',')[1];
      handleAdvanceStatus(id, 'resolved', afterImageBase64);
      setResolvingId(null);
    };
    reader.readAsDataURL(file);
  };

  // Toggle voting: click again to undo, switching types removes the old vote
  const handleVote = async (id, type) => {
    const current = votedIssues[id];
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (current === type) {
      if (type === 'upvote') upvoteDelta = -1;
      else downvoteDelta = -1;
      setVotedIssues(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    } else {
      if (current === 'upvote') upvoteDelta -= 1;
      if (current === 'downvote') downvoteDelta -= 1;
      if (type === 'upvote') upvoteDelta += 1;
      else downvoteDelta += 1;
      setVotedIssues(prev => ({ ...prev, [id]: type }));
    }

    try {
      await fetch(`${API_BASE}/api/issues/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upvoteDelta, downvoteDelta })
      });
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
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' },
    label: { fontWeight: '600', color: '#333', fontSize: '14px' },
    input: { padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' },
    suggestionBox: {
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px',
      marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20,
      maxHeight: '180px', overflowY: 'auto',
    },
    suggestionItem: {
      padding: '10px 15px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
    },
    severityRow: { display: 'flex', gap: '8px' },
    severityBtn: (level, active) => {
      const s = SEVERITY_LEVELS.find(x => x.key === level);
      return {
        flex: 1, padding: '10px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
        cursor: 'pointer', textAlign: 'center',
        border: active ? `2px solid ${s.color}` : '2px solid #e0e0e0',
        background: active ? s.bg : 'white',
        color: active ? s.color : '#888',
      };
    },
    toggleRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '8px',
    },
    toggleSwitch: (active) => ({
      width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
      background: active ? '#4338ca' : '#ccc', position: 'relative', transition: 'background 0.2s',
    }),
    toggleKnob: (active) => ({
      width: '18px', height: '18px', borderRadius: '50%', background: 'white',
      position: 'absolute', top: '3px', left: active ? '23px' : '3px', transition: 'left 0.2s',
    }),
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
    historyTitle: { fontWeight: '700', fontSize: '16px', marginBottom: '14px', color: '#333' },

    card: {
      border: '1px solid #eee', borderRadius: '10px', marginBottom: '14px',
      overflow: 'hidden', fontSize: '13px',
    },
    cardTop: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '12px 14px 0 14px',
    },
    badgeGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    badge: { padding: '2px 9px', borderRadius: '10px', fontSize: '10px', fontWeight: '700' },
    dateText: { fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' },
    cardBody: { padding: '8px 14px 4px 14px' },
    cardTitleLine: { fontSize: '14px', color: '#222' },
    cardLocation: { fontSize: '12px', color: '#888', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' },
    mapIconLink: { color: '#854d0e', textDecoration: 'none', fontSize: '12px' },
    stepperWrap: { padding: '0 14px' },
    cardFooter: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: '#fafafa', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px',
    },
    voteGroup: { display: 'flex', gap: '6px' },
    voteBtn: (active) => ({
      padding: '4px 10px', fontSize: '12px', borderRadius: '6px', fontWeight: '600',
      border: active ? '1px solid #4338ca' : '1px solid #ddd',
      background: active ? '#eef2ff' : 'white', color: active ? '#4338ca' : '#555',
      cursor: 'pointer',
    }),
    verifyBtn: {
      padding: '4px 10px', fontSize: '12px', borderRadius: '6px', fontWeight: '600',
      border: '1px solid #c7d2fe', background: 'white', color: '#4338ca', cursor: 'pointer',
    },
    adminGroup: { display: 'flex', gap: '6px' },
    progressBtn: {
      padding: '4px 10px', fontSize: '11px', borderRadius: '6px', fontWeight: '600',
      border: '1px solid #93c5fd', background: 'white', color: '#1e40af', cursor: 'pointer',
    },
    resolveBtn: {
      padding: '4px 10px', fontSize: '11px', borderRadius: '6px', fontWeight: '600',
      border: '1px solid #6ee7b7', background: 'white', color: '#065f46', cursor: 'pointer',
    },
    resolveUploadBox: {
      padding: '10px 14px', background: '#f0fdf4', borderTop: '1px solid #d1fae5',
    },
    resolveUploadLabel: { fontSize: '12px', fontWeight: '600', color: '#065f46', marginBottom: '6px', display: 'block' },
    cancelLink: { fontSize: '11px', color: '#888', cursor: 'pointer', marginLeft: '8px' },
    beforeAfterRow: { display: 'flex', gap: '8px', padding: '0 14px 10px 14px' },
    beforeAfterImg: { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' },
    beforeAfterLabel: { fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '3px', fontWeight: '600' },
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
                onChange={(e) => { setDescription(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                style={styles.input}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={styles.suggestionBox}>
                  {filteredSuggestions.map((s, i) => (
                    <div
                      key={i}
                      style={styles.suggestionItem}
                      onClick={() => { setDescription(s); setShowSuggestions(false); }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🚨 How urgent is this?</label>
              <div style={styles.severityRow}>
                {SEVERITY_LEVELS.map((s) => (
                  <div
                    key={s.key}
                    style={styles.severityBtn(s.key, userSeverity === s.key)}
                    onClick={() => setUserSeverity(s.key)}
                  >
                    {s.key}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <div style={styles.toggleRow}>
                <label style={styles.label}>🕶️ Report Anonymously</label>
                <div style={styles.toggleSwitch(isAnonymous)} onClick={() => setIsAnonymous(!isAnonymous)}>
                  <div style={styles.toggleKnob(isAnonymous)} />
                </div>
              </div>
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

          {newIssueStatus && <StatusStepper status={newIssueStatus} />}

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
            {issues.slice(0, 10).map((issue) => {
              const link = mapLink(issue.location);
              const voted = votedIssues[issue._id];
              return (
                <div key={issue._id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.badgeGroup}>
                      <span style={{ ...styles.badge, ...statusColor(issue.status) }}>{issue.status}</span>
                      {issue.userSeverity && (
                        <span style={{ ...styles.badge, ...severityStyle(issue.userSeverity) }}>{issue.userSeverity}</span>
                      )}
                    </div>
                    <span style={styles.dateText}>{formatDate(issue.createdAt)}</span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardTitleLine}>
                      <strong>{issue.category}</strong> — {issue.description}
                      {issue.isAnonymous && <span style={{ color: '#aaa', fontStyle: 'italic' }}> · Anonymous</span>}
                    </div>
                    <div style={styles.cardLocation}>
                      <span>{issue.location?.address || 'Unknown location'}</span>
                      {link && <a href={link} target="_blank" rel="noopener noreferrer" style={styles.mapIconLink}>📍 Map</a>}
                    </div>
                  </div>

                  <div style={styles.stepperWrap}>
                    <StatusStepper status={issue.status} compact />
                  </div>

                  {issue.status === 'resolved' && issue.images && issue.images[0] && issue.afterImage && (
                    <div style={styles.beforeAfterRow}>
                      <div style={{ flex: 1 }}>
                        <img src={`data:image/jpeg;base64,${issue.images[0]}`} alt="Before" style={styles.beforeAfterImg} />
                        <div style={styles.beforeAfterLabel}>BEFORE</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <img src={`data:image/jpeg;base64,${issue.afterImage}`} alt="After" style={styles.beforeAfterImg} />
                        <div style={styles.beforeAfterLabel}>AFTER</div>
                      </div>
                    </div>
                  )}

                  <div style={styles.cardFooter}>
                    <div style={styles.voteGroup}>
                      <button style={styles.voteBtn(voted === 'upvote')} onClick={() => handleVote(issue._id, 'upvote')}>
                        👍 {issue.upvotes || 0}
                      </button>
                      <button style={styles.voteBtn(voted === 'downvote')} onClick={() => handleVote(issue._id, 'downvote')}>
                        👎 {issue.downvotes || 0}
                      </button>
                      <button style={styles.verifyBtn} onClick={() => handleVerify(issue._id)}>
                        ✅ {issue.verifications || 0}
                      </button>
                    </div>

                    {issue.status !== 'resolved' && (
                      <div style={styles.adminGroup}>
                        <button style={styles.progressBtn} onClick={() => handleAdvanceStatus(issue._id, 'in-progress')}>
                          In Progress
                        </button>
                        <button style={styles.resolveBtn} onClick={() => setResolvingId(issue._id)}>
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>

                  {resolvingId === issue._id && (
                    <div style={styles.resolveUploadBox}>
                      <label style={styles.resolveUploadLabel}>
                        📸 Upload an "after" photo to confirm resolution:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleResolveWithPhoto(issue._id, e.target.files[0])}
                      />
                      <span style={styles.cancelLink} onClick={() => setResolvingId(null)}>Cancel</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

