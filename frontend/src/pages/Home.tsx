import React from 'react';

const Home = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1>Welcome to Hobby Session Planner</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
        Plan and manage your hobby sessions with ease!
      </p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Get Started</h2>
        <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
          <li>Create new sessions</li>
          <li>Browse public sessions</li>
          <li>Join sessions you're interested in</li>
          <li>Manage your attendance</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;