import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../api/departmentApi';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { UsersIcon, BuildingOfficeIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // For admin/manager - show all data
      if (user?.role === 'admin' || user?.role === 'manager') {
        // Fetch employees
        const employeesRes = await employeeApi.getAll();
        let employees = [];
        if (employeesRes.data.data && employeesRes.data.data.employees) {
          employees = employeesRes.data.data.employees;
        } else if (Array.isArray(employeesRes.data.data)) {
          employees = employeesRes.data.data;
        }
        
        // Fetch departments
        const departmentsRes = await departmentApi.getAll();
        let departments = [];
        if (departmentsRes.data.data && departmentsRes.data.data.departments) {
          departments = departmentsRes.data.data.departments;
        } else if (Array.isArray(departmentsRes.data.data)) {
          departments = departmentsRes.data.data;
        }
        
        // Fetch today's attendance
        const attendanceRes = await attendanceApi.getAll({ date: format(new Date(), 'yyyy-MM-dd') });
        let attendance = [];
        if (attendanceRes.data.data && Array.isArray(attendanceRes.data.data)) {
          attendance = attendanceRes.data.data;
        } else if (Array.isArray(attendanceRes.data)) {
          attendance = attendanceRes.data;
        }
        
        // Fetch pending leaves
        const leavesRes = await leaveApi.getAll({ status: 'pending' });
        let leaves = [];
        if (leavesRes.data.data && Array.isArray(leavesRes.data.data)) {
          leaves = leavesRes.data.data;
        } else if (Array.isArray(leavesRes.data)) {
          leaves = leavesRes.data;
        }
        
        const presentToday = attendance.filter(a => a.status === 'present').length;
        const absentToday = employees.length - attendance.length;
        
        setStats({
          totalEmployees: employees.length || 0,
          totalDepartments: departments.length || 0,
          presentToday: presentToday || 0,
          absentToday: absentToday > 0 ? absentToday : 0,
          pendingLeaves: leaves.length || 0
        });
        
        setRecentLeaves(leaves.slice(0, 5));
        setTodayAttendance(attendance.slice(0, 5));
      } 
      // For employee - show personal stats
      else {
        // Fetch employee's attendance
        const attendanceRes = await attendanceApi.getAll();
        let attendance = [];
        if (attendanceRes.data.data && Array.isArray(attendanceRes.data.data)) {
          attendance = attendanceRes.data.data;
        } else if (Array.isArray(attendanceRes.data)) {
          attendance = attendanceRes.data;
        }
        
        // Fetch employee's leaves
        const leavesRes = await leaveApi.getAll();
        let leaves = [];
        if (leavesRes.data.data && Array.isArray(leavesRes.data.data)) {
          leaves = leavesRes.data.data;
        } else if (Array.isArray(leavesRes.data)) {
          leaves = leavesRes.data;
        }
        
        // Calculate attendance stats for the month
        const currentMonth = format(new Date(), 'yyyy-MM');
        const monthlyAttendance = attendance.filter(a => a.date.startsWith(currentMonth));
        const presentDays = monthlyAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const absentDays = monthlyAttendance.filter(a => a.status === 'absent').length;
        
        setStats({
          totalEmployees: 0, // Not applicable for employees
          totalDepartments: 0, // Not applicable for employees
          presentToday: monthlyAttendance.filter(a => a.date === format(new Date(), 'yyyy-MM-dd') && (a.status === 'present' || a.status === 'late')).length,
          absentToday: monthlyAttendance.filter(a => a.date === format(new Date(), 'yyyy-MM-dd') && a.status === 'absent').length,
          pendingLeaves: leaves.filter(l => l.status === 'pending').length,
          monthlyPresent: presentDays,
          monthlyAbsent: absentDays,
          totalLeaves: leaves.length
        });
        
        setRecentLeaves(leaves.filter(l => l.status === 'pending').slice(0, 5));
        setTodayAttendance(attendance.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Admin/Manager Dashboard
  if (user?.role === 'admin' || user?.role === 'manager') {
    const statCards = [
      { title: 'Total Employees', value: stats.totalEmployees, icon: UsersIcon, color: 'blue' },
      { title: 'Total Departments', value: stats.totalDepartments, icon: BuildingOfficeIcon, color: 'purple' },
      { title: 'Present Today', value: stats.presentToday, icon: CheckCircleIcon, color: 'green' },
      { title: 'Absent Today', value: stats.absentToday, icon: XCircleIcon, color: 'red' },
    ];

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}!</h1>
          <p className="text-gray-600">Here's an overview of your organization</p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`bg-${stat.color}-500 p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending Leave Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Leave Requests 
              {stats.pendingLeaves > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {stats.pendingLeaves} pending
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {recentLeaves.length > 0 ? (
                recentLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{leave.employee?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 capitalize">{leave.leave_type} - {leave.total_days} days</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      {leave.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No pending leave requests</p>
              )}
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Attendance
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({stats.presentToday} present / {stats.absentToday} absent)
              </span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayAttendance.length > 0 ? (
                todayAttendance.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{attendance.employee?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {attendance.check_in ? format(new Date(attendance.check_in), 'hh:mm a') : 'Not checked in'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No attendance records for today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}!</h1>
        <p className="text-gray-600">Your personal attendance and leave summary</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Status</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.presentToday > 0 ? 'Present' : stats.absentToday > 0 ? 'Absent' : 'Not Recorded'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Leave Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingLeaves || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.monthlyPresent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.monthlyAbsent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Recent Leave Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Leave Requests</h3>
          <div className="space-y-3">
            {recentLeaves.length > 0 ? (
              recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 capitalize">{leave.leave_type}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No leave requests found</p>
            )}
          </div>
        </div>

        {/* My Recent Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Attendance</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayAttendance.length > 0 ? (
              todayAttendance.map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">{format(new Date(attendance.date), 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-gray-500">
                      {attendance.check_in ? format(new Date(attendance.check_in), 'hh:mm a') : 'Not checked in'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                    attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {attendance.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No attendance records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;