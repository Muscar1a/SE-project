import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';
import './DisputeCenter.css'; // Assuming you have a CSS file for styling

const DisputeCenter = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        // Luôn gọi API lấy toàn bộ dispute, không kiểm tra role admin nữa
        const res = await axios.get(`${API_URL}/api/dispute/all`);
        setDisputes(res.data.disputes || []);
      } catch (err) {
        setAlert('Error fetching disputes', 'danger');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDisputes();
  }, [user, setAlert]);

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

  return (
    <div className="container-flex">
    <div className="main-content">
      <div className="card">
        <h2>Dispute Center</h2>
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Dispute ID</th>
              <th>Order ID</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Amount</th>
              <th>Escrow Status</th>
              <th>Dispute Status</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map(d => (
              <tr key={d._id}>
                <td>{d._id}</td>
                <td>{d.escrowId?.orderId || d.escrowId?._id || d.escrowId}</td>
                <td>{d.escrowId?.sellerId}</td>
                <td>{d.escrowId?.buyerId}</td>
                <td>{d.escrowId?.amount?.toLocaleString()} VND</td>
                <td>{d.escrowId?.status}</td>
                <td><span className={`badge-${d.status === 'resolved' ? 'success' : d.status === 'responded' ? 'info' : 'warning'}`}>{d.status}</span></td>
                <td>{d.reason}</td>
                <td><a href={`/dispute/${d._id}`}>View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default DisputeCenter;
