import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { SIGNUP_DOCTOR, SIGNUP_PATIENT } from "../apollo/queries";
import { useToast } from "./Toast";

function SignupForm({ onSwitchToLogin }) {
    const { showSuccess, showError } = useToast();
    const [selectedRole, setSelectedRole] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        age: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [signupDoctor] = useMutation(SIGNUP_DOCTOR);
    const [signupPatient] = useMutation(SIGNUP_PATIENT);

    const validateForm = () => {
        const newErrors = {};

        if (!selectedRole) {
            newErrors.role = "Please select a role";
        }

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (selectedRole === "patient") {
            if (!formData.phoneNumber.trim()) {
                newErrors.phoneNumber = "Phone number is required";
            } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
                newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
            }

            if (!formData.age) {
                newErrors.age = "Age is required";
            } else if (formData.age < 1 || formData.age > 120) {
                newErrors.age = "Please enter a valid age (1-120)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            age: "",
        });
        setErrors({});
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const inputData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            };

            let response;

            if (selectedRole === "doctor") {
                response = await signupDoctor({
                    variables: { input: inputData }
                });
            } else {
                inputData.phoneNumber = formData.phoneNumber.replace(/\s/g, "");
                inputData.age = parseInt(formData.age);

                response = await signupPatient({
                    variables: { input: inputData }
                });
            }

            const result = response.data[selectedRole === "doctor" ? "signupDoctor" : "signupPatient"];

            if (result.success) {
                showSuccess(result.message );
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phoneNumber: "",
                    age: "",
                });
                setSelectedRole("");
                setTimeout(() => {
                    onSwitchToLogin();
                }, 2000);
            } else {
                setErrors({ submit: result.message });
                showError(result.message);
            }

        } catch (error) {
            let errorMessage = "Registration failed. Please try again.";

            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
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

    const getRoleColor = (role) => {
        return role === "doctor" ? "border-blue-500 bg-blue-50" : "border-green-500 bg-green-50";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-blue-500 text-white text-2xl">
                        📅
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create Account
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {["doctor", "patient"].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleRoleChange(role)}
                                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                                        selectedRole === role
                                            ? getRoleColor(role)
                                            : "border-gray-300 bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="font-medium capitalize">{role}</div>
                                </button>
                            ))}
                        </div>
                        {errors.role && (
                            <p className="text-sm text-red-600">{errors.role}</p>
                        )}
                    </div>

                    {selectedRole && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name *
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Enter your full name"
                                    disabled={isLoading}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {selectedRole === "patient" && (
                                <>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                            Phone Number *
                                        </label>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                                            } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            placeholder="Enter 10-digit phone number"
                                            disabled={isLoading}
                                        />
                                        {errors.phoneNumber && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                                            Age *
                                        </label>
                                        <input
                                            id="age"
                                            name="age"
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                                errors.age ? 'border-red-300' : 'border-gray-300'
                                            } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            placeholder="Enter your age"
                                            disabled={isLoading}
                                        />
                                        {errors.age && (
                                            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password *
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Enter password (min 6 characters)"
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password *
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Confirm your password"
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {selectedRole && (
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                    isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                } transition-colors`}
                            >
                                {isLoading ? "Creating Account..." : `Sign up as ${selectedRole}`}
                            </button>
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                            Already have an account? Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupForm;