import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveApi } from '../../api/leaveApi';
import toast from 'react-hot-toast';

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: '',
    attachment_url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalDays = calculateDays();
    if (totalDays <= 0) {
      toast.error('Please select valid dates');
      return;
    }

    setLoading(true);
    try {
      await leaveApi.applyLeave({
        ...formData,
        total_days: totalDays
      });
      toast.success('Leave request submitted successfully');
      navigate('/leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Leave</h1>
        <p className="text-gray-600">Submit a new leave request</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="form-label">Leave Type *</label>
          <select
            name="leave_type"
            value={formData.leave_type}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="unpaid">Unpaid Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="paternity">Paternity Leave</option>
            <option value="bereavement">Bereavement Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">End Date *</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              min={formData.start_date || new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>
        </div>

        {formData.start_date && formData.end_date && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Total days requested: <strong>{calculateDays()}</strong> day(s)
            </p>
          </div>
        )}

        <div>
          <label className="form-label">Reason *</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="4"
            className="input-field"
            placeholder="Please provide a detailed reason for your leave request"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/leaves')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequest;