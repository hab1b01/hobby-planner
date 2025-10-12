import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../styles/CreateSession.css";

type SessionType = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  maxParticipants?: number;
  type?: "public" | "private";
  location?: string;
  email?: string;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function EditSession() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  
  const accessCode = searchParams.get("code") || localStorage.getItem("accessCode") || "";

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [type, setType] = useState<"public" | "private">("public");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const fetchForEdit = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/sessions/${id}?code=${encodeURIComponent(accessCode)}`, {
        headers: accessCode ? { "x-access-code": accessCode } : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to load session");
        setLoading(false);
        return;
      }
      const data: SessionType = await res.json();
      setTitle(data.title || "");
      setDescription(data.description || "");
      setDate(data.date || "");
      setTime(data.time || "");
      setMaxParticipants(typeof data.maxParticipants === "number" ? data.maxParticipants : "");
      setType((data.type as "public" | "private") || "public");
      setLocation(data.location || "");
      setEmail(data.email || "");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForEdit();
    
  }, [id, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");
    try {
      
      const mg = searchParams.get("code") || "";
      const res = await fetch(`${API}/api/sessions/${id}?code=${encodeURIComponent(mg)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": mg || accessCode,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          time,
          maxParticipants: Number(maxParticipants || 0),
          type,
          location,
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      alert("Notification: Session updated.");
      navigate(`/sessions/${id}`);
    } catch {
      setError("Network error");
    }
  };

  if (loading) {
    return (
      <div className="create-session-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="create-session-container">
      <h2>Edit Session</h2>

      <form className="create-session-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group small">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group small">
            <label>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group small">
            <label>Max participants</label>
            <input
              type="number"
              min="0"
              value={maxParticipants as any}
              onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
          <div className="form-group small">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as "public" | "private")}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Location (address/place)</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Your email (optional)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" type="submit">Save Changes</button>
          <button type="button" className="btn btn-danger" onClick={() => navigate(`/sessions/${id}`)}>
            Cancel
          </button>
        </div>
      </form>

      {error && <div className="codes-box error">{error}</div>}
    </div>
  );
}