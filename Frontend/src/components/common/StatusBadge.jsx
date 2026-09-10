import React from 'react';

const StatusBadge = ({ status, customColors = {} }) => {
  const defaultColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    blocked: 'bg-red-100 text-red-800',
    delivered: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
  };

  const colors = { ...defaultColors, ...customColors };
  const statusKey = status?.toLowerCase() || '';
  const colorClass = colors[statusKey] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}
    >
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;