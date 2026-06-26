import React, { useState, useEffect } from 'react';

const API_BASE = 'https://community-hero-production.up.railway.app';

const getStatusColor = (status) => {
  const colors = {
    'open': '#ff6b6b',
    'verified': '#ffd93d',
    'in-progress': '#4d96ff',
    'resolved': '#6bcf7f',
  };
  return colors[status] || '#ddd';
};

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

export default function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [resolvePhoto, setResolvePhoto] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/issues`);
      const data = await res.json();
      if (data.success) {
        setIssues(data.issues);
        if (selectedIssue) {
          const updated = data.issues.find(i => i._id === selectedIssue._id);
          if (updated) setSelectedIssue(updated);
        }
      }
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
      setResolvePhoto(null);
    };
    reader.readAsDataURL(file);
  };

  const filteredIssues = filterStatus === 'all'
    ? issues
    : issues.filter(i => i.status === filterStatus);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🏛️ Authority Control Panel</h2>
        <p>Manage and resolve civic issues</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{issues.length}</h3>
          <p>Total Issues</p>
        </div>
        <div style={styles.statCard}>
          <h3>{issues.filter(i => i.status === 'open' || i.status === 'verified').length}</h3>
          <p>Pending Review</p>
        </div>
        <div style={styles.statCard}>
          <h3>{issues.filter(i => i.status === 'in-progress').length}</h3>
          <p>In Progress</p>
        </div>
        <div style={styles.statCard}>
          <h3>{issues.filter(i => i.status === 'resolved').length}</h3>
          <p>Resolved</p>
        </div>
      </div>

      <div style={styles.filterContainer}>
        <label>Filter by Status: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Issues</option>
          <option value="open">Open</option>
          <option value="verified">Verified</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.issuesList}>
          <h3>📋 Issues ({filteredIssues.length})</h3>
          <div style={styles.issuesContainer}>
            {filteredIssues.length === 0 && (
              <p style={{ fontSize: '13px', color: '#888' }}>No issues found.</p>
            )}
            {filteredIssues.map((issue) => (
              <div
                key={issue._id}
                style={{
                  ...styles.issueCard,
                  borderLeft: `4px solid ${getStatusColor(issue.status)}`,
                  background: selectedIssue?._id === issue._id ? '#f0f4ff' : 'white'
                }}
                onClick={() => setSelectedIssue(issue)}
              >
                <h4 style={{ margin: '0 0 6px 0' }}>{issue.category}</h4>
                <p style={styles.category}>📍 {issue.description}</p>
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(issue.status)
                }}>
                  {issue.status}
                </span>
                <p style={styles.reporter}>
                  👍 {issue.upvotes || 0} &nbsp; 👎 {issue.downvotes || 0} &nbsp; ✅ {issue.verifications || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedIssue && (
          <div style={styles.detailPanel}>
            <h3>✏️ Issue Details & Actions</h3>

            {/* SIDE BY SIDE: Image left, Info right */}
            <div style={styles.splitRow}>
              <div style={styles.splitImageCol}>
                {selectedIssue.images && selectedIssue.images[0] ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedIssue.images[0]}`}
                    alt="Issue"
                    style={styles.splitPhoto}
                  />
                ) : (
                  <div style={styles.noPhoto}>No photo</div>
                )}
              </div>

              <div style={styles.splitInfoCol}>
                <p><strong>Category:</strong> {selectedIssue.category}</p>
                <p><strong>Description:</strong> {selectedIssue.description}</p>
                <p><strong>Severity:</strong> {selectedIssue.userSeverity || 'Not set'}</p>
                <p><strong>Reported:</strong> {formatDate(selectedIssue.createdAt)}</p>
                <p><strong>Reporter:</strong> {selectedIssue.isAnonymous ? 'Anonymous' : (selectedIssue.createdBy || 'Unknown')}</p>
                <p>
                  <strong>Location:</strong> {selectedIssue.location?.address || 'Unknown'}
                  {mapLink(selectedIssue.location) && (
                    <a href={mapLink(selectedIssue.location)} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px' }}>
                      📍 Map
                    </a>
                  )}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    ...styles.statusBadge,
                    background: getStatusColor(selectedIssue.status)
                  }}>
                    {selectedIssue.status}
                  </span>
                </p>
              </div>
            </div>

            <div style={styles.voteSummary}>
              <span style={styles.voteItem}>👍 {selectedIssue.upvotes || 0} Upvotes</span>
              <span style={styles.voteItem}>👎 {selectedIssue.downvotes || 0} Downvotes</span>
              <span style={styles.voteItem}>✅ {selectedIssue.verifications || 0} Verified</span>
            </div>

            {selectedIssue.status === 'resolved' && selectedIssue.images?.[0] && selectedIssue.afterImage && (
              <div style={styles.beforeAfterRow}>
                <div style={{ flex: 1 }}>
                  <img src={`data:image/jpeg;base64,${selectedIssue.images[0]}`} alt="Before" style={styles.beforeAfterImg} />
                  <div style={styles.beforeAfterLabel}>BEFORE</div>
                </div>
                <div style={{ flex: 1 }}>
                  <img src={`data:image/jpeg;base64,${selectedIssue.afterImage}`} alt="After" style={styles.beforeAfterImg} />
                  <div style={styles.beforeAfterLabel}>AFTER</div>
                </div>
              </div>
            )}

            {selectedIssue.status !== 'resolved' && (
              <div style={styles.actionsSection}>
                <h4>📌 Update Status</h4>
                <div style={styles.statusButtons}>
                  <button
                    onClick={() => handleAdvanceStatus(selectedIssue._id, 'in-progress')}
                    style={{ ...styles.statusBtn, background: getStatusColor('in-progress') }}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setResolvePhoto(selectedIssue._id)}
                    style={{ ...styles.statusBtn, background: getStatusColor('resolved') }}
                  >
                    Resolve
                  </button>
                </div>

                {resolvePhoto === selectedIssue._id && (
                  <div style={styles.resolveBox}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#065f46', display: 'block', marginBottom: '8px' }}>
                      📸 Upload an "after" photo to confirm resolution:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleResolveWithPhoto(selectedIssue._id, e.target.files[0])}
                    />
                    <span
                      style={{ fontSize: '11px', color: '#888', cursor: 'pointer', marginLeft: '10px' }}
                      onClick={() => setResolvePhoto(null)}
                    >
                      Cancel
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedIssue.status === 'resolved' && (
              <div style={styles.resolvedNote}>✅ This issue has been resolved.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  header: { marginBottom: '30px', borderBottom: '2px solid #667eea', paddingBottom: '15px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' },
  statCard: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' },
  filterContainer: { marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' },
  select: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  issuesList: { background: '#f9f9f9', padding: '20px', borderRadius: '10px' },
  issuesContainer: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' },
  issueCard: { background: 'white', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid #eee' },
  category: { fontSize: '12px', color: '#666', margin: '8px 0' },
  statusBadge: { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
  reporter: { fontSize: '12px', color: '#999', marginTop: '8px' },
  detailPanel: { background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '2px solid #667eea' },

  splitRow: { display: 'flex', gap: '16px', marginBottom: '16px' },
  splitImageCol: { flex: '0 0 40%' },
  splitInfoCol: { flex: 1, background: 'white', padding: '14px', borderRadius: '8px', fontSize: '13px' },
  splitPhoto: { width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' },
  noPhoto: { width: '100%', height: '180px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' },

  voteSummary: { display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' },
  voteItem: { fontSize: '12px', fontWeight: '600', color: '#4338ca', background: '#eef2ff', padding: '4px 10px', borderRadius: '12px' },
  actionsSection: { background: 'white', padding: '15px', borderRadius: '8px' },
  statusButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' },
  statusBtn: { padding: '10px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  resolveBox: { marginTop: '10px', padding: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #d1fae5' },
  resolvedNote: { padding: '12px 15px', fontSize: '13px', color: '#065f46', background: '#f0fdf4', borderRadius: '8px', marginTop: '10px' },
  beforeAfterRow: { display: 'flex', gap: '8px', marginBottom: '15px' },
  beforeAfterImg: { width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' },
  beforeAfterLabel: { fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '3px', fontWeight: '600' },
};