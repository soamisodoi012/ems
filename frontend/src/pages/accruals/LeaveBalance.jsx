import React, { useEffect, useState } from 'react';
import { leaveApi } from '../../api/leaveApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LeaveBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await leaveApi.getLeaveBalance(user?.employee_id);
      setBalance(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch leave balance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!balance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No leave balance information available</p>
      </div>
    );
  }

  const leaveTypes = [
    { name: 'Vacation Leave', balance: balance.vacation_balance, used: balance.vacation_used, total: balance.vacation_total_accrued, color: 'blue' },
    { name: 'Sick Leave', balance: balance.sick_balance, used: balance.sick_used, total: balance.sick_total_accrued, color: 'green' },
    { name: 'Personal Leave', balance: balance.personal_balance, used: balance.personal_used, total: balance.personal_total_accrued, color: 'purple' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Balance</h1>
        <p className="text-gray-600">View your current leave balances and usage</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {leaveTypes.map((type) => (
          <div key={type.name} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{type.name}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-gray-900">{type.balance}</span>
                <span className="text-sm text-gray-500">days available</span>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      Used: {type.used} days
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      Total: {type.total} days
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${(type.used / type.total) * 100}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${type.color}-500`}
                  ></div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Accrual Rate: {type.name === 'Vacation Leave' ? balance.accrual_rate_vacation : 
                                 type.name === 'Sick Leave' ? balance.accrual_rate_sick : 
                                 balance.accrual_rate_personal} days/month</p>
                {type.name === 'Vacation Leave' && (
                  <p>Max Balance: {balance.max_vacation_balance} days</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accrual Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Last Accrual Date</p>
            <p className="font-medium">{balance.last_accrual_date || 'Not yet accrued'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Accrual Date</p>
            <p className="font-medium">{balance.next_accrual_date || 'To be determined'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;