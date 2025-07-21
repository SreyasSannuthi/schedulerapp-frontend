import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    GET_APPOINTMENTS,
    GET_APPOINTMENTS_BY_DOCTOR,
    GET_APPOINTMENTS_BY_PATIENT,
    DELETE_APPOINTMENT,
    DELETE_MULTIPLE_APPOINTMENTS
} from "../apollo/queries";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import AppointmentForm from "./AppointmentForm";

function AppointmentsList({ selectedUserId }) {
    const { currentUser, isAdmin } = useAuth();
    const { showSuccess, showError } = useToast();

    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [selectedAppointments, setSelectedAppointments] = useState(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const getQueryConfig = () => {
        if (!currentUser) return null;
        if (isAdmin) {
            return {
                query: GET_APPOINTMENTS,
                variables: { adminId: currentUser.id }
            };
        } else if (currentUser.role === "doctor") {
            return {
                query: GET_APPOINTMENTS_BY_DOCTOR,
                variables: { doctorId: currentUser.id }
            };
        } else if (currentUser.role === "patient") {
            return {
                query: GET_APPOINTMENTS_BY_PATIENT,
                variables: { patientId: currentUser.id }
            };
        }
        return null;
    };

    const queryConfig = getQueryConfig();

    const { loading, error, data } = useQuery(queryConfig?.query || GET_APPOINTMENTS, {
        variables: queryConfig?.variables,
        skip: !currentUser || !queryConfig,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data) {
                let appointmentCount = 0;
                if (isAdmin) {
                    const allAppointments = data.appointments || [];
                    if (selectedUserId) {
                        appointmentCount = allAppointments.filter(a =>
                            a.doctorId === selectedUserId || a.patientId === selectedUserId
                        ).length;
                    } else {
                        appointmentCount = allAppointments.length;
                    }
                } else if (currentUser?.role === "doctor") {
                    appointmentCount = data.appointmentsByDoctor?.length || 0;
                } else if (currentUser?.role === "patient") {
                    appointmentCount = data.appointmentsByPatient?.length || 0;
                }
                if (appointmentCount > 0) {
                    const userText = selectedUserId ? " for selected user" : "";
                    showSuccess(`Loaded ${appointmentCount} appointment(s)${userText} 📅`);
                }
            }
        },
        onError: (error) => {
            showError(`Failed to load appointments: ${error.message}`);
        }
    });

    const [deleteAppointment] = useMutation(DELETE_APPOINTMENT, {
        refetchQueries: [{
            query: queryConfig?.query,
            variables: queryConfig?.variables
        }],
    });

    const [deleteMultipleAppointments] = useMutation(DELETE_MULTIPLE_APPOINTMENTS, {
        refetchQueries: [{
            query: queryConfig?.query,
            variables: queryConfig?.variables
        }],
    });

    const handleNewAppointment = () => {
        setEditingAppointment(null);
        setShowForm(true);
    };

    const handleEditAppointment = (appointment) => {
        setEditingAppointment(appointment);
        setShowForm(true);
        if (selectedAppointments.size > 0) {
            setSelectedAppointments(new Set());
        }
    };

    const handleDeleteAppointment = (appointment) => {
        setAppointmentToDelete(appointment);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!appointmentToDelete) return;
        setDeletingId(appointmentToDelete.id);
        try {
            await deleteAppointment({
                variables: { id: appointmentToDelete.id, requesterId: currentUser.id },
            });
            showSuccess("Appointment deleted successfully!");
        } catch (err) {
            showError("Failed to delete appointment: " + err.message);
        } finally {
            setDeletingId(null);
            setShowDeleteConfirm(false);
            setAppointmentToDelete(null);
        }
    };

    const handleSelectAppointment = (appointmentId, checked) => {
        const newSelected = new Set(selectedAppointments);
        if (checked) {
            newSelected.add(appointmentId);
        } else {
            newSelected.delete(appointmentId);
        }
        setSelectedAppointments(newSelected);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = appointments.filter(a => canEdit(a)).map(a => a.id);
            setSelectedAppointments(new Set(allIds));
        } else {
            setSelectedAppointments(new Set());
        }
    };

    const handleBulkDelete = () => {
        if (selectedAppointments.size === 0) return;
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        setBulkDeleting(true);
        try {
            await deleteMultipleAppointments({
                variables: {
                    ids: Array.from(selectedAppointments),
                    requesterId: currentUser.id
                },
            });
            showSuccess(`${selectedAppointments.size} appointments deleted successfully! 🗑️`);
            setSelectedAppointments(new Set());
        } catch (err) {
            showError("Failed to delete appointments: " + err.message);
        } finally {
            setBulkDeleting(false);
            setShowBulkDeleteConfirm(false);
        }
    };

    const canEdit = (appointment) => {
        if (isAdmin) return true;
        if (currentUser?.role === "doctor") return appointment.doctorId === currentUser.id;
        if (currentUser?.role === "patient") return appointment.patientId === currentUser.id;
        return false;
    };

    const getStatusColor = (status) => {
        if (status === "completed") return "bg-green-200 text-green-800";
        if (status === "cancelled") return "bg-red-200 text-red-800";
        return "bg-blue-200 text-blue-800";
    };

    const getTitle = () => {
        const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || "User";
        if (isAdmin && !selectedUserId) return "All Appointments (Admin)";
        if (currentUser?.role === "doctor") return `My Appointments - Dr. ${displayName}`;
        if (currentUser?.role === "patient") return `My Appointments - ${displayName}`;
        return "My Appointments";
    };

    if (loading) {
        const loadingName = currentUser?.name || currentUser?.email?.split('@')[0] || "User";
        return (
            <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse">
                    <p>Loading appointments for {loadingName}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                <h3 className="text-lg font-bold mb-2"> Error Loading Appointments</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="font-medium text-red-800">{error.message}</p>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    let appointments = [];
    if (data) {
        if (isAdmin) {
            appointments = data.appointments || [];
            if (selectedUserId) {
                appointments = appointments.filter(appointment =>
                    appointment.doctorId === selectedUserId || appointment.patientId === selectedUserId
                );
            }
        } else if (currentUser?.role === "doctor") {
            appointments = data.appointmentsByDoctor || [];
        } else if (currentUser?.role === "patient") {
            appointments = data.appointmentsByPatient || [];
        }
    }

    const editableAppointments = appointments.filter(a => canEdit(a));
    const hasEditableAppointments = editableAppointments.length > 0;

    const renderConfirmationModal = (isOpen, title, message, onConfirm, onCancel, confirmText, loading) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-all disabled:bg-gray-400"
                            >
                                {loading ? "Deleting..." : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white border rounded p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-semibold">{getTitle()}</h2>
                    <p className="text-sm text-gray-600">
                        {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <div className="flex gap-2">
                    {hasEditableAppointments && selectedAppointments.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm disabled:bg-gray-400"
                        >
                            {bulkDeleting ? "Deleting..." : `Delete ${selectedAppointments.size}`}
                        </button>
                    )}
                    <button
                        onClick={handleNewAppointment}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                        + Add Appointment
                    </button>
                </div>
            </div>

            {hasEditableAppointments && appointments.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={editableAppointments.length > 0 && editableAppointments.every(a => selectedAppointments.has(a.id))}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded"
                        />
                        Select all editable appointments ({editableAppointments.length})
                    </label>
                    {selectedAppointments.size > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                            {selectedAppointments.size} appointments selected
                        </p>
                    )}
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="text-center p-8 text-gray-600">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {currentUser?.name || currentUser?.email?.split('@')[0]}, you don't have any appointments yet.
                    </p>
                    <button
                        onClick={handleNewAppointment}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        📅 Schedule Your First Appointment
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment) => {
                        const start = new Date(appointment.startTime);
                        const end = new Date(appointment.endTime);
                        const isEditable = canEdit(appointment);

                        return (
                            <div key={appointment.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        {isEditable && (
                                            <input
                                                type="checkbox"
                                                checked={selectedAppointments.has(appointment.id)}
                                                onChange={(e) => handleSelectAppointment(appointment.id, e.target.checked)}
                                                className="mt-1 rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 text-lg mb-1">
                                                {appointment.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                                                <span className="font-medium">
                                                    {start.toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {start.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}{" "}
                                                    -{" "}
                                                    {end.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            {appointment.description && (
                                                <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                                                    {appointment.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status.toUpperCase()}
                                                </span>
                                                {isAdmin && (
                                                    <div className="text-xs text-gray-600 flex items-center gap-3">
                                                        <span>👨‍⚕️ {appointment.doctorName}</span>
                                                        <span>👤 {appointment.patientName}</span>
                                                    </div>
                                                )}
                                                {currentUser?.role === "doctor" && (
                                                    <span className="text-xs text-gray-600">
                                                        👤 Patient: {appointment.patientName}
                                                    </span>
                                                )}
                                                {currentUser?.role === "patient" && (
                                                    <span className="text-xs text-gray-600">
                                                        👨‍⚕️ Doctor: {appointment.doctorName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 pt-3">
                                                createdAt : {new Date(appointment.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500 pt-1">
                                                updatedAt: {new Date(appointment.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {isEditable ? (
                                            <>
                                                <button
                                                    onClick={() => handleEditAppointment(appointment)}
                                                    className="text-blue-600 border border-blue-600 px-4 py-2 text-sm rounded-lg hover:bg-blue-50 font-medium transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAppointment(appointment)}
                                                    className={`text-red-600 border border-red-600 px-4 py-2 text-sm rounded-lg font-medium transition-all ${deletingId === appointment.id
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "hover:bg-red-50"
                                                        }`}
                                                    disabled={deletingId === appointment.id}
                                                >
                                                    {deletingId === appointment.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded">
                                                👀 View Only
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AppointmentForm
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    if (selectedAppointments.size > 0) {
                        setSelectedAppointments(new Set());
                    }
                }}
                editAppointment={editingAppointment}
            />

            {renderConfirmationModal(
                showDeleteConfirm,
                "Delete Appointment",
                `Are you sure you want to delete "${appointmentToDelete?.title}"? This action cannot be undone.`,
                confirmDelete,
                () => {
                    setShowDeleteConfirm(false);
                    setAppointmentToDelete(null);
                },
                "Delete",
                deletingId === appointmentToDelete?.id
            )}

            {renderConfirmationModal(
                showBulkDeleteConfirm,
                "Delete Multiple Appointments",
                `Are you sure you want to delete ${selectedAppointments.size} appointments? This action cannot be undone.`,
                confirmBulkDelete,
                () => setShowBulkDeleteConfirm(false),
                "Delete",
                bulkDeleting
            )}
        </div>
    );
}

export default AppointmentsList;