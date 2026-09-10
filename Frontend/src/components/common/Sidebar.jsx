import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { ALL_MODULES } from '../../config/modules.config';
import {
  FiHome, FiUsers, FiShoppingBag, FiPackage, FiGrid,
  FiShoppingCart, FiCreditCard, FiStar, FiBarChart2,
  FiShield, FiBell, FiSettings, FiUser, FiChevronDown,
  FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';

const iconMap = {
  FiHome, FiUsers, FiShoppingBag, FiPackage, FiGrid,
  FiShoppingCart, FiCreditCard, FiStar, FiBarChart2,
  FiShield, FiBell, FiSettings, FiUser
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState([]);
  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.role?.roleName || user?.role_name || 'customer';
  const userPermissions = user?.role?.permissions || user?.permissions || [];

  const visibleModules = useMemo(() => {
    return ALL_MODULES
      .filter(module => {
        if (!module.roles.includes(userRole)) return false;
        if (module.permission && !userPermissions.includes(module.permission)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [userRole, userPermissions]);

  const toggleExpand = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isModuleActive = (module) => {
    return location.pathname.startsWith(module.path);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div className={`fixed lg:relative z-40 w-64 h-full bg-indigo-800 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-center h-16 border-b border-indigo-700">
          <span className="text-xl font-bold">E-Commerce</span>
          <span className="text-xs text-indigo-300 ml-1">Admin</span>
        </div>

        <div className="px-4 py-3 border-b border-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-bold">
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.name || 'Admin'}
              </p>
              <p className="text-xs text-indigo-300 capitalize">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-12rem)]">
          {visibleModules.map((module) => {
            const Icon = iconMap[module.icon];
            const isExpanded = expandedModules.includes(module.id);
            const isActive = isModuleActive(module);

            return (
              <NavLink
                key={module.id}
                to={module.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`
                }
              >
                {Icon && <Icon className="w-5 h-5 mr-3" />}
                <span className="text-sm font-medium">{module.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;