import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      const [empRes, attendanceRes, balanceRes] = await Promise.all([
        employeeApi.getById(id),
        attendanceApi.getAll({ employee_id: id, limit: 10 }),
        leaveApi.getLeaveBalance(id)
      ]);
      
      setEmployee(empRes.data.data);
      setAttendance(attendanceRes.data.data || []);
      setLeaveBalance(balanceRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch employee data');
      navigate('/employees');
    }
  };

  if (!employee) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
        >
          ← Back to Employees
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
            <p className="text-gray-600">{employee.position}</p>
          </div>
          <button
            onClick={() => navigate(`/employees/${id}/edit`)}
            className="btn-primary"
          >
            Edit Employee
          </button>
        </div>
      </div>

      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          {['info', 'attendance', 'leaves'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{employee.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{employee.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employee Code</p>
                <p className="font-medium">{employee.employee_code || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{employee.department?.name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-medium">${employee.salary?.toLocaleString() || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Date</p>
                <p className="font-medium">{format(new Date(employee.employment_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  employee.status === 'active' ? 'bg-green-100 text-green-800' :
                  employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  employee.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          {leaveBalance && (
            <div className="card lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balances</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Vacation Balance</p>
                  <p className="text-2xl font-bold text-blue-900">{leaveBalance.vacation_balance} days</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Sick Leave Balance</p>
                  <p className="text-2xl font-bold text-green-900">{leaveBalance.sick_balance} days</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Personal Leave Balance</p>
                  <p className="text-2xl font-bold text-purple-900">{leaveBalance.personal_balance} days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.working_hours || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave History</h3>
          <p className="text-gray-500">Leave history component will be implemented here</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;