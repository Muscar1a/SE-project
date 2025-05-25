import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const DisputeInitiate = () => {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [reason, setReason] = useState('');
  const [evidenceMsg, setEvidenceMsg] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/dispute/initiate`, {
        escrowId: orderId,
        reason,
        evidence: { message: evidenceMsg, files: evidenceFiles },
        sellerId: 'seller', // Replace with actual seller id logic
        adminId: 'admin', // Replace with actual admin id logic
      });
      setAlert('Dispute initiated', 'success');
      navigate(`/escrow/${orderId}`);
    } catch (err) {
      setAlert('Failed to initiate dispute', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2>Open Dispute</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason</label>
            <input type="text" className="form-control" value={reason} onChange={e => setReason(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Evidence Message</label>
            <textarea className="form-control" value={evidenceMsg} onChange={e => setEvidenceMsg(e.target.value)} required />
          </div>
          {/* File upload UI can be added here */}
          <button type="submit" className="btn btn-danger" disabled={loading}>{loading ? 'Submitting...' : 'Submit Dispute'}</button>
        </form>
      </div>
    </div>
  );
};

export default DisputeInitiate;
