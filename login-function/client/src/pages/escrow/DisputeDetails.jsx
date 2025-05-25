import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const DisputeDetails = () => {
  const { disputeId } = useParams();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [dispute, setDispute] = useState(null);
  const [evidenceMsg, setEvidenceMsg] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/dispute/${disputeId}/status`);
        setDispute(res.data);
      } catch (err) {
        setAlert('Error fetching dispute', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [disputeId, setAlert]);

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/dispute/respond`, {
        disputeId,
        evidence: { message: evidenceMsg, files: evidenceFiles },
        buyerId: dispute?.buyerId,
        adminId: 'admin', // Replace with actual admin id logic
      });
      setAlert('Response submitted', 'success');
      navigate('/escrow/disputes');
    } catch (err) {
      setAlert('Failed to respond', 'danger');
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!dispute) return <div>Dispute not found</div>;

  return (
    <div className="main-content">
      <div className="card">
        <h2>Dispute Details</h2>
        <p><b>Status:</b> <span className={`badge badge-${dispute.status === 'resolved' ? 'success' : dispute.status === 'responded' ? 'info' : 'warning'}`}>{dispute.status}</span></p>
        <p><b>Reason:</b> {dispute.reason}</p>
        <h4>Evidence History</h4>
        <ul>
          {dispute.history?.map((ev, idx) => (
            <li key={idx}><b>{ev.by}:</b> {ev.message} {ev.files && ev.files.length > 0 && <span>(Files: {ev.files.join(', ')})</span>}</li>
          ))}
        </ul>
        {dispute.status !== 'resolved' && user?.role === 'seller' && (
          <form onSubmit={handleRespond}>
            <h4>Respond with Evidence</h4>
            <textarea value={evidenceMsg} onChange={e => setEvidenceMsg(e.target.value)} placeholder="Your message" required />
            {/* File upload UI can be added here */}
            <button type="submit" className="btn btn-primary">Submit Response</button>
          </form>
        )}
        {dispute.status === 'resolved' && dispute.decision && (
          <div className="alert alert-info mt-3">
            <b>Admin Decision:</b> {dispute.decision.action} <br />
            <b>Note:</b> {dispute.decision.note}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetails;
