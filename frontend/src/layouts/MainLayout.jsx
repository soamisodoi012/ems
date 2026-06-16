import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation based on user role
  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ];

    // Attendance module - available to all authenticated users
    const attendanceModule = { name: 'Attendance', href: '/attendance', icon: ClockIcon };
    
    // Leave module - available to all authenticated users
    const leaveModule = { name: 'Leaves', href: '/leaves', icon: CalendarIcon };

    // Admin/Manager only modules
    const adminManagerModules = [
      { name: 'Employees', href: '/employees', icon: UsersIcon },
      { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
    ];

    // Admin only modules
    const adminOnlyModules = [
      { name: 'Users', href: '/users', icon: UserGroupIcon },
    ];

    // Build navigation based on role
    let navigation = [...baseNavigation];
    
    // Add attendance and leaves for everyone
    navigation.push(attendanceModule);
    navigation.push(leaveModule);
    
    // Add admin/manager modules
    if (user?.role === 'admin' || user?.role === 'manager') {
      navigation.push(...adminManagerModules);
    }
    
    // Add admin only modules
    if (user?.role === 'admin') {
      navigation.push(...adminOnlyModules);
    }
    
    return navigation;
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
          <div className="absolute top-0 right-0 p-2">
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <SidebarContent user={user} navigation={navigation} onLogout={handleLogout} isActive={isActive} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent user={user} navigation={navigation} onLogout={handleLogout} isActive={isActive} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 bg-white shadow-sm lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500">
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">Employee Management</h1>
            <div className="w-10" />
          </div>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ user, navigation, onLogout, isActive }) => (
  <div className="flex flex-col flex-1 h-full bg-white border-r">
    <div className="flex items-center justify-center h-16 border-b">
      <h1 className="text-xl font-bold text-primary-600">EMS</h1>
    </div>
    <div className="flex-1 px-4 py-6 space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`flex items-center px-4 py-2 rounded-lg group transition-colors ${
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon className={`w-5 h-5 mr-3 ${
            isActive(item.href) ? 'text-primary-700' : 'text-gray-500'
          }`} />
          {item.name}
        </Link>
      ))}
    </div>
    <div className="p-4 border-t">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center w-full px-4 py-2 text-red-600 rounded-lg hover:bg-red-50"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
        Logout
      </button>
    </div>
  </div>
);

export default MainLayout;