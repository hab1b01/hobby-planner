import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import SessionsList from "./pages/SessionsList";
import "./App.css";

const App: React.FC = () => {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/sessions">Sessions</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sessions" element={<SessionsList />} />
      </Routes>
    </>
  )
}

export default App;