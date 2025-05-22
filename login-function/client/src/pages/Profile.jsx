// client/src/pages/Profile.js
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/auth/authContext';
import AlertContext from '../context/alert/alertContext';

const Profile = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const {
    user,
    loadUser,
    enable2FA,
    verify2FASetup,
    disable2FA,
    twoFactorSecret,
    qrCodeUrl,
    error
  } = authContext;

  const { setAlert } = alertContext;

  const [verificationCode, setVerificationCode] = useState('');
  const [showProtectedContent, setShowProtectedContent] = useState(false);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (error) {
      setAlert(error, 'danger');
    }
    // eslint-disable-next-line
  }, [error]);

  const onEnable2FA = () => {
    enable2FA();
  };

  const onVerify2FASetup = e => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setAlert('Please enter verification code', 'danger');
      return;
    }
    verify2FASetup(verificationCode);
    setVerificationCode('');
  };

  const onDisable2FA = () => {
    if (window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      disable2FA();
    }
  };

  const onChange = e => setVerificationCode(e.target.value);

  const onViewProtectedContent = () => {
    setShowProtectedContent(true);
  };

  if (!user) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>Profile</h2>
        </div>
        <div className="card-body">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>2FA Status:</strong>
            <span className={`badge ${user.isTwoFactorEnabled ? 'badge-success' : 'badge-warning'}`}>
              {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </p>

          {!user.isTwoFactorEnabled && !twoFactorSecret && (
            <div className="mt-3">
              <button onClick={onEnable2FA} className="btn btn-primary">
                Enable Two-Factor Authentication
              </button>
            </div>
          )}

          {user.isTwoFactorEnabled && (
            <div className="mt-3">
              <button onClick={onDisable2FA} className="btn btn-danger">
                Disable Two-Factor Authentication
              </button>
            </div>
          )}

          {twoFactorSecret && !user.isTwoFactorEnabled && (
            <div className="setup-2fa mt-3">
              <h3>Set up Two-Factor Authentication</h3>
              <p>
                Scan the QR code below with your authenticator app (like Google Authenticator,
                Authy, or Microsoft Authenticator).
              </p>
              {qrCodeUrl && (
                <div className="qr-container">
                  <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                </div>
              )}
              <div className="mt-3">
                <p>
                  Or manually enter this code in your authenticator app:
                  <code className="ml-2">{twoFactorSecret}</code>
                </p>
              </div>
              <form onSubmit={onVerify2FASetup} className="mt-3">
                <div className="form-group">
                  <label htmlFor="verificationCode">Verification Code</label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={onChange}
                    placeholder="Enter 6-digit code from your app"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  Verify and Enable 2FA
                </button>
              </form>
            </div>
          )}

          <div className="protected-content-section mt-4">
            <h3>Protected Content</h3>
            {!showProtectedContent ? (
              <button onClick={onViewProtectedContent} className="btn btn-secondary">
                View Protected Content
              </button>
            ) : (
              <div className="card welcome-container">
                <h1>Hello World!</h1>
                <p>This is a protected route that requires authentication.</p>
                <p>Welcome, {user.name}!</p>
                <p>You've successfully logged in{user.isTwoFactorEnabled ? ' with 2FA' : ''}!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
