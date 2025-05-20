// client/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="main-content welcome-container">
      <h1>Welcome to MERN Auth with 2FA</h1>
      <p>
        A secure authentication system built with the MERN stack featuring two-factor authentication.
      </p>
      <div>
        <Link to="/register" className="btn btn-primary">
          Register
        </Link>
        <Link to="/login" className="btn btn-secondary">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
