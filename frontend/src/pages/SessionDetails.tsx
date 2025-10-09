import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/sessionDetails.css";

const API = "http://localhost:4000";

export default function SessionDetails() {
  const { id } = useParams();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/sessions/${id}`)
      .then((res) => res.json())
      .then(setSession);
  }, [id]);

  const attend = async () => {
    const res = await fetch(`${API}/api/sessions/${id}/attend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Guest" }),
    });
    const data = await res.json();
    alert(`You're going! Save this code: ${data.attendanceCode}`);
  };

  const unattend = async () => {
    const attendanceCode = prompt("Enter your attendance code:");
    if (!attendanceCode) return;
    const res = await fetch(`${API}/api/sessions/${id}/unattend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceCode }),
    });
    const data = await res.json();
    alert(data.message);
  };

  if (!session) return <div>Loading...</div>;
  return (
    <div className="session-details">
      <h2>{session.title}</h2>
      <p>{session.description}</p>
      <p>Date: {session.date}</p>
      <p>Time: {session.time}</p>
      <p>Participants: {session.attendees?.length || 0}</p>
      <button onClick={attend}>I'm Going</button>
      <button onClick={unattend}>Not Going</button>
    </div>
  );
}