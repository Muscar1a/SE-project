import React from 'react';

const SummaryCard = ({ icon, title, value}) => {

  return (
    <div className="summary-card">
      <div className="summary-card-icon-container">{icon}</div>
      <div className="summary-card-title">{title}</div>
      <div className="summary-card-value">{value}</div>
    </div>
  );
};

export default SummaryCard;