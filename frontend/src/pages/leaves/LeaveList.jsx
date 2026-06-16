import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveApi } from '../../api/leaveApi';
import { format } from 'date-fns';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  // In the fetchLeaves function:
const fetchLeaves = async () => {
  try {
    const params = filter !== 'all' ? { status: filter } : {};
    const response = await leaveApi.getAll(params);
    
    let leavesData = [];
    if (response.data.data && Array.isArray(response.data.data)) {
      leavesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      leavesData = response.data;
    }
    
    setLeaves(leavesData);
  } catch (error) {
    toast.error('Failed to fetch leave requests');
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (id) => {
    try {
      await leaveApi.approveLeave(id);
      toast.success('Leave request approved');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await leaveApi.cancelLeave(id);
      toast.success('Leave request cancelled');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to cancel leave request');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
        <button
          onClick={() => navigate('/leaves/request')}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Request Leave
        </button>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Rejected
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {leave.employee?.full_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {leave.leave_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {leave.total_days}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {leave.status === 'pending' && (user?.role === 'admin' || user?.role === 'manager') && (
                    <>
                      <button
                        onClick={() => handleApprove(leave.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancel(leave.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveList;