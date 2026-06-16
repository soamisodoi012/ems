import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../../api/employeeApi';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { exportEmployeesToCSV } from '../../utils/csvExport';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      console.log('Employee API response:', response.data);
      
      let employeesData = [];
      if (response.data.data && response.data.data.employees) {
        employeesData = response.data.data.employees;
      } else if (Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      }
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeApi.delete(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEdit = (id) => {
    navigate(`/employees/${id}/edit`);
  };

  // CSV Export function using utility
  const handleExportCSV = async () => {
    if (filteredEmployees.length === 0) {
      toast.error('No employees to export');
      return;
    }
    
    setExporting(true);
    try {
      await exportEmployeesToCSV(filteredEmployees, 'employees');
      toast.success(`Exported ${filteredEmployees.length} employees to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export employees');
    } finally {
      setExporting(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage employee information and records</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filteredEmployees.length === 0}
            className="btn-secondary flex items-center"
            title="Export to CSV"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => navigate('/employees/new')}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search employees by name, email, code, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md"
        />
        <p className="text-sm text-gray-500">
          Showing {filteredEmployees.length} of {employees.length} employees
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employee_code || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(employee)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View Employee"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(employee.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Edit Employee"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Employee"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No employees match your search' : 'No employees found. Click "Add Employee" to create one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Employee Modal */}
      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsViewModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Employee Code</label>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee_code || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className="font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedEmployee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEmployee.status}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-medium text-gray-900">{selectedEmployee.full_name}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-700">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="text-gray-700">{selectedEmployee.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Position</label>
                    <p className="text-gray-700">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Department</label>
                    <p className="text-gray-700">{selectedEmployee.department?.name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Manager</label>
                    <p className="text-gray-700">{selectedEmployee.manager?.full_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Salary</label>
                    <p className="text-gray-700">${selectedEmployee.salary?.toLocaleString() || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Employment Date</label>
                    <p className="text-gray-700">{new Date(selectedEmployee.employment_date).toLocaleDateString()}</p>
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
                    handleEdit(selectedEmployee.id);
                  }}
                  className="btn-primary"
                >
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;