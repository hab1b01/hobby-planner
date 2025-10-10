import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/sessionDetails.css";

type Attendee = { name: string; attendanceCode: string };

type SessionType = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  maxParticipants?: number;
  type?: "public" | "private";
  location?: string;
  attendees?: Attendee[];
  managementCode?: string | null;
  privateCode?: string | null;
};

const API = "http://localhost:4000";

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [myCode, setMyCode] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [privateRequired, setPrivateRequired] = useState(false);
  const [privateInput, setPrivateInput] = useState("");
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  const fetchSession = async (privateCode?: string) => {
    setLoading(true);
    try {
      const url = `${API}/api/sessions/${id}` + (privateCode ? `?code=${privateCode}` : "");
      const res = await fetch(url);
      if (res.status === 403) {
        setSession(null);
        setPrivateRequired(true);
      } else {
        const data = await res.json();
        setSession(data);
        setPrivateRequired(false);
        if (data.location) {
          const q = encodeURIComponent(data.location);
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${q}`;
          try {
            const r = await fetch(nomUrl);
            const json = await r.json();
            if (Array.isArray(json) && json.length) {
              const lat = json[0].lat;
              const lon = json[0].lon;
              setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${lon}%2C${lat}%2C${lon}%2C${lat}&layer=mapnik&marker=${lat}%2C${lon}`);
            } else {
              setMapUrl(null);
            }
          } catch {
            setMapUrl(null);
          }
        } else {
          setMapUrl(null);
        }
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchSession(); }, [id]);

  const openPrivate = () => { if (!privateInput) return alert("Paste private code"); fetchSession(privateInput); };

  const copyCode = (code?: string | null) => {
    if (!code) return alert("No code to copy");
    navigator.clipboard.writeText(code).then(() => alert("Code copied!")).catch(() => alert("Copy failed"));
  };

  const shareSession = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: session?.title || "Hobby Session",
        text: `Join me at: ${session?.title}`,
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

  const join = async () => {
    if (!name) return alert("Enter your name");
    try {
      const res = await fetch(`${API}/api/attendance/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok && data.attendanceCode) {
        setMyCode(data.attendanceCode);
        fetchSession();
        alert("Your attendance code: " + data.attendanceCode);
      } else {
        alert(data.error || "Join failed");
      }
    } catch {
      alert("Join failed");
    }
  };

  const leave = async () => {
    if (!myCode) return alert("Paste your attendance code first");
    try {
      const res = await fetch(`${API}/api/attendance/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: myCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMyCode("");
        fetchSession();
        alert("Left session");
      } else {
        alert(data.error || "Leave failed");
      }
    } catch {
      alert("Leave failed");
    }
  };

  const managerRemove = async (attendanceCode?: string, attendeeName?: string) => {
    if (!managerCode) return alert("Enter management code");
    try {
      const res = await fetch(`${API}/api/attendance/${id}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: managerCode, attendanceCode, attendeeName })
      });
      const data = await res.json();
      if (res.ok && data.success) fetchSession();
      else alert(data.error || "Remove failed");
    } catch {
      alert("Remove failed");
    }
  };

  const editSession = async () => {
    const mg = prompt("Enter management code to edit:");
    if (!mg) return;
    const newTitle = prompt("New title:", session?.title || "");
    if (!newTitle) return;
    try {
      const res = await fetch(`${API}/api/sessions/${id}?code=${mg}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) fetchSession();
      else {
        const data = await res.json();
        alert(data.error || "Edit failed");
      }
    } catch {
      alert("Edit failed");
    }
  };

  const deleteSession = async () => {
    const mg = prompt("Enter management code to delete:");
    if (!mg) return;
    if (!window.confirm("Delete session permanently?")) return;
    try {
      const res = await fetch(`${API}/api/sessions/${id}?code=${mg}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Deleted - redirecting to list");
        navigate("/sessions");
      } else alert(data.error || "Delete failed");
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <div className="session-details"><p>Loading...</p></div>;
  if (privateRequired) {
    return (
      <div className="session-details">
        <h2>Private session</h2>
        <p>Paste the private code to open:</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={privateInput} onChange={(e) => setPrivateInput(e.target.value)} placeholder="Private code" />
          <button className="btn" onClick={openPrivate}>Open</button>
        </div>
      </div>
    );
  }
  if (!session) return <div className="session-details"><p>Session not found</p></div>;

  return (
    <div className="session-details">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{session.title}</h2>
        <button 
          onClick={shareSession}
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
      
      <p>{session.description}</p>
      <p>{session.date} · {session.time}</p>
      <p>Attending: {(session.attendees || []).length}{session.maxParticipants ? ` / ${session.maxParticipants}` : ""}</p>

      {session.managementCode && (
        <button onClick={() => copyCode(session.managementCode)}>Copy Management Code</button>
      )}
      {session.privateCode && (
        <button onClick={() => copyCode(session.privateCode)}>Copy Private Code</button>
      )}

      {session.location && (
        <div style={{ marginTop: 12 }}>
          {mapUrl ? (
            <iframe title="map" src={mapUrl} style={{ width: "100%", height: 240, border: 0, borderRadius: 8 }} />
          ) : (
            <div style={{ padding: 10, borderRadius: 8, background: "#fafafa", border: "1px solid #eee" }}>
              <div>Map not found for this location. <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(session.location || "")}`} target="_blank" rel="noreferrer">Open in OSM</a></div>
            </div>
          )}
        </div>
      )}

      <h3>Attendees</h3>
      <ul className="attendees-list">
        {(session.attendees || []).map((a) => (
          <li key={a.attendanceCode} className="attendee-item">
            <span>{a.name}</span>
            <div>
              <button className="remove-small" onClick={() => managerRemove(a.attendanceCode, a.name)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="controls">
        <div className="inline">
          <input className="text-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={join}>Join</button>
        </div>

        <div className="inline" style={{ marginTop: 8 }}>
          <input className="text-input" placeholder="My attendance code" value={myCode} onChange={(e) => setMyCode(e.target.value)} />
          <button className="btn btn-danger" onClick={leave}>Leave</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <input className="text-input" placeholder="Manager code" value={managerCode} onChange={(e) => setManagerCode(e.target.value)} />
          <div className="button-group" style={{ marginTop: 8 }}>
            <button className="btn" onClick={editSession}>Edit</button>
            <button className="btn btn-danger" onClick={deleteSession}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}