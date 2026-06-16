import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
  }, [filterDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let params = {};
      
      if (user?.role === 'admin') {
        // Admin can filter by date
        params = { date: filterDate };
      } else if (user?.role === 'manager') {
        // Manager can filter by date and see department
        params = { date: filterDate };
      } else {
        // Employee - no params needed, backend will get their own records
        params = {};
      }
      
      const response = await attendanceApi.getAll(params);
      console.log('Attendance response:', response.data);
      
      let attendanceData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        attendanceData = response.data.data;
      } else if (response.data.data && response.data.data.attendance && Array.isArray(response.data.data.attendance)) {
        attendanceData = response.data.data.attendance;
      } else if (Array.isArray(response.data)) {
        attendanceData = response.data;
      }
      
      setAttendances(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      // Don't send employee_id - backend will use the logged-in user's employee_id
      const response = await attendanceApi.checkIn({});
      console.log('Check-in response:', response.data);
      toast.success('Checked in successfully!');
      fetchAttendance();
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const response = await attendanceApi.checkOut({});
      console.log('Check-out response:', response.data);
      toast.success('Checked out successfully!');
      fetchAttendance();
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  // Check if user has checked in today
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = attendances.find(a => a.date === todayStr);
  const isCheckedIn = todayAttendance?.check_in && !todayAttendance?.check_out;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'employee' 
              ? 'Track your daily attendance' 
              : 'Monitor employee attendance'}
          </p>
        </div>
        <div className="flex gap-3">
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field w-auto"
            />
          )}
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="btn-primary"
            >
              {checkingIn ? 'Checking In...' : 'Check In'}
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={checkingOut}
              className="btn-primary"
            >
              {checkingOut ? 'Checking Out...' : 'Check Out'}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendances.length > 0 ? (
              attendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(attendance.date), 'MMM dd, yyyy')}
                  </td>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.employee?.full_name || 'Unknown'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.check_in ? format(new Date(attendance.check_in), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.check_out ? format(new Date(attendance.check_out), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      attendance.status === 'half_day' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.working_hours ? `${attendance.working_hours} hrs` : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={(user?.role === 'admin' || user?.role === 'manager') ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceList;