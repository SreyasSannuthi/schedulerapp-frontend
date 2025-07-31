import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useQuery } from "@apollo/client";
import {
    GET_APPOINTMENTS,
    GET_APPOINTMENTS_BY_DOCTOR,
    GET_APPOINTMENTS_BY_PATIENT,
    GET_APPOINTMENTS_BY_BRANCH
} from "../apollo/queries";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import AppointmentForm from "./AppointmentForm";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function AppointmentCalendar({ selectedUserId }) {
    const { currentUser, isAdmin, hasFullAccess, hasBranchAccess } = useAuth();
    const { showSuccess, showError } = useToast();
    const [view, setView] = useState("month");
    const [date, setDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            .rbc-header {
                font-weight: 500;
                font-size: 14px;
                background: #f1f5f9;
                color: #1e293b;
            }
            .rbc-toolbar-label {
                font-size: 20px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const getQueryConfig = () => {
        if (!currentUser) return null;

        if (isAdmin || hasFullAccess) {
            return {
                query: GET_APPOINTMENTS,
                variables: { requesterId: currentUser.id }
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
        } else if (currentUser.role === "receptionist") {
            if (!currentUser.branchId) {
                console.warn('Receptionist user does not have branchId, using fallback query');
                return {
                    query: GET_APPOINTMENTS,
                    variables: { requesterId: currentUser.id }
                };
            }
            return {
                query: GET_APPOINTMENTS_BY_BRANCH,
                variables: { branchId: currentUser.branchId, requesterId: currentUser.id }
            };
        }
        return null;
    };

    const queryConfig = getQueryConfig();

    const { loading, error, data, refetch } = useQuery(
        queryConfig?.query || GET_APPOINTMENTS,
        {
            variables: queryConfig?.variables || {},
            skip: !queryConfig || !currentUser,
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
            onCompleted: (data) => {
                if (data) {
                    let appointmentCount = 0;
                    if (isAdmin || hasFullAccess) {
                        let allAppointments = data.appointments?.length || 0;
                        if (selectedUserId) {
                            const filteredAppointments = (data.appointments || []).filter(appointment =>
                                appointment.doctorId === selectedUserId || appointment.patientId === selectedUserId
                            );
                            appointmentCount = filteredAppointments.length;
                        } else {
                            appointmentCount = allAppointments;
                        }
                    } else if (currentUser?.role === "doctor") {
                        appointmentCount = data.appointmentsByDoctor?.length || 0;
                    } else if (currentUser?.role === "patient") {
                        appointmentCount = data.appointmentsByPatient?.length || 0;
                    } else if (currentUser?.role === "receptionist") {
                        if (data.appointmentsByBranch) {
                            appointmentCount = data.appointmentsByBranch.length || 0;
                        } else if (data.appointments) {
                            appointmentCount = data.appointments.length || 0;
                        } else {
                            appointmentCount = 0;
                        }
                    }
                    if (appointmentCount > 0) {
                        showSuccess(`Calendar loaded with ${appointmentCount} appointment(s)`);
                    }
                }
            },
            onError: (error) => {
                showError(`Failed to load calendar: ${error.message}`);
            }
        }
    );

    if (!queryConfig || !currentUser) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>Please log in to view calendar</p>
            </div>
        );
    }

    if (loading) {
        return <p className="p-4 text-center text-gray-600">Loading calendar...</p>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
                <p><strong>Error loading appointments:</strong></p>
                <p>{error.message}</p>
                {error.networkError && (
                    <p><strong>Network Error:</strong> Is your backend server running?</p>
                )}
            </div>
        );
    }

    let appointments = [];
    if (data) {
        if (isAdmin || hasFullAccess) {
            appointments = data.appointments || [];
            if (selectedUserId && selectedUserId !== currentUser.id) {
                appointments = appointments.filter(appointment =>
                    appointment.doctorId === selectedUserId || appointment.patientId === selectedUserId
                );
            }
        } else if (currentUser?.role === "doctor") {
            appointments = data.appointmentsByDoctor || [];
        } else if (currentUser?.role === "patient") {
            appointments = data.appointmentsByPatient || [];
        } else if (currentUser?.role === "receptionist") {
            if (data.appointmentsByBranch) {
                appointments = data.appointmentsByBranch || [];
            } else if (data.appointments) {
                appointments = data.appointments || [];
            } else {
                appointments = [];
            }
        }
    }

    const getEventTitle = (appointment) => {
        if (isAdmin || hasFullAccess) {
            return `${appointment.title} (Dr. ${appointment.doctorName} - ${appointment.patientName})`;
        } else if (currentUser?.role === "doctor") {
            return `${appointment.title} (Patient: ${appointment.patientName})`;
        } else if (currentUser?.role === "patient") {
            return `${appointment.title} (Dr. ${appointment.doctorName})`;
        } else if (currentUser?.role === "receptionist") {
            return `${appointment.title} (Dr. ${appointment.doctorName} - ${appointment.patientName})`;
        }
        return appointment.title;
    };

    const events = appointments.map((appointment) => ({
        id: appointment.id,
        title: getEventTitle(appointment),
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        resource: appointment,
    }));

    const eventStyleGetter = (event) => {
        let backgroundColor = "#3b82f6";
        const status = event.resource.status?.toLowerCase();
        switch (status) {
            case "completed":
                backgroundColor = "#10b981";
                break;
            case "cancelled":
                backgroundColor = "#ef4444";
                break;
            case "scheduled":
            default:
                backgroundColor = "#3b82f6";
                break;
        }
        return {
            style: {
                backgroundColor,
                color: "white",
                borderRadius: "4px",
                fontSize: "12px",
                padding: "2px",
            },
        };
    };

    const handleEventClick = (event) => {
        setEditingAppointment(event.resource);
        setShowForm(true);
    };

    const handleSelectSlot = ({ start, end }) => {
        setEditingAppointment({
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            status: 'scheduled'
        });
        setShowForm(true);
    };

    const handleNewAppointment = () => {
        setEditingAppointment(null);
        setShowForm(true);
    };

    const getCalendarTitle = () => {
        const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || "User";
        if (isAdmin && !selectedUserId) return "All Appointments (Admin)";
        if (isAdmin && selectedUserId) return "User's Appointments (Admin View)";
        if (currentUser?.role === "doctor") return `My Schedule - Dr. ${displayName}`;
        if (currentUser?.role === "patient") return `My Appointments - ${displayName}`;
        return "My Schedule";
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        if (refetch) {
            refetch();
        }
        showSuccess("Appointment saved successfully! 📅");
    };

    return (
        <div className="bg-white p-4 rounded border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                    <h2 className="text-lg font-semibold mb-1">
                        {getCalendarTitle()}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <button
                    onClick={handleNewAppointment}
                    className="mt-3 lg:mt-0 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                    + New Appointment
                </button>
            </div>

            {appointments.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                        📅 No appointments found.
                        {!isAdmin && currentUser?.role === "doctor" && " Create appointments for your patients."}
                        {!isAdmin && currentUser?.role === "patient" && " Your upcoming appointments will appear here."}
                    </p>
                </div>
            )}

            <div style={{ height: 600 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleEventClick}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    popup
                    views={["month", "week", "day"]}
                />
            </div>

            <div className="mt-6 bg-gray-50 p-3 rounded text-sm">
                <h3 className="font-semibold mb-2">Status Colors:</h3>
                <div className="flex flex-wrap gap-3">
                    <Legend color="#3b82f6" label="Scheduled" />
                    <Legend color="#10b981" label="Completed" />
                    <Legend color="#ef4444" label="Cancelled" />
                </div>
            </div>

            <AppointmentForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                editAppointment={editingAppointment}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}

function Legend({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
            <span className="text-gray-700">{label}</span>
        </div>
    );
}

export default AppointmentCalendar;