// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { departmentApi } from '../../api/departmentApi';
// import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const DepartmentList = () => {
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   const fetchDepartments = async () => {
//     try {
//       const response = await departmentApi.getAll();
//       setDepartments(response.data.data);
//     } catch (error) {
//       toast.error('Failed to fetch departments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this department?')) {
//       try {
//         await departmentApi.delete(id);
//         toast.success('Department deleted successfully');
//         fetchDepartments();
//       } catch (error) {
//         toast.error('Failed to delete department');
//       }
//     }
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center h-64">Loading...</div>;
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
//         <button
//           onClick={() => navigate('/departments/new')}
//           className="btn-primary flex items-center"
//         >
//           <PlusIcon className="w-5 h-5 mr-2" />
//           Add Department
//         </button>
//       </div>

//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {departments.map((department) => (
//           <div key={department.id} className="card hover:shadow-lg transition-shadow">
//             <div className="flex justify-between items-start mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => navigate(`/departments/${department.id}/edit`)}
//                   className="text-green-600 hover:text-green-900"
//                 >
//                   <PencilIcon className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => handleDelete(department.id)}
//                   className="text-red-600 hover:text-red-900"
//                 >
//                   <TrashIcon className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//             <p className="text-gray-600 text-sm mb-3">{department.description || 'No description'}</p>
//             <div className="text-sm text-gray-500">
//               <p>Manager: {department.manager?.full_name || 'Not assigned'}</p>
//               <p>Employees: {department.employees?.length || 0}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {departments.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-gray-500">No departments found. Click "Add Department" to create one.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DepartmentList;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentApi } from '../../api/departmentApi';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      console.log('Department API response:', response.data);
      
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
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApi.delete(id);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const handleView = (department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleEdit = (id) => {
    navigate(`/departments/${id}/edit`);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage company departments and their managers</p>
        </div>
        <button
          onClick={() => navigate('/departments/new')}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Department
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search departments by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {department.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {department.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {department.manager?.full_name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {department.employees?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(department)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View Department"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(department.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Edit Department"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Department"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No departments match your search' : 'No departments found. Click "Add Department" to create one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Department Modal */}
      {isViewModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsViewModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Department Details</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Department Name</label>
                    <p className="font-medium text-gray-900">{selectedDepartment.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Total Employees</label>
                    <p className="font-medium text-gray-900">{selectedDepartment.employees?.length || 0}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="text-gray-700">{selectedDepartment.description || 'No description provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Department Manager</label>
                    {selectedDepartment.manager ? (
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{selectedDepartment.manager.full_name}</p>
                        <p className="text-sm text-gray-500">{selectedDepartment.manager.position}</p>
                        <p className="text-sm text-gray-500">{selectedDepartment.manager.email}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-1">No manager assigned</p>
                    )}
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
                    handleEdit(selectedDepartment.id);
                  }}
                  className="btn-primary"
                >
                  Edit Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;