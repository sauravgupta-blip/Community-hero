import React, { useState, useEffect } from 'react';

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
    }),
    line: (done) => ({
      flex: 1,
      height: '2px',
      background: done ? '#4338ca' : '#e0e0e0',
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

export default function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/issues`);
      const data = await res.json();
      if (data.success) setIssues(data.issues);
    } catch (err) {}
  };

  const handleAdvanceStatus = async (id, newStatus, afterImage) => {
    try {
      await fetch(`${API_BASE}/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, afterImage })
      });
      fetchIssues();
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

  const filteredIssues = filterStatus === 'all'
    ? issues
    : issues.filter(i => i.status === filterStatus);

  const styles = {
    page: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh', padding: '30px 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    container: { maxWidth: '900px', margin: '0 auto' },
    header: { color: 'white', textAlign: 'center', marginBottom: '30px' },
    headerTitle: { fontSize: '32px', fontWeight: '800', margin: '0 0 6px 0' },
    headerSub: { fontSize: '14px', opacity: 0.9 },
    statsRow: { display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' },
    statCard: {
      flex: 1, minWidth: '120px', background: 'white', borderRadius: '12px',
      padding: '18px', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    },
    statNum: { fontSize: '26px', fontWeight: '800', color: '#4338ca' },
    statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
    filterRow: { marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterBtn: (active) => ({
      padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
      border: active ? '2px solid white' : '2px solid rgba(255,255,255,0.4)',
      background: active ? 'white' : 'transparent',
      color: active ? '#4338ca' : 'white', cursor: 'pointer',
    }),
    card: {
      border: '1px solid #eee', borderRadius: '12px', marginBottom: '16px',
      overflow: 'hidden', fontSize: '13px', background: 'white',
      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    },
    cardTop: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '14px 16px 0 16px',
    },
    badgeGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    badge: { padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' },
    dateText: { fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' },
    cardBody: { padding: '10px 16px 4px 16px' },
    cardTitleLine: { fontSize: '15px', color: '#222' },
    cardLocation: { fontSize: '12px', color: '#888', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' },
    mapIconLink: { color: '#854d0e', textDecoration: 'none', fontSize: '12px' },
    stepperWrap: { padding: '0 16px' },
    cardImage: { width: '100%', maxHeight: '220px', objectFit: 'cover' },
    cardFooter: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px',
    },
    voteInfo: { fontSize: '12px', color: '#888' },
    adminGroup: { display: 'flex', gap: '8px' },
    progressBtn: {
      padding: '6px 14px', fontSize: '12px', borderRadius: '6px', fontWeight: '600',
      border: '1px solid #93c5fd', background: 'white', color: '#1e40af', cursor: 'pointer',
    },
    resolveBtn: {
      padding: '6px 14px', fontSize: '12px', borderRadius: '6px', fontWeight: '600',
      border: '1px solid #6ee7b7', background: 'white', color: '#065f46', cursor: 'pointer',
    },
    resolveUploadBox: {
      padding: '12px 16px', background: '#f0fdf4', borderTop: '1px solid #d1fae5',
    },
    resolveUploadLabel: { fontSize: '12px', fontWeight: '600', color: '#065f46', marginBottom: '6px', display: 'block' },
    cancelLink: { fontSize: '11px', color: '#888', cursor: 'pointer', marginLeft: '10px' },
    beforeAfterRow: { display: 'flex', gap: '8px', padding: '0 16px 12px 16px' },
    beforeAfterImg: { width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' },
    beforeAfterLabel: { fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '3px', fontWeight: '600' },
    resolvedNote: { padding: '10px 16px', fontSize: '12px', color: '#065f46', background: '#f0fdf4' },
    emptyText: { color: 'white', textAlign: 'center', padding: '40px', opacity: 0.8 },
  };

  const totalCount = issues.length;
  const openCount = issues.filter(i => i.status === 'open' || i.status === 'verified').length;
  const progressCount = issues.filter(i => i.status === 'in-progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>🏛️ Authority Control Panel</h1>
          <p style={styles.headerSub}>Manage and resolve civic issues reported by citizens</p>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{totalCount}</div>
            <div style={styles.statLabel}>Total Issues</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{openCount}</div>
            <div style={styles.statLabel}>Pending Review</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{progressCount}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{resolvedCount}</div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
        </div>

        <div style={styles.filterRow}>
          {['all', 'open', 'verified', 'in-progress', 'resolved'].map((f) => (
            <button
              key={f}
              style={styles.filterBtn(filterStatus === f)}
              onClick={() => setFilterStatus(f)}
            >
              {f === 'all' ? 'All Issues' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div style={styles.emptyText}>No issues found for this filter.</div>
        )}

        {filteredIssues.map((issue) => {
          const link = mapLink(issue.location);
          return (
            <div key={issue._id} style={styles.card}>
              {issue.images && issue.images[0] && (
                <img
                  src={`data:image/jpeg;base64,${issue.images[0]}`}
                  alt="Issue"
                  style={styles.cardImage}
                />
              )}

              <div style={styles.cardTop}>
                <div style={styles.badgeGroup}>
                  <span style={{ ...styles.badge, ...statusColor(issue.status) }}>{issue.status}</span>
                  {issue.userSeverity && (
                    <span style={{ ...styles.badge, background: '#fef3c7', color: '#92400e' }}>
                      {issue.userSeverity}
                    </span>
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
                <div style={styles.voteInfo}>
                  👍 {issue.upvotes || 0} &nbsp; 👎 {issue.downvotes || 0} &nbsp; ✅ {issue.verifications || 0} verified
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

              {issue.status === 'resolved' && (
                <div style={styles.resolvedNote}>✅ This issue has been resolved.</div>
              )}

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
  );
}