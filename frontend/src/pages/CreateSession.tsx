import React, { useState } from "react";
import "../styles/createSession.css";

const API = "http://localhost:4000";

export default function CreateSession() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [type, setType] = useState<"public" | "private">("public");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [codes, setCodes] = useState<{ managementCode?: string; privateCode?: string; id?: string } | null>(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date,
          time,
          maxParticipants: Number(maxParticipants || 0),
          type,
          email,
          location,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setCodes({
        managementCode: data.managementCode,
        privateCode: data.privateCode,
        id: data._id,
      });
    } catch {
      setError("Network error");
    }
  };

  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div className="create-session-container">
      <h2>Create Session</h2>
      <form className="create-session-form" onSubmit={submit}>
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
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
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

        <button className="btn" type="submit">
          Create
        </button>
      </form>

      {error && <div className="codes-box error">{error}</div>}

      {codes && (
        <div className="codes-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div>
                <strong>Management code</strong>
              </div>
              <div style={{ fontFamily: "monospace", marginTop: 6 }}>{codes.managementCode}</div>
            </div>
            <button className="btn" onClick={() => copy(codes.managementCode)}>
              Copy
            </button>
          </div>

          {codes.privateCode && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <div>
                <div>
                  <strong>Private code</strong>
                </div>
                <div style={{ fontFamily: "monospace", marginTop: 6 }}>{codes.privateCode}</div>
              </div>
              <button className="btn" onClick={() => copy(codes.privateCode)}>
                Copy
              </button>
            </div>
          )}

          {codes.id && type === "private" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <div>
                <div>
                  <strong>Session ID</strong>
                </div>
                <div style={{ fontFamily: "monospace", marginTop: 6 }}>{codes.id}</div>
              </div>
              <button className="btn" onClick={() => copy(codes.id)}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}