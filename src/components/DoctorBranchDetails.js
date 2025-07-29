import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import {
    GET_DOCTOR_BRANCHES
} from "../apollo/queries";

const GET_HOSPITAL_BRANCHES = gql`
  query GetHospitalBranches {
    hospitalBranches {
      id
      branchCode
      address
      city
      state
      zipCode
      email
      phoneNumber
      isActive
      startedAt
    }
  }
`;

function DoctorBranchDetails({ doctorId }) {
  const { data: branchMappingsData, loading: mappingsLoading, error: mappingsError } = useQuery(GET_DOCTOR_BRANCHES, {
    variables: { doctorId },
    skip: !doctorId
  });

  const { data: branchesData, loading: branchesLoading } = useQuery(GET_HOSPITAL_BRANCHES);

  if (mappingsLoading || branchesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your branch assignments...</p>
        </div>
      </div>
    );
  }

  if (mappingsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Branch Information</h3>
            <p className="text-red-600 text-sm">{mappingsError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const doctorBranches = branchMappingsData?.doctorBranches || [];
  const allBranches = branchesData?.hospitalBranches || [];

  const assignedBranches = doctorBranches.map(mapping => {
    const branchDetails = allBranches.find(branch => branch.id === mapping.branchId);
    return {
      ...mapping,
      branchDetails
    };
  }).filter(item => item.branchDetails);

  const activeBranches = assignedBranches.filter(item => item.branchDetails.isActive);
  const inactiveBranches = assignedBranches.filter(item => !item.branchDetails.isActive);

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Building2 className="w-6 h-6 mr-2" />
          My Branch Assignments
        </h2>
        <p className="text-gray-600">View the hospital branches where you're assigned to work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-gray-900">{assignedBranches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Branches</p>
              <p className="text-2xl font-bold text-green-600">{activeBranches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Branches</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveBranches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {assignedBranches.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Branch Assignments</h3>
          <p className="text-gray-600 mb-4">
            You haven't been assigned to any hospital branches yet.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator to get assigned to branch locations.
          </p>
        </div>
      )}

      {activeBranches.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Active Branch Assignments ({activeBranches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBranches.map((assignment) => (
              <BranchCard
                key={assignment.id}
                assignment={assignment}
                isActive={true}
              />
            ))}
          </div>
        </div>
      )}

      {inactiveBranches.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            Inactive Branch Assignments ({inactiveBranches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inactiveBranches.map((assignment) => (
              <BranchCard
                key={assignment.id}
                assignment={assignment}
                isActive={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BranchCard({ assignment, isActive }) {
  const { branchDetails } = assignment;

  if (!branchDetails) return null;

  return (
    <div className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
      !isActive ? 'opacity-75' : ''
    }`}>
      <div className={`p-4 ${isActive ? 'bg-green-50 border-b border-green-200' : 'bg-gray-50 border-b border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Building2 className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{branchDetails.branchCode}</h3>
              <p className="text-sm text-gray-600">{branchDetails.city}, {branchDetails.state}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900">{branchDetails.address}</p>
            <p className="text-xs text-gray-500">
              {branchDetails.city}, {branchDetails.state} {branchDetails.zipCode}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
          <p className="text-sm text-gray-900">{branchDetails.phoneNumber}</p>
        </div>

        {branchDetails.email && (
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-900 truncate">{branchDetails.email}</p>
          </div>
        )}

        {branchDetails.startedAt && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Established: {new Date(branchDetails.startedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {!isActive && (
        <div className="px-4 pb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-xs">
                This branch is currently inactive. You cannot schedule appointments here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorBranchDetails;