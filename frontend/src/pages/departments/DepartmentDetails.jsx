import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { departmentApi } from '../../api/departmentApi';
import { BuildingOfficeIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const response = await departmentApi.getById(id);
      console.log('Department details:', response.data);
      
      let departmentData;
      if (response.data.data && response.data.data.department) {
        departmentData = response.data.data.department;
      } else if (response.data.data) {
        departmentData = response.data.data;
      } else {
        departmentData = response.data;
      }
      
      setDepartment(departmentData);
    } catch (error) {
      toast.error('Failed to fetch department details');
      navigate('/departments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!department) {
    return <div className="text-center py-12">Department not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/departments')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
        >
          ← Back to Departments
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-gray-600 mt-1">{department.description || 'No description'}</p>
          </div>
          <button
            onClick={() => navigate(`/departments/${id}/edit`)}
            className="btn-primary"
          >
            Edit Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Department Info</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Department Name</p>
              <p className="font-medium">{department.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{department.description || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-medium">{new Date(department.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="w-8 h-8 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Department Manager</h3>
          </div>
          {department.manager ? (
            <div className="space-y-2">
              <p className="font-medium">{department.manager.full_name}</p>
              <p className="text-sm text-gray-500">{department.manager.position}</p>
              <p className="text-sm text-gray-500">{department.manager.email}</p>
            </div>
          ) : (
            <p className="text-gray-500">No manager assigned</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-8 h-8 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Employees</h3>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold text-gray-900">{department.employees?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Employees</p>
            {department.employees && department.employees.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Employee List:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {department.employees.map(emp => (
                    <div key={emp.id} className="text-sm">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-gray-500">{emp.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;