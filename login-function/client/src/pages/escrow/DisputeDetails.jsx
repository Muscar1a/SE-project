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
        // Lấy dispute chi tiết (bao gồm cả escrow nếu có)
        const res = await axios.get(`${API_URL}/api/dispute/${disputeId}`);
        setDispute(res.data.dispute || res.data); // fallback nếu API trả về dispute trực tiếp
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
      });
      setAlert('Response submitted', 'success');
      navigate('/escrow/disputes');
    } catch (err) {
      setAlert('Failed to respond', 'danger');
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!dispute) return <div>Dispute not found</div>;

  // Hiển thị chi tiết dispute và escrow liên quan
  return (
    <div className="main-content">
      <div className="card shadow p-4">
        <h2 className="mb-4">Dispute Details</h2>
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="border rounded p-3 bg-light">
              <h4 className="mb-3">Dispute Info</h4>
              <div><b>Status:</b> <span className={`badge badge-${dispute.status === 'resolved' ? 'success' : dispute.status === 'responded' ? 'info' : 'warning'}`}>{dispute.status}</span></div>
              <div><b>Reason:</b> {dispute.reason}</div>
              <div><b>Created At:</b> {dispute.createdAt && new Date(dispute.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            {dispute.escrowId && typeof dispute.escrowId === 'object' && (
              <div className="border rounded p-3 bg-light">
                <h4 className="mb-3">Escrow Info</h4>
                <div><b>Order ID:</b> {dispute.escrowId.orderId || dispute.escrowId._id}</div>
                <div><b>Seller ID:</b> {dispute.escrowId.sellerId}</div>
                <div><b>Buyer ID:</b> {dispute.escrowId.buyerId}</div>
                <div><b>Amount:</b> {dispute.escrowId.amount?.toLocaleString()} VND</div>
                <div><b>Status:</b> {dispute.escrowId.status}</div>
                <div><b>Description:</b> {dispute.escrowId.description}</div>
              </div>
            )}
          </div>
        </div>
        <div className="mb-4 mt-3">
          <h4>Evidence History</h4>
          <ul className="list-group">
            {dispute.history?.map((ev, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                <span><b>{ev.by}:</b> {ev.message} {ev.files && ev.files.length > 0 && <span>(Files: {ev.files.join(', ')})</span>}</span>
                <span className="text-muted" style={{fontSize:'0.9em'}}>{ev.createdAt && new Date(ev.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        {dispute.status === 'resolved' && dispute.decision && (
          <div className="alert alert-info mt-3">
            <b>Admin Decision:</b> {dispute.decision.action} <br />
            <b>Note:</b> {dispute.decision.note} <br />
            <b>Decided At:</b> {dispute.decision.decidedAt && new Date(dispute.decision.decidedAt).toLocaleString()}
          </div>
        )}
        {dispute.status !== 'resolved' && user?.role === 'seller' && (
          <form onSubmit={handleRespond} className="mt-3">
            <h4>Respond with Evidence</h4>
            <textarea value={evidenceMsg} onChange={e => setEvidenceMsg(e.target.value)} placeholder="Your message" required className="form-control mb-2" />
            {/* File upload UI can be added here */}
            <button type="submit" className="btn btn-primary">Submit Response</button>
          </form>
        )}
        {/* Update form cho mọi user */}
        {user && (
          <form
            className="mt-4 border rounded p-3 bg-light"
            onSubmit={async e => {
              e.preventDefault();
              try {
                await axios.patch(`${API_URL}/api/dispute/${dispute._id}`, {
                  status: e.target.status.value,
                  decision: e.target.decision.value,
                  note: e.target.note.value
                });
                setAlert('Dispute updated successfully', 'success');
                window.location.reload();
              } catch (err) {
                setAlert('Failed to update dispute', 'danger');
              }
            }}
          >
            <h4>Update Dispute</h4>
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="form-control" defaultValue={dispute.status} required>
                <option value="open">Open</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="form-group">
              <label>Decision</label>
              <select name="decision" className="form-control" defaultValue={dispute.decision?.action || ''} required>
                <option value="">-- Select --</option>
                <option value="refund">Refund</option>
                <option value="release">Release</option>
              </select>
            </div>
            <div className="form-group">
              <label>Note</label>
              <textarea name="note" className="form-control" defaultValue={dispute.decision?.note || ''} />
            </div>
            <button type="submit" className="btn btn-warning">Update Dispute</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DisputeDetails;
