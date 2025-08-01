import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../apollo/queries";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";

function LoginForm({ onSwitchToSignup }) {
    const { login } = useAuth();
    const { showError, showSuccess } = useToast();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [loginMutation] = useMutation(LOGIN_MUTATION, {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
    });

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const { data, errors: mutationErrors } = await loginMutation({
                variables: {
                    email: formData.email.trim(),
                    password: formData.password,
                },
            });

            if (mutationErrors && mutationErrors.length > 0) {
                const errorMessage = mutationErrors[0].message;
                setErrors({ submit: errorMessage });
                showError(errorMessage);
                return;
            }

            if (data?.login?.token) {
                const loginResult = await login(data.login);
                if (loginResult.success) {
                    setFormData({ email: "", password: "" });
                } else {
                    setErrors({ submit: loginResult.error });
                    showError(loginResult.error);
                }
            } else {
                const errorMessage = data?.login?.message || "Login failed - no token received";
                setErrors({ submit: errorMessage });
                showError(errorMessage);
            }
        } catch (error) {
            let errorMessage = "Login failed";

            if (error.networkError) {
                if (error.networkError.statusCode === 403) {
                    errorMessage = "Access forbidden. Please check your credentials or contact support.";
                } else if (error.networkError.statusCode === 500) {
                    errorMessage = "Server error. Please try again later.";
                } else {
                    errorMessage = `Network error: ${error.networkError.message}`;
                }
            } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                errorMessage = error.graphQLErrors[0].message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setErrors({ submit: errorMessage });
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-blue-500 text-white text-2xl">
                        📅
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to Scheduler
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your credentials to access the appointment system
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter your email"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    <div>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                } transition-colors`}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onSwitchToSignup}
                            className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                            Don't have an account? Sign up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;