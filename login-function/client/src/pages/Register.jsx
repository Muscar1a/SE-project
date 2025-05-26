// client/src/pages/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/auth/authContext';

const Register = () => {
  const authContext = useContext(AuthContext);
  const { error, clearErrors, isAuthenticated } = authContext;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Handle registration errors
    if (error) {
      alert('Registration error: ' + error);
      clearErrors();
    }
  }, [error, isAuthenticated, navigate, clearErrors]);

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { name, email, password, password2 } = user;

  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (name === '' || email === '' || password === '') {
      alert('Please enter all fields');
      return;
    }

    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await authContext.register({
        name,
        email,
        password
      });

      if (result && result.success) {
        alert('Registration successful! Please login with your credentials.');

        // Clear the form
        setUser({
          name: '',
          email: '',
          password: '',
          password2: ''
        });

        // Redirect to login page immediately
        navigate('/login');
      } else if (result && result.error) {
        alert('Registration failed: ' + result.error);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (err) {
      alert('Registration failed. Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='form-container'>
      <h1>Account Register</h1>
      <form onSubmit={onSubmit} className="form"> 
        <div className='form-group'>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            name='name'
            value={name}
            onChange={onChange}
            required
            disabled={loading}
            placeholder="Enter your full name"
          />
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Email Address</label>
          <input
            type='email'
            name='email'
            value={email}
            onChange={onChange}
            required
            disabled={loading}
            placeholder="Enter your email"
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            name='password'
            value={password}
            onChange={onChange}
            required
            minLength='6'
            disabled={loading}
            placeholder="Minimum 6 characters"
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password2'>Confirm Password</label>
          <input
            type='password'
            name='password2'
            value={password2}
            onChange={onChange}
            required
            minLength='6'
            disabled={loading}
            placeholder="Confirm your password"
          />
        </div>
        <input
          type='submit'
          value={loading ? 'Registering...' : 'Register'}
          className='btn btn-primary btn-block'
          disabled={loading}
        />
      </form>

      <p className="text-center mt-3">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;
