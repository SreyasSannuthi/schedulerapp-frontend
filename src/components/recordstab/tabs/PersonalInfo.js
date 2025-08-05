import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PATIENT_PERSONAL_INFO } from '../../../apollo/queries';
import PersonalInfoForm from "../forms/PersonalInfoForm";
import { User, Edit, Plus, AlertCircle, Heart, Phone, Activity } from 'lucide-react';
import { useToast } from '../../Toast';

function PersonalInfo({ patientId }) {
    const {showSuccess,showError} = useToast();
    const [showForm, setShowForm] = useState(false);

    const { data, loading, error } = useQuery(GET_PATIENT_PERSONAL_INFO, {
        variables: { patientId },
        onCompleted: (data)=>{
            showSuccess("Personal Info loaded successfully");
        },
        onError: (error)=>{
            showError(`Failed to load :${error.message}`);
        }
    });

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                <div className="animate-pulse">
                    <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Loading personal information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm">Error loading personal information: {error.message}</p>
            </div>
        );
    }

    const personalInfo = data?.getPatientPersonalInfo;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Medical Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Basic health information and emergency contacts
                    </p>
                </div>

                {personalInfo && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-all"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Information
                    </button>
                )}
            </div>

            {personalInfo ? (
                <div className="space-y-6">
                    {/* Basic Health Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <h4 className="font-medium text-gray-900">Blood Type</h4>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                                {personalInfo.bloodType || "Not specified"}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <h4 className="font-medium text-gray-900">Height</h4>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                                {personalInfo.height ? `${personalInfo.height} cm` : "Not specified"}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-green-500" />
                                <h4 className="font-medium text-gray-900">Weight</h4>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                                {personalInfo.weight ? `${personalInfo.weight} kg` : "Not specified"}
                            </p>
                            {personalInfo.lastWeightUpdate && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Updated: {new Date(personalInfo.lastWeightUpdate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                Allergies
                            </h4>
                            {personalInfo.allergies?.length > 0 ? (
                                <div className="space-y-2">
                                    {personalInfo.allergies.map((allergy, index) => (
                                        <span key={index} className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2 mb-2">
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No known allergies</p>
                            )}
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                Chronic Conditions
                            </h4>
                            {personalInfo.chronicConditions?.length > 0 ? (
                                <div className="space-y-2">
                                    {personalInfo.chronicConditions.map((condition, index) => (
                                        <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm mr-2 mb-2">
                                            {condition}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No chronic conditions</p>
                            )}
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                Current Medications
                            </h4>
                            {personalInfo.currentMedications?.length > 0 ? (
                                <div className="space-y-2">
                                    {personalInfo.currentMedications.map((medication, index) => (
                                        <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2 mb-2">
                                            {medication}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No current medications</p>
                            )}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-red-800">
                            <Phone className="w-4 h-4 text-red-600" />
                            Emergency Contact
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Contact Name</p>
                                <p className="text-gray-900">
                                    {personalInfo.emergencyContactName || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Phone Number</p>
                                <p className="text-gray-900">
                                    {personalInfo.emergencyContactPhone || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // No personal info exists
                <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2 text-gray-900">No Personal Information</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        Add your personal medical information to help healthcare providers better understand your health profile and medical history.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 mx-auto transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Personal Information
                    </button>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <PersonalInfoForm
                    onClose={() => setShowForm(false)}
                    patientId={patientId}
                    initialData={personalInfo}
                />
            )}
        </div>
    );
}

export default PersonalInfo;