import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { GET_CURRENT_USER, GET_CURRENT_USER_ROLE, GET_DOCTORS, GET_PATIENTS } from "../apollo/queries";
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
    const [authToken, setAuthToken] = useState(null);
    const [userDatabaseId, setUserDatabaseId] = useState(null);
    const { showSuccess, showInfo, showError } = useToast();

    const apolloClient = useApolloClient();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(GET_CURRENT_USER, {
        skip: !authToken,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data?.getCurrentUser) {
                setCurrentUser({
                    email: data.getCurrentUser,
                    id: data.getCurrentUser,
                });
            } else {
                logout();
            }
            setIsLoading(false);
        },
        onError: (error) => {
            logout();
            setIsLoading(false);
        }
    });

    const { data: roleData, refetch: refetchRole } = useQuery(GET_CURRENT_USER_ROLE, {
        skip: !authToken || !currentUser,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data?.getCurrentUserRole && currentUser) {
                setCurrentUser(prev => ({
                    ...prev,
                    role: data.getCurrentUserRole.toLowerCase(),
                }));
            }
        }
    });

    const { data: doctorsData, refetch: refetchDoctors } = useQuery(GET_DOCTORS, {
        skip: !currentUser?.email,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (currentUser && data.doctors) {
                const doctor = data.doctors.find(d => d.email === currentUser.email);
                if (doctor) {
                    setUserDatabaseId(doctor.id);
                    setCurrentUser(prev => ({
                        ...prev,
                        id: doctor.id,
                        name: doctor.name,
                        role: doctor.role.toLowerCase(),
                        phoneNumber: doctor.phoneNumber,
                        age: doctor.age,
                    }));
                }
            }
        }
    });

    const { data: patientsData, refetch: refetchPatients } = useQuery(GET_PATIENTS, {
        skip: !currentUser?.email || userDatabaseId,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (currentUser && data.patients && !userDatabaseId) {
                const patient = data.patients.find(p => p.email === currentUser.email);
                if (patient) {
                    setUserDatabaseId(patient.id);
                    setCurrentUser(prev => ({
                        ...prev,
                        id: patient.id,
                        name: patient.name,
                        role: patient.role.toLowerCase(),
                        phoneNumber: patient.phoneNumber,
                        age: patient.age,
                    }));
                }
            }
        }
    });

    const login = async (authResponse) => {
        try {
            const { token, username, role, message } = authResponse;

            if (!token) {
                throw new Error(message || "No token received");
            }

            await apolloClient.clearStore();

            localStorage.setItem('authToken', token);
            setAuthToken(token);

            setCurrentUser(null);
            setUserDatabaseId(null);

            setCurrentUser({
                email: username,
                id: username,
                role: role.toLowerCase(),
            });

            const displayName = username.split('@')[0];
            const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            showSuccess(`Welcome back, ${capitalizedName}! 🎉`);

            setIsLoading(false);
            return { success: true };
        } catch (error) {
            showError(error.message || "Login failed");
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        const userName = currentUser?.name || currentUser?.email?.split('@')[0] || "User";

        await apolloClient.clearStore();

        setCurrentUser(null);
        setAuthToken(null);
        setUserDatabaseId(null);

        localStorage.removeItem('authToken');

        setIsLoading(false);
        showInfo(`Goodbye, ${userName}! 👋`);
    };

    const isAuthenticated = !!currentUser && !!authToken;

    const isAdmin = currentUser && (
        currentUser.role === "admin" ||
        currentUser.role === "ADMIN"
    );

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated,
                isAdmin,
                login,
                logout,
                isLoading,
                authToken,
                userDatabaseId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}