import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const DisputeCenter = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        // You may want to filter by user role (buyer/seller/admin)
        const res = await axios.get(`${API_URL}/api/dispute/user/${user._id}`);
        setDisputes(res.data);
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
    <div className="main-content">
      <div className="card">
        <h2>Dispute Center</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Escrow</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map(d => (
              <tr key={d._id}>
                <td>{d._id}</td>
                <td>{d.escrowId}</td>
                <td><span className={`badge badge-${d.status === 'resolved' ? 'success' : d.status === 'responded' ? 'info' : 'warning'}`}>{d.status}</span></td>
                <td>{d.reason}</td>
                <td><a href={`/dispute/${d._id}`}>View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisputeCenter;
