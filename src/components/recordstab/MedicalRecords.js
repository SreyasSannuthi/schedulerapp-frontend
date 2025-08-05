import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PATIENT_MEDICAL_RECORD } from "../../apollo/queries";
import { useToast } from "../Toast";
import PersonalInfo from "./tabs/PersonalInfo";
import VisitHistory from "./tabs/VisitHistory";
import Analytics from "./tabs/Analytics";
import { User, Calendar, BarChart3, ArrowLeft, AlertCircle, FileText } from "lucide-react";

function MedicalRecords({ patientId }) {
    const { showSuccess, showError } = useToast();
    const [selectedTab, setSelectedTab] = useState(null);

    const { loading, error, data: records } = useQuery(GET_PATIENT_MEDICAL_RECORD, {
        fetchPolicy: 'cache-and-network',
        variables: { patientId },
        onCompleted: (data) => {
            if (data?.getPatientMedicalRecord) {
                showSuccess("Medical record loaded successfully");
            }
        },
        onError: (error) => {
            console.error('Error loading medical record:', error);
            showError(`Failed to load medical record: ${error.message}`);
        }
    });

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Loading medical records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-bold mb-2">Unable to Load Medical Records</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="font-medium text-red-800">{error.message}</p>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center mx-auto"
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    const record = records?.getPatientMedicalRecord;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
                    <p className="text-sm text-gray-600">
                        Comprehensive health information and history
                    </p>
                </div>
            </div>

            {/* Navigation Tabs - Only show when no tab selected */}
            {!selectedTab && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setSelectedTab("PersonalInfo")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center transition-all"
                    >
                        <User className="w-4 h-4 mr-2" />
                        Personal Information
                    </button>
                    <button
                        onClick={() => setSelectedTab("VisitHistory")}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center transition-all"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Visit History
                    </button>
                    <button
                        onClick={() => setSelectedTab("Analytics")}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center justify-center transition-all"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Health Analytics
                    </button>
                </div>
            )}

            {/* Medical Record Metadata - Only show when no tab selected */}
            {!selectedTab && (
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>

                    {record ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Patient ID:</span>
                                <span className="text-sm text-gray-900 font-mono">{record.patientId}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Record Created:</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(record.createdAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(record.updatedAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">No Medical Record Found</h4>
                                    <div className="mt-2 space-y-1 text-sm text-yellow-700">
                                        <p><strong>Patient ID:</strong> {patientId}</p>
                                        <p><strong>Status:</strong> No record created yet</p>
                                        <p className="mt-2">Medical records are created automatically when you first add personal information, visit history, or upload documents.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content - Only show when tab selected */}
            {selectedTab && (
                <div className="space-y-4">
                    {/* Back Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedTab(null)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to Medical Records</span>
                        </button>

                        {/* Current Tab Indicator */}
                        <div className="flex items-center gap-2">
                            {selectedTab === "PersonalInfo" && <User className="w-4 h-4 text-blue-600" />}
                            {selectedTab === "VisitHistory" && <Calendar className="w-4 h-4 text-green-600" />}
                            {selectedTab === "Analytics" && <BarChart3 className="w-4 h-4 text-purple-600" />}
                            <span className="text-sm font-medium text-gray-900">
                                {selectedTab === "PersonalInfo" && "Personal Information"}
                                {selectedTab === "VisitHistory" && "Visit History"}
                                {selectedTab === "Analytics" && "Health Analytics"}
                            </span>
                        </div>
                    </div>

                    {/* Tab Component Content */}
                    <div className="bg-white border rounded-lg shadow-sm">
                        {selectedTab === "PersonalInfo" && <PersonalInfo patientId={patientId} />}
                        {selectedTab === "VisitHistory" && <VisitHistory patientId={patientId} />}
                        {selectedTab === "Analytics" && <Analytics patientId={patientId} />}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MedicalRecords;