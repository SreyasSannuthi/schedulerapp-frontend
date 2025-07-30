import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_DOCTORS, GET_PATIENTS } from '../apollo/queries';
import AppointmentCalendar from './Calendar';
import AppointmentsList from './AppointmentsList';
import UserManagement from './UserManagement';
import BranchManagement from './BranchManagement';
import DoctorBranchDetails from './DoctorBranchDetails';
import ActivityLogs from './ActivityLogs';
import {
  Menu,
  X,
  Calendar,
  ClipboardList,
  Users,
  Building2,
  User,
  LogOut,
  Crown,
  UserCheck,
  PhoneCall,
  Stethoscope,
  History
} from 'lucide-react';

function Dashboard() {
  const { currentUser, logout, isAdmin, hasFullAccess } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const { data: doctorsData } = useQuery(GET_DOCTORS, { skip: !isAdmin });
  const { data: patientsData } = useQuery(GET_PATIENTS, { skip: !isAdmin });

  const users = [
    ...(doctorsData?.doctors || []),
    ...(patientsData?.patients || []),
  ];

  const getMenuItems = () => {
    const baseItems = [
      { id: 'appointments', label: 'Appointments', icon: ClipboardList },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'branches', label: 'Branch Management', icon: Building2 },
        { id: 'activityLogs' , label: 'Activity Logs', icon: History },
      ];
    } else if (hasFullAccess) {
      return baseItems;
    }
    else if (currentUser?.role === 'receptionist') {
      return [
        ...baseItems,
        { id: 'branch-details', label: 'My Branch', icon: Building2 },
      ];
    }
    else if (currentUser?.role === 'doctor') {
      return [
        ...baseItems,
        { id: 'branch-details', label: 'Branch Details', icon: Building2 },
      ];
    } else {
      return [
        ...baseItems,
        { id: 'profile', label: 'My Profile', icon: User },
      ];
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return Crown;
      case 'doctor': return UserCheck;
      case 'patient': return User;
      case 'receptionist': return Building2;
      case 'customer_care': return PhoneCall;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-500 text-white';
      case 'doctor': return 'bg-blue-500 text-white';
      case 'patient': return 'bg-green-500 text-white';
      case 'receptionist': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDashboardTitle = () => {
    switch (currentUser?.role?.toLowerCase()) {
      case 'admin': return 'Admin Dashboard';
      case 'customer_care': return 'Customer Care Portal';
      case 'doctor': return 'Doctor Portal';
      case 'patient': return 'Patient Portal';
      case 'receptionist': return 'Receptionist Dashboard';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        const appointmentUserId = (isAdmin || hasFullAccess) ? null : currentUser?.id;
                    return <AppointmentsList selectedUserId={appointmentUserId} />;
      case 'calendar':
        return <AppointmentCalendar selectedUserId={isAdmin ? null : currentUser?.id} />;
      case 'users':
        return isAdmin ? <UserManagement users={users} /> : null;
      case 'branches':
        return isAdmin ? <BranchManagement /> : null;
      case 'branch-details':
        return (currentUser?.role === 'doctor' || currentUser?.role === 'receptionist') ? <DoctorBranchDetails doctorId={currentUser.id} /> : null;
      case 'profile':
        return <UserProfile />;
      case 'activityLogs':
        return isAdmin ? <ActivityLogs /> : null;
      default:
        return <AppointmentsList selectedUserId={isAdmin ? null : currentUser?.id} />;
    }
  };

  const menuItems = getMenuItems();
  const RoleIcon = getRoleIcon(currentUser?.role);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">SchedulerApp</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === item.id
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getRoleColor(currentUser?.role)}`}>
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 uppercase">
                {currentUser?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{getDashboardTitle()}</h1>
              <p className="text-sm text-gray-500">Welcome back, {currentUser?.name || 'User'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser?.role)}`}>
              <RoleIcon className="w-3 h-3 inline mr-1" />
              {currentUser?.role?.toUpperCase()}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="hidden md:block font-medium">{currentUser?.name}</span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function UserProfile() {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{currentUser?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{currentUser?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <p className="text-gray-900">{currentUser?.role}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <p className="text-gray-900">{currentUser?.id}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;