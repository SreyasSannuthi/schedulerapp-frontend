import React, { createContext, useContext, useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { GET_CURRENT_USER, GET_DOCTORS, GET_PATIENTS, GET_DOCTOR_BRANCHES, GET_HOSPITAL_BRANCHES } from "../apollo/queries";
import { useToast } from "../components/Toast";

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showSuccess, showError } = useToast();
    const apolloClient = useApolloClient();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchCurrentUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const { data } = await apolloClient.query({
                query: GET_CURRENT_USER,
                fetchPolicy: 'network-only'
            });

            if (data?.getCurrentUser) {
                await fetchUserDetails(data.getCurrentUser);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserDetails = async (email) => {
        try {
            const [doctorsResult, patientsResult] = await Promise.all([
                apolloClient.query({ query: GET_DOCTORS, fetchPolicy: 'network-only' }),
                apolloClient.query({ query: GET_PATIENTS, fetchPolicy: 'network-only' })
            ]);

            const doctor = doctorsResult.data?.doctors?.find(d => d.email === email);
            const patient = patientsResult.data?.patients?.find(p => p.email === email);

            const user = doctor || patient;
            if (user) {
                const baseUserData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role.toLowerCase(),
                    phoneNumber: user.phoneNumber,
                    age: user.age,
                };

                if (user.role.toLowerCase() === 'receptionist') {
                    try {
                        const [branchMappingResult, branchesResult] = await Promise.all([
                            apolloClient.query({
                                query: GET_DOCTOR_BRANCHES,
                                variables: { doctorId: user.id },
                                fetchPolicy: 'network-only'
                            }),
                            apolloClient.query({
                                query: GET_HOSPITAL_BRANCHES,
                                fetchPolicy: 'network-only'
                            })
                        ]);

                        if (branchMappingResult.data?.doctorBranches && branchMappingResult.data.doctorBranches.length > 0) {
                            const branchMapping = branchMappingResult.data.doctorBranches[0]; // Assume receptionist is mapped to one branch
                            baseUserData.branchId = branchMapping.branchId;
                            baseUserData.branchCode = branchMapping.branchCode;

                            if (branchesResult.data?.hospitalBranches) {
                                const fullBranch = branchesResult.data.hospitalBranches.find(b => b.id === branchMapping.branchId);
                                if (fullBranch) {
                                    baseUserData.branchName = fullBranch.branchCode;
                                    baseUserData.branchCity = fullBranch.city;
                                    baseUserData.branchState = fullBranch.state;
                                }
                            }
                        }
                    } catch (branchError) {
                        console.error('Error fetching receptionist branch:', branchError);
                    }
                }

                setCurrentUser(baseUserData);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const login = async (authResponse) => {
        try {
            const { token, username, role } = authResponse;

            if (!token) {
                throw new Error("No token received");
            }

            localStorage.setItem('authToken', token);

            await apolloClient.clearStore();

            await fetchUserDetails(username);

            showSuccess('Login successful!');
            return { success: true };
        } catch (error) {
            showError(error.message || "Login failed");
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        await apolloClient.clearStore();
        setIsLoading(false);
    };

    const isAdmin = currentUser && (
        currentUser.role === "admin" ||
        currentUser.role === "ADMIN"
    );

    const isCustomerCare = currentUser && (
        currentUser.role === "customer_care" ||
        currentUser.role === "CUSTOMER_CARE"
    );

    const isReceptionist = currentUser && (
        currentUser.role === "receptionist" ||
        currentUser.role === "RECEPTIONIST"
    );

    const isDoctor = currentUser && (
        currentUser.role === "doctor" ||
        currentUser.role === "DOCTOR"
    );

    const isPatient = currentUser && (
        currentUser.role === "patient" ||
        currentUser.role === "PATIENT"
    );

    const hasFullAccess = currentUser && (
        currentUser.role === "admin" ||
        currentUser.role === "ADMIN" ||
        currentUser.role === "customer_care" ||
        currentUser.role === "CUSTOMER_CARE"
    );

    const hasBranchAccess = currentUser && (
        currentUser.role === "admin" ||
        currentUser.role === "ADMIN" ||
        currentUser.role === "customer_care" ||
        currentUser.role === "CUSTOMER_CARE" ||
        currentUser.role === "receptionist" ||
        currentUser.role === "RECEPTIONIST" ||
        currentUser.role === "doctor" ||
        currentUser.role === "DOCTOR"
    );

    const isStaff = currentUser && (
        currentUser.role !== "patient" &&
        currentUser.role !== "PATIENT"
    );

    const canManageAppointments = currentUser && (
        currentUser.role === "admin" ||
        currentUser.role === "ADMIN" ||
        currentUser.role === "customer_care" ||
        currentUser.role === "CUSTOMER_CARE" ||
        currentUser.role === "receptionist" ||
        currentUser.role === "RECEPTIONIST"
    );

    return (
        <AuthContext.Provider value={{
            currentUser,
            isAuthenticated: !!currentUser,
            isAdmin,
            isCustomerCare,
            isReceptionist,
            isDoctor,
            isPatient,
            hasFullAccess,
            hasBranchAccess,
            isStaff,
            canManageAppointments,
            login,
            logout,
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}