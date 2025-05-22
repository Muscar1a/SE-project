// client/src/components/layout/Navbar.js
import React, { useContext, Fragment } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;

  const onLogout = () => {
    logout();
  };

  const authLinks = (
    <Fragment>
      <li>Hello {user && (user.name || user.username)}</li>
      <li>
        <Link to='/profile'>Profile</Link>
      </li>
      <li>
        <Link to='/escrow'>Escrow</Link>
      </li>
      {/* Admin Links - In production, you'd check for admin role */}
      <li className="dropdown">
        <Link to="#" className="dropdown-toggle">Admin</Link>
        <div className="dropdown-menu">
          <Link to='/admin/partners'>Partners</Link>
          <Link to='/admin/api-docs'>API Docs</Link>
        </div>
      </li>
      <li>
        <a onClick={onLogout} href="#!">
          <i className="fas fa-sign-out-alt"></i> <span className="hide-sm">Logout</span>
        </a>
      </li>
    </Fragment>
  );

  const guestLinks = (
    <Fragment>
      <li>
        <Link to='/register'>Register</Link>
      </li>
      <li>
        <Link to='/login'>Login</Link>
      </li>
    </Fragment>
  );

  return (
    <div className="navbar">
      <h1>
        <Link to='/' className="brand">
          <i className="fas fa-lock"></i> MERN Auth & Payment
        </Link>
      </h1>
      <ul>
        {isAuthenticated ? authLinks : guestLinks}
      </ul>
    </div>
  );
};

export default Navbar;
