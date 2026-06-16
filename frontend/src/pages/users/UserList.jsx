import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { employeeApi } from '../../api/employeeApi';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
    employee_id: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll();
      console.log('Users response:', response.data);
      
      // Handle different response structures
      let usersData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      console.log('Employees response:', response.data);
      
      // Handle different response structures
      let employeesData = [];
      if (response.data.data && response.data.data.employees) {
        employeesData = response.data.data.employees;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      }
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // If employee is selected, auto-fill name and email
    if (e.target.name === 'employee_id' && e.target.value) {
      const selectedEmployee = employees.find(emp => emp.id === e.target.value);
      if (selectedEmployee) {
        setFormData(prev => ({
          ...prev,
          employee_id: selectedEmployee.id,
          full_name: selectedEmployee.full_name,
          email: selectedEmployee.email
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userApi.create(formData);
      toast.success('User created successfully');
      setIsModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'employee',
        employee_id: ''
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  // Filter employees that don't have user accounts yet
  const availableEmployees = employees.filter(emp => 
    !users.some(user => user.employee_id === emp.id)
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create User
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.employee?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View User"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Edit User"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No users found. Click "Create User" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Users must be linked to an existing employee record. Create the employee first if needed.
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label">Select Employee *</label>
                    <select
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="">Choose an employee</option>
                      {availableEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      disabled
                      className="input-field bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled
                      className="input-field bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Enter a secure password"
                    />
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="form-label">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsViewModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-medium text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Role</label>
                    <p className="font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        selectedUser.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className="font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Associated Employee</label>
                    <p className="font-medium text-gray-900">
                      {selectedUser.employee?.full_name || 'No employee associated'}
                    </p>
                    {selectedUser.employee?.position && (
                      <p className="text-sm text-gray-500">{selectedUser.employee.position}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Created Date</label>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                  className="btn-primary"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;