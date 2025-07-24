import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_DOCTORS, GET_PATIENTS, DELETE_DOCTOR,DELETE_PATIENT } from '../apollo/queries';
import { useToast } from './Toast';
import SignupForm from './SignupForm';
import {
  Users,
  UserPlus,
  Trash2,
  Crown,
  UserCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react';

function UserManagement() {
  const { showSuccess, showError } = useToast();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: doctorsData, loading: loadingDoctors, refetch: refetchDoctors } = useQuery(GET_DOCTORS);
  const { data: patientsData, loading: loadingPatients, refetch: refetchPatients } = useQuery(GET_PATIENTS);

  const [deleteDoctor] = useMutation(DELETE_DOCTOR, {
    refetchQueries: [{ query: GET_DOCTORS }],
    onCompleted: () => {
      showSuccess('Doctor deleted successfully');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    },
    onError: (error) => showError(`Failed to delete doctor: ${error.message}`)
  });

  const [deletePatient] = useMutation(DELETE_PATIENT, {
    refetchQueries: [{ query: GET_PATIENTS }],
    onCompleted: () => {
      showSuccess('Patient deleted successfully');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    },
    onError: (error) => showError(`Failed to delete patient: ${error.message}`)
  });

  if (loadingDoctors || loadingPatients) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  const allUsers = [
    ...(doctorsData?.doctors || []).map(doctor => ({ ...doctor, userType: 'doctor' })),
    ...(patientsData?.patients || []).map(patient => ({ ...patient, userType: 'patient' }))
  ];

  // Filter users based on role and search term
  const filteredUsers = allUsers.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      if (userToDelete.userType === 'doctor') {
        await deleteDoctor({ variables: { id: userToDelete.id } });
      } else {
        await deletePatient({ variables: { id: userToDelete.id } });
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return Crown;
      case 'doctor': return UserCheck;
      case 'patient': return User;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patient': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStats = () => {
    const totalUsers = allUsers.length;
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    const doctorCount = allUsers.filter(u => u.role === 'doctor').length;
    const patientCount = allUsers.filter(u => u.role === 'patient').length;

    return { totalUsers, adminCount, doctorCount, patientCount };
  };

  const stats = getStats();

  if (showCreateUser) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setShowCreateUser(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to User Management
          </button>
        </div>
        <SignupForm
          onSwitchToLogin={() => {
            setShowCreateUser(false);
            refetchDoctors();
            refetchPatients();
          }}
          isAdminCreating={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            User Management
          </h2>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">{stats.adminCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Doctors</p>
              <p className="text-2xl font-bold text-blue-600">{stats.doctorCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-green-600">{stats.patientCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          const isAdmin = user.role === 'admin';

          return (
            <div key={user.id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${getRoleColor(user.role)} border`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
                {!isAdmin && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{user.email}</span>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}

                {user.age && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Age: {user.age}</span>
                  </div>
                )}

                {user.userType === 'doctor' && (
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Joined: {(() => {
                      if (!user.startDate) {
                        return 'N/A';
                      }
                      try {
                        const dateStr = user.startDate;
                        if (typeof dateStr === 'string' && dateStr.includes(' - ')) {
                          const datePart = dateStr.split(' - ')[0];
                          const date = new Date(datePart);
                          return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
                        } else {
                          const date = new Date(dateStr);
                          return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
                        }
                      } catch (error) {
                        return user.startDate || 'N/A';
                      }
                    })()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm || filterRole !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first user to get started.'
            }
          </p>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
                This action cannot be undone and will remove all associated data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;