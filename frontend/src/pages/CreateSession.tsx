import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateSession.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CreateSession() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [type, setType] = useState<"public" | "private">("public");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [managementCode, setManagementCode] = useState("");
  const [privateCode, setPrivateCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

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
          location,
          email,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to create session");
        return;
      }

      
      setManagementCode(data.managementCode || "");
      setPrivateCode(data.privateCode || "");

      alert(
        `Session created!\n\nManagement Code: ${data.managementCode}` +
        (data.privateCode ? `\nPrivate Code: ${data.privateCode}` : "")
      );

      
      navigate(`/sessions/${data._id}?code=${data.managementCode}`);
    } catch (err) {
      setError("Network error - please check your connection");
      console.error(err);
    }
  };

  return (
    <div className="create-session-container">
      <h2>Create New Session</h2>

      <form className="create-session-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            placeholder="e.g., Weekly Football Practice"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will happen in this session?"
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group small">
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div className="form-group small">
            <label>Time</label>
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
            />
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
              placeholder="0 = unlimited"
            />
          </div>
          <div className="form-group small">
            <label>Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as "public" | "private")}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Location (address/place)</label>
          <input 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Central Park, NYC"
          />
        </div>

        <div className="form-group">
          <label>Your email (optional)</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn" type="submit">Create Session</button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => navigate("/sessions")}
          >
            Cancel
          </button>
        </div>
      </form>

      {managementCode || privateCode ? (
        <div className="codes-box">
          {managementCode && (
            <div>
              <strong>Management Code:</strong> {managementCode}
            </div>
          )}
          {privateCode && (
            <div>
              <strong>Private Code:</strong> {privateCode}
            </div>
          )}
        </div>
      ) : null}

      {error && <div className="codes-box error">{error}</div>}
    </div>
  );
}