import { useEffect, useMemo, useState } from "react";
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
  date?: string; // ISO yyyy-mm-dd expected
  time?: string;
  maxParticipants?: number;
  type?: "public" | "private";
  attendees?: Attendee[];
};

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range filters (optional)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

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

  // helper to parse date string to Date (00:00)
  const parseDate = (d?: string) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  };

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const filtered = useMemo(() => {
    // Apply date range filtering client-side
    const from = fromDate ? parseDate(fromDate) : null;
    const to = toDate ? parseDate(toDate) : null;

    return sessions.filter((s) => {
      const sd = parseDate(s.date);
      if (!sd) {
        // Keep sessions without valid date in upcoming by default
        return true;
      }
      if (from && sd < from) return false;
      if (to && sd > to) return false;
      return true;
    });
  }, [sessions, fromDate, toDate]);

  const upcoming = useMemo(() => {
    return filtered.filter((s) => {
      const sd = parseDate(s.date);
      if (!sd) return true; // no date -> treat as upcoming
      return sd >= today;
    });
  }, [filtered, today]);

  const past = useMemo(() => {
    return filtered.filter((s) => {
      const sd = parseDate(s.date);
      if (!sd) return false; // no date -> not past
      return sd < today;
    });
  }, [filtered, today]);

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

      {/* Date filter row (keeps UI style minimal) */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <div className="form-group small" style={{ margin: 0 }}>
          <label>From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="form-group small" style={{ margin: 0 }}>
          <label>To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        { (fromDate || toDate) && (
          <button className="btn" onClick={() => { setFromDate(""); setToDate(""); }}>Clear</button>
        )}
      </div>

      {/* UPCOMING */}
      <h3 style={{ marginTop: 10 }}>Upcoming Sessions</h3>
      {upcoming.length === 0 && <p>No upcoming sessions.</p>}
      <div className="sessions-grid">
        {upcoming.map((s) => (
          <div className="session-card" key={s._id}>
            <h3>{s.title}</h3>
            <p className="muted">{s.description || "No description"}</p>
            <p>{s.date} {s.time}</p>
            <p>Attending: {(s.attendees || []).length}{s.maxParticipants ? ` / ${s.maxParticipants}` : ""}</p>
            <Link to={`/sessions/${s._id}`} className="card-btn">View</Link>
          </div>
        ))}
      </div>

      {/* PAST */}
      <h3 style={{ marginTop: 24 }}>Past Sessions</h3>
      {past.length === 0 && <p>No past sessions.</p>}
      <div className="sessions-grid">
        {past.map((s) => (
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