import React, { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo/client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Dashboard from "./components/Dashboard";

function AppContent() {
    const { isAuthenticated, isLoading } = useAuth();
    const [showSignup, setShowSignup] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-10 animate-pulse"></div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">MediScheduler</h1>
                    <p className="text-gray-600 mb-4">Loading your dashboard...</p>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Dashboard />;
    }

    return showSignup ? (
        <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
        <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
    );
}

function App() {
    return (
        <ApolloProvider client={client}>
            <ToastProvider>
                <AuthProvider>
                    <div className="App">
                        <AppContent />
                    </div>
                </AuthProvider>
            </ToastProvider>
        </ApolloProvider>
    );
}

export default App;