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
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

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

  const getAiSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
      const res = await fetch(`${API}/api/ai/suggest${titleParam}`);
      const data = await res.json();
      setAiSuggestion(data.suggestion);
    } catch (err) {
      alert("Failed to get AI suggestion");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (!aiSuggestion) return;
    setTitle(aiSuggestion.title || "");
    setDescription(aiSuggestion.description || "");
    setAiSuggestion(null);
  };

  return (
    <div className="create-session-container">
      <h2>Create Session</h2>
      
      <div style={{ marginBottom: 20, padding: 15, background: "#f0f8ff", borderRadius: 8 }}>
        <div style={{ marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: "0.9em", color: "#555" }}>
            💡 <strong>Tip:</strong> Enter a session title above, then click "Get AI Suggestion" to generate a structured plan for it.
          </p>
        </div>
        <button 
          type="button"
          onClick={getAiSuggestion} 
          disabled={loadingSuggestion}
          style={{ 
            padding: "10px 20px", 
            cursor: loadingSuggestion ? "not-allowed" : "pointer",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontWeight: 500
          }}
        >
          {loadingSuggestion ? "🤔 Generating..." : "🤖 Get AI Suggestion"}
        </button>
        
        {aiSuggestion && (
          <div style={{ marginTop: 15, padding: 15, background: "white", borderRadius: 8, border: "2px solid #3498db" }}>
            <h4 style={{ marginTop: 0, color: "#2c3e50" }}>✨ AI Suggested Session:</h4>
            <p style={{ margin: "8px 0" }}><strong>{aiSuggestion.title}</strong></p>
            <p style={{ margin: "8px 0", color: "#555" }}>{aiSuggestion.description}</p>
            <button 
              type="button"
              onClick={applySuggestion} 
              style={{ 
                marginTop: 10,
                padding: "8px 16px",
                background: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              ✓ Use This Suggestion
            </button>
          </div>
        )}
      </div>

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
            <button className="btn" type="button" onClick={() => copy(codes.managementCode)}>
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
              <button className="btn" type="button" onClick={() => copy(codes.privateCode)}>
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
              <button className="btn" type="button" onClick={() => copy(codes.id)}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}