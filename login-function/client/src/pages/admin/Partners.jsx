// client/src/pages/admin/Partners.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';
import { API_URL } from '../../config';

const AdminPartners = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    companyName: ''
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/partners`);
      setPartners(res.data.data.partners);
    } catch (error) {
      setAlert('Failed to fetch partners', 'danger');
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/admin/partners`, newPartner);
      setAlert('Partner created successfully', 'success');
      setPartners([res.data.data.partner, ...partners]);
      setNewPartner({ name: '', email: '', companyName: '' });
      setShowCreateForm(false);
    } catch (error) {
      setAlert(error.response?.data?.error || 'Failed to create partner', 'danger');
    }
  };

  const viewPartnerDetails = async (partnerId) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/partners/${partnerId}`);
      setSelectedPartner(res.data.data);
      setShowDetails(true);
    } catch (error) {
      setAlert('Failed to fetch partner details', 'danger');
    }
  };

  const regenerateToken = async (partnerId) => {
    if (!window.confirm('Are you sure you want to regenerate this partner\'s secret token? The old token will no longer work.')) {
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/admin/partners/${partnerId}/regenerate-token`);
      setAlert('Token regenerated successfully', 'success');

      // Update the selected partner if viewing details
      if (selectedPartner && selectedPartner.partner.id === partnerId) {
        setSelectedPartner({
          ...selectedPartner,
          partner: {
            ...selectedPartner.partner,
            secretToken: res.data.data.newSecretToken
          }
        });
      }
    } catch (error) {
      setAlert('Failed to regenerate token', 'danger');
    }
  };

  const togglePartnerStatus = async (partnerId) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/partners/${partnerId}/toggle-status`);
      setAlert(res.data.message, 'success');

      // Update partners list
      setPartners(partners.map(partner =>
        partner.id === partnerId
          ? { ...partner, isActive: res.data.data.isActive }
          : partner
      ));
    } catch (error) {
      setAlert('Failed to update partner status', 'danger');
    }
  };

  const onChange = (e) => {
    setNewPartner({ ...newPartner, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>Partner Management</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Add New Partner'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card-body">
            <h3>Create New Partner</h3>
            <form onSubmit={createPartner}>
              <div className="form-group">
                <label htmlFor="name">Contact Name</label>
                <input
                  type="text"
                  name="name"
                  value={newPartner.name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newPartner.email}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={newPartner.companyName}
                  onChange={onChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                Create Partner
              </button>
            </form>
          </div>
        )}

        <div className="card-body">
          {partners.length === 0 ? (
            <p>No partners found.</p>
          ) : (
            <div className="partners-list">
              {partners.map(partner => (
                <div key={partner.id} className="partner-item">
                  <div className="partner-header">
                    <h3>{partner.companyName}</h3>
                    <div className="partner-status">
                      <span className={`badge ${partner.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {partner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="partner-details">
                    <p><strong>Contact:</strong> {partner.name}</p>
                    <p><strong>Email:</strong> {partner.email}</p>
                    <p><strong>Created:</strong> {new Date(partner.createdAt).toLocaleDateString()}</p>
                    {partner.lastUsed && (
                      <p><strong>Last Used:</strong> {new Date(partner.lastUsed).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="partner-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => viewPartnerDetails(partner.id)}
                    >
                      View Details
                    </button>
                    <button
                      className={`btn ${partner.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => togglePartnerStatus(partner.id)}
                    >
                      {partner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Partner Details Modal */}
      {showDetails && selectedPartner && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Partner Details: {selectedPartner.partner.companyName}</h3>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-row">
                  <strong>Company:</strong> {selectedPartner.partner.companyName}
                </div>
                <div className="detail-row">
                  <strong>Contact:</strong> {selectedPartner.partner.name}
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> {selectedPartner.partner.email}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`badge ${selectedPartner.partner.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {selectedPartner.partner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {new Date(selectedPartner.partner.createdAt).toLocaleString()}
                </div>
                {selectedPartner.partner.lastUsed && (
                  <div className="detail-row">
                    <strong>Last Used:</strong> {new Date(selectedPartner.partner.lastUsed).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>API Configuration</h4>
                <div className="detail-row">
                  <strong>Secret Token:</strong>
                  <div className="token-display">
                    <code>{selectedPartner.partner.secretToken}</code>
                    <button
                      className="btn btn-warning"
                      onClick={() => regenerateToken(selectedPartner.partner.id)}
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="detail-row">
                  <strong>API Endpoint:</strong>
                  <code>{API_URL}/api/partner/escrow/create</code>
                </div>
                <div className="detail-row">
                  <strong>Header Required:</strong>
                  <code>X-Partner-Token: {selectedPartner.partner.secretToken}</code>
                </div>
              </div>

              <div className="detail-section">
                <h4>Transaction Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <strong>Total Transactions:</strong> {selectedPartner.stats.totalTransactions}
                  </div>
                  <div className="stat-item">
                    <strong>Total Amount:</strong> {selectedPartner.stats.totalAmount.toLocaleString()} VND
                  </div>
                  {Object.entries(selectedPartner.stats.byStatus).map(([status, data]) => (
                    <div key={status} className="stat-item">
                      <strong>{status.toUpperCase()}:</strong> {data.count} transactions, {data.amount.toLocaleString()} VND
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
