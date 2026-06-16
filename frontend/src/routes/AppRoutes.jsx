// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import MainLayout from '../layouts/MainLayout';
// import AuthLayout from '../layouts/AuthLayout';

// // Auth Pages
// import Login from '../pages/auth/Login';

// // Dashboard
// import Dashboard from '../pages/dashboard/Dashboard';

// // Employees
// import EmployeeList from '../pages/employees/EmployeeList';
// import EmployeeForm from '../pages/employees/EmployeeForm';
// import EmployeeDetails from '../pages/employees/EmployeeDetails';

// // Departments
// import DepartmentList from '../pages/departments/DepartmentList';
// import DepartmentForm from '../pages/departments/DepartmentForm';
// import DepartmentDetails from '../pages/departments/DepartmentDetails'; // Add this import

// // Attendance
// import AttendanceList from '../pages/attendance/AttendanceList';

// // Leaves
// import LeaveList from '../pages/leaves/LeaveList';
// import LeaveRequest from '../pages/leaves/LeaveRequest';
// import LeaveBalance from '../pages/accruals/LeaveBalance';

// // Users
// import UserList from '../pages/users/UserList';

// // Protected Route wrapper component
// const ProtectedRouteWrapper = ({ children, allowedRoles = [] }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }
  
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
  
//   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/dashboard" replace />;
//   }
  
//   return children;
// };

// const AppRoutes = () => {
//   const { user, loading } = useAuth();
  
//   // Show loading while checking auth
//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }
  
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route element={<AuthLayout />}>
//         <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
//       </Route>

//       {/* Protected Routes with MainLayout */}
//       <Route element={<MainLayout />}>
//         <Route path="/dashboard" element={
//           <ProtectedRouteWrapper>
//             <Dashboard />
//           </ProtectedRouteWrapper>
//         } />
        
//         {/* Employee Routes */}
//         <Route path="/employees">
//           <Route index element={
//             <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
//               <EmployeeList />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path="new" element={
//             <ProtectedRouteWrapper allowedRoles={['admin']}>
//               <EmployeeForm />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path=":id" element={
//             <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
//               <EmployeeDetails />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path=":id/edit" element={
//             <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
//               <EmployeeForm />
//             </ProtectedRouteWrapper>
//           } />
//         </Route>

//         {/* Department Routes */}
//         <Route path="/departments">
//           <Route index element={
//             <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
//               <DepartmentList />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path="new" element={
//             <ProtectedRouteWrapper allowedRoles={['admin']}>
//               <DepartmentForm />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path=":id" element={
//             <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
//               <DepartmentDetails />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path=":id/edit" element={
//             <ProtectedRouteWrapper allowedRoles={['admin']}>
//               <DepartmentForm />
//             </ProtectedRouteWrapper>
//           } />
//         </Route>

//         {/* Attendance Routes */}
//         <Route path="/attendance" element={
//           <ProtectedRouteWrapper>
//             <AttendanceList />
//           </ProtectedRouteWrapper>
//         } />
        
//         {/* Leave Routes */}
//         <Route path="/leaves">
//           <Route index element={
//             <ProtectedRouteWrapper>
//               <LeaveList />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path="request" element={
//             <ProtectedRouteWrapper>
//               <LeaveRequest />
//             </ProtectedRouteWrapper>
//           } />
//           <Route path="balance" element={
//             <ProtectedRouteWrapper>
//               <LeaveBalance />
//             </ProtectedRouteWrapper>
//           } />
//         </Route>

//         {/* User Routes - Admin Only */}
//         <Route path="/users" element={
//           <ProtectedRouteWrapper allowedRoles={['admin']}>
//             <UserList />
//           </ProtectedRouteWrapper>
//         } />
        
//       </Route>

//       {/* Default redirect */}
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// };

// export default AppRoutes;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Employees
import EmployeeList from '../pages/employees/EmployeeList';
import EmployeeForm from '../pages/employees/EmployeeForm';
import EmployeeDetails from '../pages/employees/EmployeeDetails';

// Departments
import DepartmentList from '../pages/departments/DepartmentList';
import DepartmentForm from '../pages/departments/DepartmentForm';
import DepartmentDetails from '../pages/departments/DepartmentDetails';

// Attendance
import AttendanceList from '../pages/attendance/AttendanceList';

// Leaves
import LeaveList from '../pages/leaves/LeaveList';
import LeaveRequest from '../pages/leaves/LeaveRequest';
import LeaveBalance from '../pages/accruals/LeaveBalance';

// Users
import UserList from '../pages/users/UserList';
import UserForm from '../pages/users/UserForm'; // Add this import

// Protected Route wrapper component
const ProtectedRouteWrapper = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* Protected Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={
          <ProtectedRouteWrapper>
            <Dashboard />
          </ProtectedRouteWrapper>
        } />
        
        {/* Employee Routes */}
        <Route path="/employees">
          <Route index element={
            <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
              <EmployeeList />
            </ProtectedRouteWrapper>
          } />
          <Route path="new" element={
            <ProtectedRouteWrapper allowedRoles={['admin']}>
              <EmployeeForm />
            </ProtectedRouteWrapper>
          } />
          <Route path=":id" element={
            <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
              <EmployeeDetails />
            </ProtectedRouteWrapper>
          } />
          <Route path=":id/edit" element={
            <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
              <EmployeeForm />
            </ProtectedRouteWrapper>
          } />
        </Route>

        {/* Department Routes */}
        <Route path="/departments">
          <Route index element={
            <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
              <DepartmentList />
            </ProtectedRouteWrapper>
          } />
          <Route path="new" element={
            <ProtectedRouteWrapper allowedRoles={['admin']}>
              <DepartmentForm />
            </ProtectedRouteWrapper>
          } />
          <Route path=":id" element={
            <ProtectedRouteWrapper allowedRoles={['admin', 'manager']}>
              <DepartmentDetails />
            </ProtectedRouteWrapper>
          } />
          <Route path=":id/edit" element={
            <ProtectedRouteWrapper allowedRoles={['admin']}>
              <DepartmentForm />
            </ProtectedRouteWrapper>
          } />
        </Route>

        {/* Attendance Routes */}
        <Route path="/attendance" element={
          <ProtectedRouteWrapper>
            <AttendanceList />
          </ProtectedRouteWrapper>
        } />
        
        {/* Leave Routes */}
        <Route path="/leaves">
          <Route index element={
            <ProtectedRouteWrapper>
              <LeaveList />
            </ProtectedRouteWrapper>
          } />
          <Route path="request" element={
            <ProtectedRouteWrapper>
              <LeaveRequest />
            </ProtectedRouteWrapper>
          } />
          <Route path="balance" element={
            <ProtectedRouteWrapper>
              <LeaveBalance />
            </ProtectedRouteWrapper>
          } />
        </Route>

        {/* User Routes - Admin Only */}
        <Route path="/users">
          <Route index element={
            <ProtectedRouteWrapper allowedRoles={['admin']}>
              <UserList />
            </ProtectedRouteWrapper>
          } />
          <Route path=":id/edit" element={
            <ProtectedRouteWrapper allowedRoles={['admin']}>
              <UserForm />
            </ProtectedRouteWrapper>
          } />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;