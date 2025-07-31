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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <h1 className="text-xl font-semibold text-gray-700">Scheduler App</h1>
                    <p className="text-gray-500">Loading your dashboard.</p>
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