import React from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Alert = ({ type, message, onClose }) => {
  const types = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-400',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-400',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-400',
      iconColor: 'text-blue-400'
    }
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className={`rounded-md ${config.bgColor} p-4 border-l-4 ${config.borderColor} mb-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm ${config.textColor}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button onClick={onClose} className={`${config.textColor} hover:opacity-75`}>
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;