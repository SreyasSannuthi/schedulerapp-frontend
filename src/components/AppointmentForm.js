import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
    CREATE_APPOINTMENT,
    UPDATE_APPOINTMENT,
    DELETE_APPOINTMENT,
    GET_APPOINTMENTS,
    GET_APPOINTMENTS_BY_DOCTOR,
    GET_APPOINTMENTS_BY_PATIENT,
    GET_DOCTORS,
    GET_PATIENTS,
    CHECK_COLLISION,
    GET_DOCTOR_BRANCHES,
    GET_HOSPITAL_BRANCHES
} from "../apollo/queries";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { Building2, MapPin, Phone, AlertTriangle } from "lucide-react";

function AppointmentForm({
    isOpen,
    onClose,
    editAppointment = null,
}) {
    const { currentUser, isAdmin } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        status: "scheduled",
        doctorId: "",
        patientId: "",
        branchId: "",
    });

    const [errors, setErrors] = useState({});
    const [clicked, setClicked] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [collisionCheck, setCollisionCheck] = useState(null);
    const [availableBranches, setAvailableBranches] = useState([]);

    const { data: doctorsData } = useQuery(GET_DOCTORS);
    const { data: patientsData } = useQuery(GET_PATIENTS);
    const { data: branchesData } = useQuery(GET_HOSPITAL_BRANCHES);

    const [getDoctorBranches, { data: doctorBranchesData, loading: branchesLoading }] = useLazyQuery(GET_DOCTOR_BRANCHES);

    const [checkCollisionQuery, { loading: collisionLoading }] = useLazyQuery(CHECK_COLLISION, {
        onCompleted: (data) => {
            if (data?.checkCollision?.length > 0) {
                const conflicts = data.checkCollision;
                const relevantConflicts = editAppointment
                    ? conflicts.filter(c => c.id !== editAppointment.id)
                    : conflicts;
                setCollisionCheck(relevantConflicts);
                if (relevantConflicts.length > 0) {
                    showWarning(`Found ${relevantConflicts.length} conflicting appointment(s)`);
                }
            } else {
                setCollisionCheck([]);
            }
        },
        onError: (error) => {
            console.error("Collision check failed:", error);
            setCollisionCheck([]);
            showError("Failed to check for appointment conflicts");
        }
    });

    const getRefetchQueries = () => {
        if (isAdmin) {
            return [{ query: GET_APPOINTMENTS, variables: { adminId: currentUser.id } }];
        } else if (currentUser?.role === "doctor") {
            return [{ query: GET_APPOINTMENTS_BY_DOCTOR, variables: { doctorId: currentUser.id } }];
        } else if (currentUser?.role === "patient") {
            return [{ query: GET_APPOINTMENTS_BY_PATIENT, variables: { patientId: currentUser.id } }];
        }
        return [];
    };

    const [createAppointment] = useMutation(CREATE_APPOINTMENT, {
        refetchQueries: getRefetchQueries(),
    });
    const [updateAppointment] = useMutation(UPDATE_APPOINTMENT, {
        refetchQueries: getRefetchQueries(),
    });
    const [deleteAppointment] = useMutation(DELETE_APPOINTMENT, {
        refetchQueries: getRefetchQueries(),
    });

    useEffect(() => {
        if (editAppointment) {
            const startTime = new Date(editAppointment.startTime);
            const endTime = new Date(editAppointment.endTime);

            setFormData({
                title: editAppointment.title,
                description: editAppointment.description || "",
                startTime: formatDateTimeLocal(startTime),
                endTime: formatDateTimeLocal(endTime),
                status: editAppointment.status || "scheduled",
                doctorId: editAppointment.doctorId,
                patientId: editAppointment.patientId,
                branchId: editAppointment.branchId || "",
            });

            if (editAppointment.doctorId) {
                getDoctorBranches({ variables: { doctorId: editAppointment.doctorId } });
            }
        } else {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

            let defaultDoctorId = "";
            let defaultPatientId = "";

            if (currentUser?.role === "doctor") {
                defaultDoctorId = currentUser.id;
                getDoctorBranches({ variables: { doctorId: currentUser.id } });
            } else if (currentUser?.role === "patient") {
                defaultPatientId = currentUser.id;
            }

            setFormData({
                title: "",
                description: "",
                startTime: formatDateTimeLocal(now),
                endTime: formatDateTimeLocal(oneHourLater),
                status: "scheduled",
                doctorId: defaultDoctorId,
                patientId: defaultPatientId,
                branchId: "",
            });
        }
        setErrors({});
        setClicked({});
        setShowDeleteConfirm(false);
        setCollisionCheck(null);
        setAvailableBranches([]);
    }, [editAppointment, currentUser, isOpen, getDoctorBranches]);

    useEffect(() => {
        if (doctorBranchesData?.doctorBranches && branchesData?.hospitalBranches) {
            const doctorBranches = doctorBranchesData.doctorBranches;
            const allBranches = branchesData.hospitalBranches;

            const doctorAvailableBranches = doctorBranches
                .map(mapping => {
                    const branch = allBranches.find(b => b.id === mapping.branchId);
                    if (branch) {
                        return {
                            ...branch,
                            branchDisplayName: mapping.branchCode
                        };
                    }
                    return null;
                })
                .filter(branch => branch && branch.isActive);

            setAvailableBranches(doctorAvailableBranches);

            if (doctorAvailableBranches.length === 1 && !formData.branchId) {
                setFormData(prev => ({ ...prev, branchId: doctorAvailableBranches[0].id }));
            }
        } else {
            setAvailableBranches([]);
        }
    }, [doctorBranchesData, branchesData]);

    const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const checkForCollisions = async (doctorId, patientId, startTime, endTime) => {
        if (!doctorId || !patientId || !startTime || !endTime) return;

        try {
            const formatForBackend = (dateTimeLocal) => dateTimeLocal + ":00";

            await checkCollisionQuery({
                variables: {
                    doctorId,
                    patientId,
                    startTime: formatForBackend(startTime),
                    endTime: formatForBackend(endTime),
                },
            });

            const hasConflicts = collisionCheck && collisionCheck.length > 0;
            return hasConflicts;
        } catch (error) {
            console.error("Collision check failed:", error);
            return false;
        }
    };

    const validateField = (name, value, allFormData = formData) => {
        let error = "";

        switch (name) {
            case "title":
                if (!value || !value.toString().trim()) {
                    error = "Title is required";
                }
                break;

            case "doctorId":
                if (!value || !value.toString().trim()) {
                    error = "Please select a doctor";
                }
                break;

            case "patientId":
                if (!value || !value.toString().trim()) {
                    error = "Please select a patient";
                }
                break;

            case "branchId":
                if (availableBranches.length > 0 && (!value || !value.toString().trim())) {
                    error = "Please select a branch location";
                }
                break;

            case "startTime":
                if (!value) {
                    error = "Start time is required";
                } else {
                    const start = new Date(value);
                    const now = new Date();

                    if (start < now && !editAppointment) {
                        error = "Cannot create appointments in the past";
                    }

                    if (allFormData.endTime) {
                        const end = new Date(allFormData.endTime);
                        if (start >= end) {
                            error = "Start time must be before end time";
                        }
                    }
                }
                break;

            case "endTime":
                if (!value) {
                    error = "End time is required";
                } else if (allFormData.startTime) {
                    const start = new Date(allFormData.startTime);
                    const end = new Date(value);

                    if (end <= start) {
                        error = "End time must be after start time";
                    } else {
                        const durationMs = end - start;
                        const durationHours = durationMs / (1000 * 60 * 60);

                        if (durationHours > 4) {
                            error = "Appointment cannot exceed 4 hours";
                        }
                    }
                }
                break;

            default:
                break;
        }

        return error;
    };

    const validateAllFields = () => {
        const newErrors = {};
        const requiredFields = ['title', 'startTime', 'endTime', 'doctorId', 'patientId'];

        // Add branchId as required if branches are available
        if (availableBranches.length > 0) {
            requiredFields.push('branchId');
        }

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field], formData);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        setClicked(prev => ({ ...prev, [name]: true }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }

        const fieldError = validateField(name, value, newFormData);
        setErrors(prev => ({ ...prev, [name]: fieldError }));

        // Load doctor's branches when doctor is selected
        if (name === 'doctorId' && value) {
            getDoctorBranches({ variables: { doctorId: value } });
            // Reset branch selection when doctor changes
            setFormData(prev => ({ ...prev, branchId: "" }));
        }

        // Check for collisions when relevant fields change
        if ((name === 'startTime' || name === 'endTime' || name === 'doctorId' || name === 'patientId') &&
            newFormData.doctorId && newFormData.patientId && newFormData.startTime && newFormData.endTime) {
            await checkForCollisions(newFormData.doctorId, newFormData.patientId, newFormData.startTime, newFormData.endTime);
        }

        if (name === 'startTime' || name === 'endTime') {
            setClicked(prev => ({ ...prev, startTime: true, endTime: true }));

            const startTimeError = validateField('startTime', name === 'startTime' ? value : newFormData.startTime, newFormData);
            const endTimeError = validateField('endTime', name === 'endTime' ? value : newFormData.endTime, newFormData);

            setErrors(prev => ({
                ...prev,
                startTime: startTimeError,
                endTime: endTimeError
            }));
        }
    };

    const handleFocus = (e) => {
        const { name } = e.target;
        setClicked(prev => ({ ...prev, [name]: true }));

        if (formData[name]) {
            const fieldError = validateField(name, formData[name], formData);
            setErrors(prev => ({ ...prev, [name]: fieldError }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setClicked(prev => ({ ...prev, [name]: true }));

        const fieldError = validateField(name, formData[name], formData);
        setErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const areRequiredFieldsFilled = () => {
        const requiredFields = ['title', 'startTime', 'endTime', 'doctorId', 'patientId'];

        // Add branchId as required if branches are available
        if (availableBranches.length > 0) {
            requiredFields.push('branchId');
        }

        return requiredFields.every(field => {
            const value = formData[field];
            return value && value.toString().trim() !== '';
        });
    };

    const canEdit = () => {
        if (!editAppointment) return true;
        if (isAdmin) return true;
        if (currentUser?.role === "doctor") return editAppointment.doctorId === currentUser.id;
        if (currentUser?.role === "patient") return editAppointment.patientId === currentUser.id;
        return false;
    };

    const isFormValid = () => {
        const hasNoErrors = Object.keys(errors).every(key => !errors[key]);
        const hasNoCollisions = !collisionCheck || collisionCheck.length === 0;
        return areRequiredFieldsFilled() && hasNoErrors && hasNoCollisions && !isSubmitting && canEdit();
    };

    const shouldShowError = (fieldName) => {
        return clicked[fieldName] && errors[fieldName];
    };

    const handleDelete = async () => {
        if (!editAppointment || !canEdit()) return;

        setIsSubmitting(true);
        try {
            await deleteAppointment({
                variables: {
                    id: editAppointment.id,
                    requesterId: currentUser.id,
                },
            });

            showSuccess("Appointment deleted successfully! 🗑️");
            onClose();
        } catch (error) {
            console.error("Error deleting appointment:", error);

            let errorMessage = "Failed to delete appointment";
            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                errorMessage = error.graphQLErrors[0].message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);
            setErrors({ submit: errorMessage });
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['title', 'startTime', 'endTime', 'doctorId', 'patientId'];
        if (availableBranches.length > 0) {
            requiredFields.push('branchId');
        }

        const newClicked = { ...clicked };
        requiredFields.forEach(field => {
            newClicked[field] = true;
        });
        setClicked(newClicked);

        if (!validateAllFields()) {
            return;
        }

        const hasCollisions = await checkForCollisions(formData.doctorId, formData.patientId, formData.startTime, formData.endTime);
        if (hasCollisions) {
            setErrors({ submit: "Cannot create appointment due to scheduling conflicts" });
            return;
        }

        setIsSubmitting(true);
        setErrors(prev => ({ ...prev, submit: "" }));

        try {
            const formatForBackend = (dateTimeLocal) => {
                return dateTimeLocal + ":00";
            };

            const startTimeFormatted = formatForBackend(formData.startTime);
            const endTimeFormatted = formatForBackend(formData.endTime);

            if (editAppointment) {
                const updateData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    startTime: startTimeFormatted,
                    endTime: endTimeFormatted,
                    status: formData.status,
                };

                await updateAppointment({
                    variables: {
                        id: editAppointment.id,
                        input: updateData,
                        requesterId: currentUser.id,
                    },
                });

                showSuccess("Appointment updated successfully! ✏️");
            } else {
                const appointmentData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    startTime: startTimeFormatted,
                    endTime: endTimeFormatted,
                    status: formData.status,
                    doctorId: formData.doctorId,
                    patientId: formData.patientId,
                };

                // Add branch information if available
                if (formData.branchId) {
                    appointmentData.branchId = formData.branchId;
                }

                await createAppointment({
                    variables: {
                        input: appointmentData,
                    },
                });

                showSuccess("Appointment created successfully!");
            }

            onClose();

        } catch (error) {
            console.error("Error saving appointment:", error);

            let errorMessage = "Failed to save appointment";

            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                errorMessage = error.graphQLErrors[0].message;
            } else if (error.networkError) {
                errorMessage = "Network error. Please check your connection.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);
            setErrors({ submit: errorMessage });

        } finally {
            setIsSubmitting(false);
        }
    };

    const getSelectedBranch = () => {
        return availableBranches.find(branch => branch.id === formData.branchId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg border border-gray-300 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-md">
                <div className="bg-blue-500 text-white p-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold">
                        {editAppointment ? "Edit Appointment" : "Create Appointment"}
                    </h2>
                    <p className="text-sm">
                        {editAppointment
                            ? "Update the details below"
                            : "Enter the appointment info"}
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            disabled={!canEdit()}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${shouldShowError('title') ? "border-red-500" : "border-gray-300"
                                } ${!canEdit() ? "bg-gray-100" : ""}`}
                            placeholder="Enter appointment title"
                        />
                        {shouldShowError('title') && (
                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={!canEdit()}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Doctor *
                        </label>
                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            disabled={!canEdit() || (currentUser?.role === "doctor" && !isAdmin)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${shouldShowError('doctorId') ? "border-red-500" : "border-gray-300"
                                } ${!canEdit() || (currentUser?.role === "doctor" && !isAdmin) ? "bg-gray-100" : ""}`}
                        >
                            <option value="">Select doctor</option>
                            {doctorsData?.doctors?.filter(doctor => doctor.role !== 'admin').map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.name}
                                </option>
                            ))}
                        </select>
                        {shouldShowError('doctorId') && (
                            <p className="text-red-500 text-xs mt-1">{errors.doctorId}</p>
                        )}
                    </div>

                    {/* Branch Selection - Show only when doctor is selected and has branches */}
                    {formData.doctorId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Branch Location {availableBranches.length > 0 && "*"}
                            </label>
                            {branchesLoading ? (
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                                    Loading available branches...
                                </div>
                            ) : availableBranches.length > 0 ? (
                                <>
                                    <select
                                        name="branchId"
                                        value={formData.branchId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        onFocus={handleFocus}
                                        disabled={!canEdit()}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${shouldShowError('branchId') ? "border-red-500" : "border-gray-300"
                                            } ${!canEdit() ? "bg-gray-100" : ""}`}
                                    >
                                        <option value="">Select branch location</option>
                                        {availableBranches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.branchCode} - {branch.city}, {branch.state}
                                            </option>
                                        ))}
                                    </select>
                                    {shouldShowError('branchId') && (
                                        <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
                                    )}
                                </>
                            ) : (
                                <div className="w-full px-3 py-2 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        <span>Selected doctor is not assigned to any branches</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient *
                        </label>
                        <select
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            disabled={!canEdit() || (currentUser?.role === "patient" && !isAdmin)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${shouldShowError('patientId') ? "border-red-500" : "border-gray-300"
                                } ${!canEdit() || (currentUser?.role === "patient" && !isAdmin) ? "bg-gray-100" : ""}`}
                        >
                            <option value="">Select patient</option>
                            {patientsData?.patients?.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} (Age: {patient.age})
                                </option>
                            ))}
                        </select>
                        {shouldShowError('patientId') && (
                            <p className="text-red-500 text-xs mt-1">{errors.patientId}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            disabled={!canEdit()}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${shouldShowError('startTime') ? "border-red-500" : "border-gray-300"
                                } ${!canEdit() ? "bg-gray-100" : ""}`}
                        />
                        {shouldShowError('startTime') && (
                            <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            disabled={!canEdit()}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${shouldShowError('endTime') ? "border-red-500" : "border-gray-300"
                                } ${!canEdit() ? "bg-gray-100" : ""}`}
                        />
                        {shouldShowError('endTime') && (
                            <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                        )}
                    </div>

                    {editAppointment && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={!canEdit()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {collisionLoading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-blue-700 text-sm">Checking for conflicts...</p>
                        </div>
                    )}

                    {collisionCheck && collisionCheck.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-700 text-sm font-semibold mb-2">⚠️ Scheduling Conflicts:</p>
                            {collisionCheck.map((conflict, index) => (
                                <p key={index} className="text-red-600 text-xs">
                                    • "{conflict.title}" - {new Date(conflict.startTime).toLocaleString()} to {new Date(conflict.endTime).toLocaleString()}
                                </p>
                            ))}
                        </div>
                    )}

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        {editAppointment && canEdit() && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md font-medium transition-all"
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-all"
                        >
                            Cancel
                        </button>

                        {canEdit() && (
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid()}
                                className={`flex-1 px-4 py-2 text-white font-medium rounded-md transition-all ${isFormValid()
                                    ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                                    : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : editAppointment
                                        ? "Update"
                                        : "Create"}
                            </button>
                        )}
                    </div>

                    {!areRequiredFieldsFilled() && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <p className="text-yellow-700 text-sm">
                                ⚠️ Please fill all required fields marked with *
                            </p>
                        </div>
                    )}

                    {editAppointment && !canEdit() && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                            <p className="text-yellow-700 text-sm text-center">
                                👁️ You can view this appointment but cannot edit it.
                            </p>
                        </div>
                    )}
                </div>

                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Appointment
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete "{editAppointment?.title}"? This
                                action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-all disabled:bg-gray-400"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentForm;