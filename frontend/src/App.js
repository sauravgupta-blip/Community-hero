import React, { useState } from 'react';

function App() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
            latitude: 25.3176,
            longitude: 82.9739,
            userId: 'user123'
          })
        });

        const data = await response.json();
        if (data.success) {
          setMessageType('success');
          setMessage('✅ Issue reported successfully!');
          setDescription('');
          setImage(null);
          setPreview(null);
        } else {
          setMessageType('error');
          setMessage('❌ Error: ' + data.error);
        }
      };
      reader.readAsDataURL(image);
    } catch (error) {
      setMessageType('error');
      setMessage('❌ Error: ' + error.message);
    } finally {
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
    title: {
      fontSize: '32px',
      margin: '0 0 10px 0',
    },
    subtitle: {
      fontSize: '16px',
      opacity: 0.9,
      margin: 0,
    },
    content: {
      padding: '40px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontWeight: '600',
      color: '#333',
      fontSize: '14px',
    },
    input: {
      padding: '12px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.3s',
      fontFamily: 'inherit',
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
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
      transition: 'all 0.3s',
      marginTop: '10px',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
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
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏘️ Community Hero</h1>
          <p style={styles.subtitle}>Report local issues. Make a difference!</p>
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
              style={{
                ...styles.button,
                ...(loading && styles.buttonDisabled)
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
            >
              {loading ? '⏳ Submitting...' : '📤 Report Issue'}
            </button>
          </form>

          {message && (
            <div style={messageType === 'success' ? styles.messageSuccess : styles.messageError}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;