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
    const { showSuccess, showError } = useToast();
    const apolloClient = useApolloClient();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Verify token is still valid
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
                setCurrentUser({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role.toLowerCase(),
                    phoneNumber: user.phoneNumber,
                    age: user.age,
                });
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

    return (
        <AuthContext.Provider value={{
            currentUser,
            isAuthenticated: !!currentUser,
            isAdmin: currentUser?.role === 'admin',
            login,
            logout,
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}