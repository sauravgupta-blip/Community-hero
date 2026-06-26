import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/issues`
      );
      setIssues(response.data);
    } catch (error) {
      setIssues([
        {
          _id: '1',
          title: 'Pothole on MG Road',
          description: 'Large pothole causing traffic issues',
          category: 'Roads',
          status: 'Reported',
          severity: 'High',
          photo: 'https://via.placeholder.com/300x200?text=Pothole',
          reportedBy: { name: 'John Citizen', email: 'john@example.com' }
        },
        {
          _id: '2',
          title: 'Water Leak in Sector 5',
          description: 'Water pipe leaking near market',
          category: 'Water',
          status: 'In Progress',
          severity: 'Medium',
          photo: 'https://via.placeholder.com/300x200?text=Water+Leak',
          reportedBy: { name: 'Jane Smith', email: 'jane@example.com' }
        },
        {
          _id: '3',
          title: 'Broken Streetlight',
          description: 'Streetlight not working for 3 days',
          category: 'Streetlights',
          status: 'Reported',
          severity: 'Medium',
          photo: 'https://via.placeholder.com/300x200?text=Streetlight',
          reportedBy: { name: 'Mike Johnson', email: 'mike@example.com' }
        }
      ]);
    }
  };

  const handleUpdateStatus = (newStatus) => {
    if (selectedIssue) {
      const updated = {
        ...selectedIssue,
        status: newStatus,
        authorityFeedback: feedback,
        verifiedAt: new Date().toLocaleDateString()
      };
      setSelectedIssue(updated);
      setIssues(issues.map(i => i._id === selectedIssue._id ? updated : i));
      alert(`✅ Status updated to: ${newStatus}`);
      setFeedback('');
    }
  };

  const filteredIssues = filterStatus === 'all' 
    ? issues 
    : issues.filter(i => i.status === filterStatus);

  const getStatusColor = (status) => {
    const colors = {
      'Reported': '#ff6b6b',
      'In Progress': '#ffd93d',
      'Resolved': '#6bcf7f',
      'Closed': '#4d96ff'
    };
    return colors[status] || '#ddd';
  };

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
          <h3>{issues.filter(i => i.status === 'Reported').length}</h3>
          <p>Pending Review</p>
        </div>
        <div style={styles.statCard}>
          <h3>{issues.filter(i => i.status === 'In Progress').length}</h3>
          <p>In Progress</p>
        </div>
        <div style={styles.statCard}>
          <h3>{issues.filter(i => i.status === 'Resolved').length}</h3>
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
          <option value="Reported">Reported</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.issuesList}>
          <h3>📋 Issues</h3>
          <div style={styles.issuesContainer}>
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
                <h4>{issue.title}</h4>
                <p style={styles.category}>📍 {issue.category}</p>
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(issue.status)
                }}>
                  {issue.status}
                </span>
                <p style={styles.reporter}>👤 {issue.reportedBy?.name || 'Anonymous'}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedIssue && (
          <div style={styles.detailPanel}>
            <h3>✏️ Issue Details & Actions</h3>
            
            <img 
              src={selectedIssue.photo} 
              alt="Issue" 
              style={styles.photo} 
            />
            
            <div style={styles.detailContent}>
              <p><strong>Title:</strong> {selectedIssue.title}</p>
              <p><strong>Description:</strong> {selectedIssue.description}</p>
              <p><strong>Category:</strong> {selectedIssue.category}</p>
              <p><strong>Severity:</strong> {selectedIssue.severity}</p>
              <p><strong>Reporter:</strong> {selectedIssue.reportedBy?.name}</p>
              <p><strong>Email:</strong> {selectedIssue.reportedBy?.email}</p>
              <p>
                <strong>Current Status:</strong>{' '}
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(selectedIssue.status)
                }}>
                  {selectedIssue.status}
                </span>
              </p>
            </div>

            <div style={styles.actionsSection}>
              <h4>📌 Update Status</h4>
              
              <div style={styles.statusButtons}>
                {['Reported', 'In Progress', 'Resolved', 'Closed'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    style={{
                      ...styles.statusBtn,
                      background: getStatusColor(status),
                      fontWeight: selectedIssue.status === status ? 'bold' : 'normal'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <h4 style={{ marginTop: '20px' }}>💬 Send Feedback to Citizen</h4>
              <textarea
                placeholder="Type feedback message for the citizen..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={styles.textarea}
              />

              <button
                onClick={() => {
                  if (feedback.trim()) {
                    alert(`✅ Feedback sent to ${selectedIssue.reportedBy?.name}!\n\n"${feedback}"`);
                    setFeedback('');
                  } else {
                    alert('Please enter feedback');
                  }
                }}
                style={styles.sendBtn}
              >
                Send Feedback
              </button>

              {selectedIssue.authorityFeedback && (
                <div style={styles.feedbackBox}>
                  <strong>Last Feedback:</strong> {selectedIssue.authorityFeedback}
                </div>
              )}
            </div>
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
  photo: { width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' },
  detailContent: { background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  actionsSection: { background: 'white', padding: '15px', borderRadius: '8px' },
  statusButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' },
  statusBtn: { padding: '10px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'transform 0.2s' },
  textarea: { width: '100%', height: '100px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '10px', fontFamily: 'inherit', resize: 'none' },
  sendBtn: { width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s' },
  feedbackBox: { marginTop: '15px', padding: '10px', background: '#e8f5e9', borderLeft: '4px solid #6bcf7f', borderRadius: '5px', fontSize: '13px' }
};