import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';
import { useAppSelector } from '../../store/hooks';
import { FiLogOut, FiUser, FiBell } from 'react-icons/fi';

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome back, {user?.firstName || user?.name || 'Admin'}!
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiUser className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.firstName || user?.name || 'Admin'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;