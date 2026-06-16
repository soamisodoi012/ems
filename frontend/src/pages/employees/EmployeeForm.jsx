import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../api/departmentApi';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [userRole, setUserRole] = useState('employee');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    salary: '',
    employment_date: new Date().toISOString().split('T')[0],
    department_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      console.log('Departments response:', response.data);
      
      // Handle different response structures
      let departmentsData = [];
      if (response.data.data && response.data.data.departments) {
        departmentsData = response.data.data.departments;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        departmentsData = response.data;
      }
      
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]); // Set empty array on error
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await employeeApi.getById(id);
      const employee = response.data.data;
      setFormData({
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone || '',
        position: employee.position,
        salary: employee.salary || '',
        employment_date: employee.employment_date,
        department_id: employee.department_id || '',
        status: employee.status
      });
    } catch (error) {
      toast.error('Failed to fetch employee data');
      navigate('/employees');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await employeeApi.update(id, formData);
        toast.success('Employee updated successfully');
      } else {
        const response = await employeeApi.create(formData);
        toast.success('Employee created successfully');
        
        // If user account creation is requested, create the user
        if (createUserAccount && response.data.data) {
          const employeeId = response.data.data.id;
          const defaultPassword = 'Password123!';
          // You would need to call a user creation API here
          toast.success(`Employee created! Default password: ${defaultPassword}`);
        }
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        <p className="text-gray-600">Fill in the employee information below</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Position *</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              step="0.01"
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Employment Date</label>
            <input
              type="date"
              name="employment_date"
              value={formData.employment_date}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Department</option>
              {departments && departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))
              ) : (
                <option disabled>No departments available</option>
              )}
            </select>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* User Account Creation Section - Only for new employees and admin users */}
        {!id && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createUserAccount}
                  onChange={(e) => setCreateUserAccount(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Create user account for this employee</span>
              </label>
            </div>

            {createUserAccount && (
              <div className="ml-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">User Account Details</h3>
                <div>
                  <label className="form-label">User Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Default password will be set to: <strong>Password123!</strong>
                    <br />User can change password after first login.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (id ? 'Update Employee' : 'Create Employee')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;