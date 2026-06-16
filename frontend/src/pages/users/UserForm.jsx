import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { employeeApi } from '../../api/employeeApi';
import toast from 'react-hot-toast';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'employee',
    is_active: true
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await userApi.getById(id);
      let userData;
      if (response.data.data) {
        userData = response.data.data;
      } else {
        userData = response.data;
      }
      
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        role: userData.role || 'employee',
        is_active: userData.is_active !== undefined ? userData.is_active : true
      });
    } catch (error) {
      toast.error('Failed to fetch user data');
      navigate('/users');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.update(id, formData);
      toast.success('User updated successfully');
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600">Update user information and permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="form-label">Full Name</label>
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
          <label className="form-label">Email</label>
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
          <label className="form-label">Role</label>
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

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Active Account
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;