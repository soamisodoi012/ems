// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { departmentApi } from '../../api/departmentApi';
// import { employeeApi } from '../../api/employeeApi';
// import toast from 'react-hot-toast';

// const DepartmentForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [employees, setEmployees] = useState([]);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     manager_id: ''
//   });

//   useEffect(() => {
//     fetchEmployees();
//     if (id) {
//       fetchDepartment();
//     }
//   }, [id]);

//   const fetchEmployees = async () => {
//     try {
//       const response = await employeeApi.getAll();
//       setEmployees(response.data.data);
//     } catch (error) {
//       console.error('Error fetching employees:', error);
//     }
//   };

//   const fetchDepartment = async () => {
//     try {
//       const response = await departmentApi.getById(id);
//       const department = response.data.data;
//       setFormData({
//         name: department.name,
//         description: department.description || '',
//         manager_id: department.manager_id || ''
//       });
//     } catch (error) {
//       toast.error('Failed to fetch department data');
//       navigate('/departments');
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (id) {
//         await departmentApi.update(id, formData);
//         toast.success('Department updated successfully');
//       } else {
//         await departmentApi.create(formData);
//         toast.success('Department created successfully');
//       }
//       navigate('/departments');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to save department');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">
//           {id ? 'Edit Department' : 'Add New Department'}
//         </h1>
//         <p className="text-gray-600">Fill in the department information below</p>
//       </div>

//       <form onSubmit={handleSubmit} className="card space-y-6">
//         <div>
//           <label className="form-label">Department Name *</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className="input-field"
//             placeholder="e.g., Human Resources, Engineering, Sales"
//           />
//         </div>

//         <div>
//           <label className="form-label">Description</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             rows="4"
//             className="input-field"
//             placeholder="Brief description of the department's role and responsibilities"
//           />
//         </div>

//         <div>
//           <label className="form-label">Department Manager</label>
//           <select
//             name="manager_id"
//             value={formData.manager_id}
//             onChange={handleChange}
//             className="input-field"
//           >
//             <option value="">Select Manager</option>
//             {employees.map(emp => (
//               <option key={emp.id} value={emp.id}>{emp.full_name} - {emp.position}</option>
//             ))}
//           </select>
//         </div>

//         <div className="flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={() => navigate('/departments')}
//             className="btn-secondary"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="btn-primary"
//           >
//             {loading ? 'Saving...' : (id ? 'Update Department' : 'Create Department')}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default DepartmentForm;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentApi } from '../../api/departmentApi';
import { employeeApi } from '../../api/employeeApi';
import toast from 'react-hot-toast';

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: ''
  });

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchDepartment();
    }
  }, [id]);

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
      setEmployees([]);
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await departmentApi.getById(id);
      let departmentData;
      if (response.data.data && response.data.data.department) {
        departmentData = response.data.data.department;
      } else if (response.data.data) {
        departmentData = response.data.data;
      } else {
        departmentData = response.data;
      }
      
      setFormData({
        name: departmentData.name || '',
        description: departmentData.description || '',
        manager_id: departmentData.manager_id || ''
      });
    } catch (error) {
      toast.error('Failed to fetch department data');
      navigate('/departments');
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
        await departmentApi.update(id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentApi.create(formData);
        toast.success('Department created successfully');
      }
      navigate('/departments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Department' : 'Add New Department'}
        </h1>
        <p className="text-gray-600">Fill in the department information below</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="form-label">Department Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g., Human Resources, Engineering, Sales"
          />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="input-field"
            placeholder="Brief description of the department's role and responsibilities"
          />
        </div>

        <div>
          <label className="form-label">Department Manager</label>
          <select
            name="manager_id"
            value={formData.manager_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Manager</option>
            {employees && employees.length > 0 ? (
              employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} - {emp.position}
                </option>
              ))
            ) : (
              <option disabled>No employees available</option>
            )}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (id ? 'Update Department' : 'Create Department')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;