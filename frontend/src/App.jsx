import { useCallback, useEffect, useState } from "react";
import "./index.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const API_URL = `${API_BASE_URL}/entries`;
const SUMMARY_URL = `${API_BASE_URL}/summary`;

function App() {
	const [entries, setEntries] = useState([]);
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [summary, setSummary] = useState(null);
	const [summaryLoading, setSummaryLoading] = useState(false);

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
	}, []);

	const fetchSummary = useCallback(async () => {
		setSummaryLoading(true);
		try {
			const res = await fetch(SUMMARY_URL);
			if (res.ok) {
				const data = await res.json();
				setSummary(data.summary);
			}
		} catch (err) {
			console.error("Failed to fetch summary:", err);
		}
		setSummaryLoading(false);
	}, []);

	useEffect(() => {
		fetchEntries();
		fetchSummary();
	}, [fetchEntries, fetchSummary]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name || !message) return;

		setLoading(true);
		try {
			const res = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, message }),
			});

			if (res.ok) {
				setName("");
				setMessage("");
				fetchEntries();
				fetchSummary();
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
					<h1>
						Cosmic <span className="text-gradient">Guestbook</span>
					</h1>
					<p>Leave your mark on the universe.</p>
				</header>

				<form onSubmit={handleSubmit} className="guestbook-form">
					<div className="input-group">
						<input
							type="text"
							placeholder="Commander Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="input-group">
						<textarea
							placeholder="Transmission message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							required
							rows={3}
						/>
					</div>
					<button type="submit" disabled={loading} className="glow-btn">
						{loading ? "Transmitting..." : "Send Transmission"}
					</button>
				</form>

				{summary && (
					<div className="summary-card">
						<h3>
							✨ Cosmic Summary{" "}
							<span className="ai-badge text-gradient">AI Generated</span>
						</h3>
						<p>{summaryLoading ? "Analyzing transmissions..." : summary}</p>
					</div>
				)}

				<div className="entries-container">
					{entries.map((entry) => (
						<div key={entry.id} className="entry-card">
							<div className="entry-header">
								<h3>{entry.name}</h3>
								<span className="timestamp">
									{new Date(entry.timestamp).toLocaleDateString()}
								</span>
							</div>
							<p className="entry-message">{entry.message}</p>
							{entry.aiReply && (
								<div className="ai-reply">
									<span className="ai-reply-label">🛸 Station Zenith AI</span>
									<p>{entry.aiReply}</p>
								</div>
							)}
						</div>
					))}
					{entries.length === 0 && (
						<p className="empty-state">Awaiting first transmission...</p>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
