import { useState, useEffect, useCallback } from 'react'
import './index.css'

function App() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Since we don't know the exact Cloud Run URL yet, we use a relative path if deployed,
  // or localhost if running locally. For this demo, let's just make it relative so it 
  // works if served together, but since it's Cloud Storage + Cloud Run, it needs the full URL.
  // We'll set a default that the user can change later, or we assume it's running locally for now.
  const API_URL = import.meta.env.VITE_API_URL || '/api/entries';

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) return;
    
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      
      if (res.ok) {
        setName('');
        setMessage('');
        fetchEntries();
      }
    } catch (err) {
      console.error("Failed to post entry:", err);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <main className="glass-panel">
        <header>
          <h1>Cosmic <span>Guestbook</span></h1>
          <p>Leave your mark on the universe.</p>
        </header>

        <form onSubmit={handleSubmit} className="guestbook-form">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Commander Name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <textarea 
              placeholder="Transmission message..." 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              required
              rows={3}
            />
          </div>
          <button type="submit" disabled={loading} className="glow-btn">
            {loading ? 'Transmitting...' : 'Send Transmission'}
          </button>
        </form>

        <div className="entries-container">
          {entries.map(entry => (
            <div key={entry.id} className="entry-card">
              <div className="entry-header">
                <h3>{entry.name}</h3>
                <span className="timestamp">{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="entry-message">{entry.message}</p>
            </div>
          ))}
          {entries.length === 0 && <p className="empty-state">Awaiting first transmission...</p>}
        </div>
      </main>
    </div>
  )
}

export default App
