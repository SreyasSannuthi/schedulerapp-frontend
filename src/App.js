import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo/client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

function AppContent() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="text-4xl mb-4">📅</div>
					<div className="text-lg text-gray-600">Loading Scheduler...</div>
				</div>
			</div>
		);
	}

	return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function App() {
	return (
		<ApolloProvider client={client}>
			<ToastProvider>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</ToastProvider>
		</ApolloProvider>
	);
}

export default App;