import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/sessionsList.css";

type Attendee = {
  name: string;
  attendanceCode: string;
};

type Session = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  maxParticipants?: number;
  type?: "public" | "private";
  attendees?: Attendee[];
};

const API = "http://localhost:4000";

export default function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/sessions`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSuggest = async () => {
    try {
      const res = await fetch(`${API}/api/ai/suggest`);
      const data = await res.json();
      if (data.suggestion) {
        alert(`${data.suggestion.title}\n\n${data.suggestion.description}`);
      } else {
        alert("No suggestion available");
      }
    } catch {
      alert("Suggestion failed");
    }
  };

  if (loading) return <div className="sessions-list-container"><p>Loading...</p></div>;

  return (
    <div className="sessions-list-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Public Sessions</h2>
        <button className="btn" onClick={handleSuggest}>Suggest Session</button>
      </div>
      {sessions.length === 0 && <p>No public sessions yet.</p>}
      <div className="sessions-grid">
        {sessions.map((s) => (
          <div className="session-card" key={s._id}>
            <h3>{s.title}</h3>
            <p className="muted">{s.description || "No description"}</p>
            <p>{s.date} {s.time}</p>
            <p>Attending: {(s.attendees || []).length}{s.maxParticipants ? ` / ${s.maxParticipants}` : ""}</p>
            <Link to={`/sessions/${s._id}`} className="card-btn">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}