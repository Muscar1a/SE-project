import React from 'react';
import { IconSort } from './icons';

const TransactionTableHeader = ({ allSelected, onSelectAll }) => {
  return (
    <thead>
      <tr>
        <th>
          <input 
            type="checkbox" 
            checked={allSelected} 
            onChange={onSelectAll} 
          />
        </th>
        <th>Transaction ID <IconSort /></th>
        <th>Payment Name <IconSort /></th>
        <th>Amount <IconSort /></th>
        <th>Date <IconSort /></th>
        <th>Status <IconSort /></th>
        <th></th> {/* For Actions */}
      </tr>
    </thead>
  );
};

export default TransactionTableHeader;