import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/sessionsList.css";

type SessionType = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  type?: "public" | "private";
  attendees?: any[];
};

const API = "http://localhost:4000";

export default function SessionsList() {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API}/api/sessions`)
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => alert("Failed to load sessions"));
  }, []);

  const filterSessions = (sessions: SessionType[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return sessions.filter((session) => {
      if (session.type === "private") return false;

      const matchesSearch = 
        !searchTerm ||
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "all") return true;
      
      if (session.date) {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (filter === "upcoming") {
          return sessionDate >= now;
        } else {
          return sessionDate < now;
        }
      }
      
      return filter === "upcoming";
    });
  };

  const filteredSessions = filterSessions(sessions);

  const shareSession = (sessionId: string, title: string) => {
    const url = `${window.location.origin}/session/${sessionId}`;
    if (navigator.share) {
      navigator.share({
        title: `Join: ${title}`,
        text: `Check out this session: ${title}`,
        url: url
      }).catch(() => {
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link"));
  };

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "0 20px" }}>
      <h2>Sessions</h2>
      
      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: 8, 
            flex: 1,
            minWidth: 200,
            borderRadius: 4,
            border: "1px solid #ccc"
          }}
        />
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          style={{ 
            padding: 8, 
            borderRadius: 4,
            border: "1px solid #ccc"
          }}
        >
          <option value="all">All Sessions</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {filteredSessions.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", marginTop: 40 }}>
          No sessions found
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {filteredSessions.map((session) => (
            <div 
              key={session._id} 
              style={{
                background: "white",
                padding: 20,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >
              <div style={{ flex: 1 }}>
                <Link 
                  to={`/session/${session._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3 style={{ margin: 0, marginBottom: 8, color: "#2c3e50" }}>
                    {session.title}
                  </h3>
                  <p style={{ margin: 0, marginBottom: 8, color: "#555" }}>
                    {session.description}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9em", color: "#777" }}>
                    📅 {session.date} · 🕐 {session.time} · 
                    👥 {(session.attendees || []).length} attending
                  </p>
                </Link>
              </div>
              
              <button 
                onClick={() => shareSession(session._id, session.title)}
                style={{
                  padding: "8px 16px",
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "0.9em"
                }}
              >
                📤 Share
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}