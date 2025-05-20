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
    verify2FASetup(verificationCode);
    setVerificationCode('');
  };

  const onDisable2FA = () => {
    disable2FA();
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
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>2FA Status:</strong> {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</p>

        {!user.isTwoFactorEnabled && !twoFactorSecret && (
          <button onClick={onEnable2FA} className="btn btn-primary">
            Enable Two-Factor Authentication
          </button>
        )}

        {user.isTwoFactorEnabled && (
          <button onClick={onDisable2FA} className="btn btn-danger">
            Disable Two-Factor Authentication
          </button>
        )}

        {twoFactorSecret && !user.isTwoFactorEnabled && (
          <div className="setup-2fa">
            <h3>Set up Two-Factor Authentication</h3>
            <p>
              Scan the QR code below with your authenticator app (like Google Authenticator,
              Authy, or Microsoft Authenticator).
            </p>
            <div className="qr-container">
              <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
            </div>
            <p>
              Or manually enter this code in your authenticator app: <strong>{twoFactorSecret}</strong>
            </p>
            <form onSubmit={onVerify2FASetup}>
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={onChange}
                  placeholder="Enter 6-digit code from your app"
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                Verify and Enable 2FA
              </button>
            </form>
          </div>
        )}

        <div className="protected-content-section">
          <h3>Protected Content</h3>
          {!showProtectedContent ? (
            <button onClick={onViewProtectedContent} className="btn btn-secondary">
              View Protected Content
            </button>
          ) : (
            <div className="card welcome-container">
              <h1>Hello World!</h1>
              <p>This is a protected route that requires authentication.</p>
              <p>You've successfully logged in{user.isTwoFactorEnabled ? ' with 2FA' : ''}!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
