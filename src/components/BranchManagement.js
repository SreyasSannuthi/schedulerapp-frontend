import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_DOCTORS,
  REMOVE_DOCTOR_FROM_BRANCH,
  GET_HOSPITAL_BRANCHES,
  CREATE_HOSPITAL_BRANCH,
  GET_DOCTOR_BRANCH_MAPPINGS,
  UPDATE_HOSPITAL_BRANCH,
  DELETE_HOSPITAL_BRANCH,
  ASSIGN_DOCTOR_TO_BRANCH
} from '../apollo/queries';

import { useToast } from './Toast';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  X,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

function BranchManagement() {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('branches');
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [selectedBranchForReceptionist, setSelectedBranchForReceptionist] = useState('');
  const [selectedReceptionist, setSelectedReceptionist] = useState('');

  const [branchForm, setBranchForm] = useState({
    branchCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    phoneNumber: '',
    isActive: true
  });

  const { data: branchesData, loading: branchesLoading, refetch: refetchBranches } = useQuery(GET_HOSPITAL_BRANCHES);
  const { data: doctorsData, loading: doctorsLoading } = useQuery(GET_DOCTORS);
  const { data: mappingsData, loading: mappingsLoading, refetch: refetchMappings } = useQuery(GET_DOCTOR_BRANCH_MAPPINGS);

  const [createBranch, { loading: creating }] = useMutation(CREATE_HOSPITAL_BRANCH, {
    refetchQueries: [{ query: GET_HOSPITAL_BRANCHES }],
    onCompleted: () => {
      showSuccess('Branch created successfully!');
      resetBranchForm();
    },
    onError: (error) => showError(error.message)
  });

  const [updateBranch, { loading: updating }] = useMutation(UPDATE_HOSPITAL_BRANCH, {
    refetchQueries: [{ query: GET_HOSPITAL_BRANCHES }],
    onCompleted: () => {
      showSuccess('Branch updated successfully!');
      resetBranchForm();
    },
    onError: (error) => showError(error.message)
  });

  const [deleteBranch] = useMutation(DELETE_HOSPITAL_BRANCH, {
    refetchQueries: [{ query: GET_HOSPITAL_BRANCHES }, { query: GET_DOCTOR_BRANCH_MAPPINGS }],
    onCompleted: () => {
      showSuccess('Branch deleted successfully!');
      setShowDeleteConfirm(false);
      setBranchToDelete(null);
    },
    onError: (error) => showError(error.message)
  });

  const [assignDoctor] = useMutation(ASSIGN_DOCTOR_TO_BRANCH, {
    refetchQueries: [{ query: GET_DOCTOR_BRANCH_MAPPINGS }],
    onCompleted: () => {
      showSuccess('Staff assigned to branch successfully!');
      setSelectedDoctor('');
      setSelectedBranch('');
    },
    onError: (error) => showError(error.message)
  });

  const [removeDoctor] = useMutation(REMOVE_DOCTOR_FROM_BRANCH, {
    refetchQueries: [{ query: GET_DOCTOR_BRANCH_MAPPINGS }],
    onCompleted: () => showSuccess('Doctor removed from branch successfully!'),
    onError: (error) => showError(error.message)
  });

  const resetBranchForm = () => {
    setBranchForm({
      branchCode: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      email: '',
      phoneNumber: '',
      isActive: true
    });
    setEditingBranch(null);
    setShowBranchForm(false);
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      branchCode: branch.branchCode,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode || '',
      email: branch.email || '',
      phoneNumber: branch.phoneNumber,
      isActive: branch.isActive
    });
    setShowBranchForm(true);
  };

  const handleSubmitBranch = async () => {
    try {
      if (editingBranch) {
        await updateBranch({
          variables: {
            id: editingBranch.id,
            input: branchForm
          }
        });
      } else {
        await createBranch({
          variables: { input: branchForm }
        });
      }
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  const handleDeleteBranch = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBranch = async () => {
    if (branchToDelete) {
      await deleteBranch({ variables: { id: branchToDelete.id } });
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctor || !selectedBranch) {
      showError('Please select both doctor and branch');
      return;
    }

    const doctor = doctorsData.doctors.find(d => d.id === selectedDoctor);
    const branch = branchesData.hospitalBranches.find(b => b.id === selectedBranch);

    await assignDoctor({
      variables: {
        input: {
          doctorId: selectedDoctor,
          branchId: selectedBranch,
          doctorName: doctor.name,
          branchCode: branch.branchCode
        }
      }
    });
  };

  const handleRemoveMapping = async (mapping) => {
    await removeDoctor({
      variables: {
        doctorId: mapping.doctorId,
        branchId: mapping.branchId
      }
    });
  };

  if (branchesLoading || doctorsLoading || mappingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading branch data...</p>
        </div>
      </div>
    );
  }

  const branches = branchesData?.hospitalBranches || [];
  const doctors = doctorsData?.doctors || [];
  const mappings = mappingsData?.doctorBranchMappings || [];

  const availableDoctors = doctors.filter(doctor => doctor.role === 'doctor');
  const availableReceptionists = doctors.filter(doctor => doctor.role === 'receptionist');

  const isDoctorAssigned = (doctorId, branchId) => {
    return mappings.some(mapping => mapping.doctorId === doctorId && mapping.branchId === branchId);
  };

  const getAssignedDoctors = (branchId) => {
    return mappings.filter(mapping => mapping.branchId === branchId);
  };

  const getDoctorMappings = () => {
    return mappings.filter(mapping => {
      const staff = doctors.find(d => d.id === mapping.doctorId);
      return staff && staff.role === 'doctor';
    });
  };

  const getReceptionistMappings = () => {
    return mappings.filter(mapping => {
      const staff = doctors.find(d => d.id === mapping.doctorId);
      return staff && staff.role === 'receptionist';
    });
  };

  const handleAssignReceptionist = async () => {
    if (!selectedReceptionist || !selectedBranchForReceptionist) {
      showError('Please select both receptionist and branch');
      return;
    }

    const receptionist = doctors.find(d => d.id === selectedReceptionist);
    const branch = branches.find(b => b.id === selectedBranchForReceptionist);

    await assignDoctor({
      variables: {
        input: {
          doctorId: selectedReceptionist,
          branchId: selectedBranchForReceptionist,
          doctorName: receptionist.name,
          branchCode: branch.branchCode
        }
      }
    });

    setSelectedReceptionist('');
    setSelectedBranchForReceptionist('');
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Building2 className="w-6 h-6 mr-2" />
          Branch Management
        </h2>
        <p className="text-gray-600">Manage hospital branches and doctor assignments</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('branches')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'branches'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Branches ({branches.length})
          </button>
          <button
            onClick={() => setActiveTab('doctorAssignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'doctorAssignments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Doctor Assignments ({getDoctorMappings().length})
          </button>
          <button
            onClick={() => setActiveTab('receptionistAssignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'receptionistAssignments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Receptionist Assignments ({getReceptionistMappings().length})
          </button>
        </nav>
      </div>

      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Hospital Branches</h3>
              <p className="text-sm text-gray-600">Manage branch locations and information</p>
            </div>
            <button
              onClick={() => {
                resetBranchForm();
                setShowBranchForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </button>
          </div>

          {showBranchForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {editingBranch ? 'Edit Branch' : 'Create New Branch'}
                    </h3>
                    <button
                      onClick={resetBranchForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={branchForm.branchCode}
                          onChange={(e) => setBranchForm(prev => ({ ...prev, branchCode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., CHN001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={branchForm.city}
                          onChange={(e) => setBranchForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={branchForm.address}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={branchForm.state}
                          onChange={(e) => setBranchForm(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={branchForm.zipCode}
                          onChange={(e) => setBranchForm(prev => ({ ...prev, zipCode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={branchForm.phoneNumber}
                          onChange={(e) => setBranchForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={branchForm.email}
                          onChange={(e) => setBranchForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Email address"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={branchForm.isActive}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        Active branch
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={resetBranchForm}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitBranch}
                        disabled={creating || updating}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-400"
                      >
                        {creating || updating ? 'Saving...' : (editingBranch ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${branch.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Building2 className={`w-5 h-5 ${branch.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{branch.branchCode}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {branch.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditBranch(branch)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{branch.city}, {branch.state}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{branch.phoneNumber}</span>
                  </div>
                  {branch.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{branch.email}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{getAssignedDoctors(branch.id).length} doctor(s) assigned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {branches.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
              <p className="text-gray-600 mb-4">Create your first hospital branch to get started.</p>
              <button
                onClick={() => setShowBranchForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add First Branch
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'doctorAssignments' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Doctor-Branch Assignments</h3>
            <p className="text-sm text-gray-600">Assign doctors to work at specific branch locations</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="text-md font-medium text-gray-900 mb-4">Assign Doctor to Branch</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a doctor...</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a branch...</option>
                  {branches.filter(b => b.isActive).map((branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                      disabled={selectedDoctor && isDoctorAssigned(selectedDoctor, branch.id)}
                    >
                      {branch.branchCode} - {branch.city}
                      {selectedDoctor && isDoctorAssigned(selectedDoctor, branch.id) && ' (Already assigned)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={handleAssignDoctor}
                  disabled={!selectedDoctor || !selectedBranch || (selectedDoctor && selectedBranch && isDoctorAssigned(selectedDoctor, selectedBranch))}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h4 className="text-md font-medium text-gray-900">Current Assignments</h4>
            </div>
            <div className="divide-y">
              {getDoctorMappings().map((mapping) => (
                <div key={mapping.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">Dr. {mapping.doctorName}</span>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-green-600 mr-2" />
                      <span>{mapping.branchCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMapping(mapping)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                    title="Remove assignment"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {getDoctorMappings().length === 0 && (
              <div className="px-6 py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctor assignments yet</h3>
                <p className="text-gray-600">Start by assigning doctors to branch locations above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'receptionistAssignments' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Receptionist-Branch Assignments</h3>
            <p className="text-sm text-gray-600">Assign receptionists to work at specific branch locations</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="text-md font-medium text-gray-900 mb-4">Assign Receptionist to Branch</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Receptionist</label>
                <select
                  value={selectedReceptionist}
                  onChange={(e) => setSelectedReceptionist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                 <option value="">Choose a receptionist...</option>
                   {availableReceptionists
                     .filter((receptionist) =>
                       !mappings.some((mapping) => mapping.doctorId === receptionist.id)
                     )
                     .map((receptionist) => (
                       <option key={receptionist.id} value={receptionist.id}>
                         {receptionist.name}
                       </option>
                     ))}

                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  value={selectedBranchForReceptionist}
                  onChange={(e) => setSelectedBranchForReceptionist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a branch...</option>
                  {branches.filter(b => b.isActive).map((branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                      disabled={selectedReceptionist && isDoctorAssigned(selectedReceptionist, branch.id)}
                    >
                      {branch.branchCode} - {branch.city}
                      {selectedReceptionist && isDoctorAssigned(selectedReceptionist, branch.id) && ' (Already assigned)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={handleAssignReceptionist}
                  disabled={!selectedReceptionist || !selectedBranchForReceptionist || (selectedReceptionist && selectedBranchForReceptionist && isDoctorAssigned(selectedReceptionist, selectedBranchForReceptionist))}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h4 className="text-md font-medium text-gray-900">Current Receptionist Assignments</h4>
            </div>
            <div className="divide-y">
              {getReceptionistMappings().map((mapping) => (
                <div key={mapping.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium">{mapping.doctorName}</span>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-green-600 mr-2" />
                      <span>{mapping.branchCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMapping(mapping)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                    title="Remove assignment"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {getReceptionistMappings().length === 0 && (
              <div className="px-6 py-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No receptionist assignments yet</h3>
                <p className="text-gray-600">Start by assigning receptionists to branch locations above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && branchToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Branch</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{branchToDelete.branchCode}</strong>?
                This will also remove all doctor assignments to this branch.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBranchToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBranch}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Delete Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchManagement;