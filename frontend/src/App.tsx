import { Routes, Route, Link } from "react-router-dom";
import SessionsList from "./pages/SessionsList";
import CreateSession from "./pages/CreateSession";
import SessionDetails from "./pages/SessionDetails";
import EditSession from "./pages/EditSession"; // <-- add
import "./index.css";

export default function App() {
  return (
    <div className="app-root">
      <header className="topbar">
        <div className="container topbar-inner">
          <h1 className="brand">Hobby Session Planner</h1>
          <nav>
            <Link className="nav-link" to="/sessions">All Sessions</Link>
            <Link className="nav-link" to="/create">Create Session</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 20 }}>
        <Routes>
          <Route path="/" element={<SessionsList />} />
          <Route path="/sessions" element={<SessionsList />} />
          <Route path="/sessions/:id" element={<SessionDetails />} />
          <Route path="/sessions/:id/edit" element={<EditSession />} /> {/* <-- new route */}
          <Route path="/create" element={<CreateSession />} />
        </Routes>
      </main>
    </div>
  );
}