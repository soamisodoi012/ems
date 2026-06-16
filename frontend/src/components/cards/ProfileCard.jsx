import React from 'react';
import { EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Badge from '../common/Badge';

const ProfileCard = ({ user, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{user.full_name}</h2>
            <p className="text-primary-100 mt-1">{user.position}</p>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-600">{user.email}</span>
          </div>
          
          {user.phone && (
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-600">{user.phone}</span>
            </div>
          )}
          
          {user.department && (
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-600">{user.department}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
              {user.status}
            </Badge>
            <Badge variant="primary">{user.role}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;