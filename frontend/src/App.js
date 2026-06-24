import React, { useState, useEffect } from 'react';

const DEPARTMENTS = {
  'Pothole': { name: 'PWD (Public Works Department)', phone: '1800-XXX-XXXX', email: 'pwd@municipal.gov.in' },
  'Water Leak': { name: 'Water Supply Board', phone: '1800-XXX-XXXX', email: 'water@municipal.gov.in' },
  'Broken Light': { name: 'Electricity Department', phone: '1800-XXX-XXXX', email: 'electricity@municipal.gov.in' },
  'Garbage': { name: 'Sanitation Department', phone: '1800-XXX-XXXX', email: 'sanitation@municipal.gov.in' },
  'Damaged Road': { name: 'PWD (Public Works Department)', phone: '1800-XXX-XXXX', email: 'pwd@municipal.gov.in' },
  'Other': { name: 'General Municipal Helpline', phone: '1800-XXX-XXXX', email: 'helpdesk@municipal.gov.in' },
};

function App() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  const [department, setDepartment] = useState(null);
  const [issues, setIssues] = useState([]);

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
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch('https://community-hero-production.up.railway.app/api/issues');
      const data = await res.json();
      if (data.success) setIssues(data.issues.slice(0, 10));
    } catch (err) {
      console.log('Could not load issues list');
    }
  };

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
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageBase64 = reader.result.split(',')[1];

        const response = await fetch('https://community-hero-production.up.railway.app/api/issues', {
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
          setDescription('');
          setImage(null);
          setPreview(null);
          fetchIssues();
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

  const styles = {
    page: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      overflow: 'hidden',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px 20px',
      textAlign: 'center',
    },
    title: { fontSize: '32px', margin: '0 0 10px 0' },
    subtitle: { fontSize: '16px', opacity: 0.9, margin: 0 },
    locationBar: {
      fontSize: '13px',
      opacity: 0.85,
      marginTop: '10px',
    },
    content: { padding: '40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontWeight: '600', color: '#333', fontSize: '14px' },
    input: {
      padding: '12px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    button: {
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
    },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    preview: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      marginTop: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    messageSuccess: {
      padding: '15px',
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '8px',
      color: '#155724',
      marginTop: '20px',
      textAlign: 'center',
      fontSize: '14px',
    },
    messageError: {
      padding: '15px',
      background: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '8px',
      color: '#721c24',
      marginTop: '20px',
      textAlign: 'center',
      fontSize: '14px',
    },
    departmentBox: {
      padding: '18px',
      background: '#eef2ff',
      border: '1px solid #c7d2fe',
      borderRadius: '8px',
      marginTop: '15px',
      fontSize: '14px',
      color: '#333',
    },
    deptTitle: { fontWeight: '700', marginBottom: '8px', color: '#4338ca' },
    historySection: { marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' },
    historyTitle: { fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: '#333' },
    historyItem: {
      padding: '12px',
      border: '1px solid #eee',
      borderRadius: '8px',
      marginBottom: '8px',
      fontSize: '13px',
    },
    badge: {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      marginRight: '8px',
    },
  };

  const statusColor = (status) => {
    if (status === 'resolved') return { background: '#d4edda', color: '#155724' };
    if (status === 'verified') return { background: '#fff3cd', color: '#856404' };
    if (status === 'in-progress') return { background: '#cce5ff', color: '#004085' };
    return { background: '#e2e3e5', color: '#383d41' };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.input}
              />
              {preview && <img src={preview} alt="Preview" style={styles.preview} />}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.button, ...(loading && styles.buttonDisabled) }}
            >
              {loading ? '⏳ Submitting...' : '📤 Report Issue'}
            </button>
          </form>

          {message && (
            <div style={messageType === 'success' ? styles.messageSuccess : styles.messageError}>
              {message}
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
            {issues.map((issue) => (
              <div key={issue._id} style={styles.historyItem}>
                <span style={{ ...styles.badge, ...statusColor(issue.status) }}>{issue.status}</span>
                <strong>{issue.category}</strong> — {issue.description}
                <div style={{ color: '#888', marginTop: '4px' }}>
                  {issue.location?.address || 'Unknown location'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;