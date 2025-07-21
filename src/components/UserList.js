//import React from "react";
//import { useQuery } from "@apollo/client";
//import { GET_DOCTORS, GET_PATIENTS } from "../apollo/queries";
//import { useAuth } from "../context/AuthContext";
//import { useToast } from "./Toast";
//
//function UserList() {
//    const { loading: loadingDoctors, error: errorDoctors, data: doctorsData } = useQuery(GET_DOCTORS);
//    const { loading: loadingPatients, error: errorPatients, data: patientsData } = useQuery(GET_PATIENTS);
//    const { login } = useAuth();
//    const { showInfo } = useToast();
//
//    if (loadingDoctors || loadingPatients) {
//        return <div className="text-center py-10 text-gray-600">Loading users...</div>;
//    }
//
//    if (errorDoctors || errorPatients) {
//        return (
//            <div className="bg-red-100 text-red-700 p-4 rounded text-center">
//                Error: {errorDoctors?.message || errorPatients?.message}
//            </div>
//        );
//    }
//
//    const handleUserClick = (user) => {
//        showInfo(`Logging in as ${user.name}...`);
//        login(user);
//    };
//
//    return (
//        <div className="bg-white p-6 rounded shadow-md">
//            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Users</h2>
//            <p className="text-sm text-gray-500 mb-6">Click a user to log in</p>
//
//            <h3 className="text-lg font-bold text-gray-700 mb-2">Doctors</h3>
//            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//                {doctorsData.doctors.map((doctor) => (
//                    <div
//                        key={doctor.id}
//                        onClick={() => handleUserClick(doctor)}
//                        className="p-4 border rounded hover:shadow cursor-pointer transition"
//                    >
//                        <h3 className="font-bold text-gray-800">{doctor.name}</h3>
//                        <p className="text-sm text-gray-500">{doctor.email}</p>
//                        <span
//                            className={`inline-block mt-2 text-xs px-2 py-1 rounded ${doctor.role === "admin" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
//                                }`}
//                        >
//                            {doctor.role}
//                        </span>
//                    </div>
//                ))}
//            </div>
//
//            <h3 className="text-lg font-bold text-gray-700 mb-2">Patients</h3>
//            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                {patientsData.patients.map((patient) => (
//                    <div
//                        key={patient.id}
//                        onClick={() => handleUserClick(patient)}
//                        className="p-4 border rounded hover:shadow cursor-pointer transition"
//                    >
//                        <h3 className="font-bold text-gray-800">{patient.name}</h3>
//                        <p className="text-sm text-gray-500">{patient.email}</p>
//                        <p className="text-xs text-gray-400">Phone: {patient.phoneNumber}</p>
//                        <p className="text-xs text-gray-400">Age: {patient.age}</p>
//                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-green-500 text-white">
//                            {patient.role}
//                        </span>
//                    </div>
//                ))}
//            </div>
//        </div>
//    );
//}
//
//export default UserList;