import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="container flex items-center justify-center min-h-screen px-4 py-12 mx-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">Employee Management System</h1>
            <p className="mt-2 text-primary-100">Manage your workforce efficiently</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;