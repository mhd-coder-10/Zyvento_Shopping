import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  title = 'No Data',
  message = 'No data available to display.',
  icon: Icon = FiInbox,
  action,
  actionText,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="w-12 h-12 mx-auto text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {action && actionText && (
        <button
          onClick={action}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;