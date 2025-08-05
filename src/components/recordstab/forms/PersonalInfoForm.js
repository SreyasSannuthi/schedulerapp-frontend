import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PATIENT_PERSONAL_INFO, GET_PATIENT_PERSONAL_INFO } from '../../../apollo/queries';
import { useToast } from '../../Toast';
import { User, Heart, Phone, AlertTriangle, Plus, X } from 'lucide-react';

function PersonalInfoForm({ onClose, patientId, initialData }) {
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState({
        bloodType: '',
        height: '',
        weight: '',
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const [allergyInput, setAllergyInput] = useState('');
    const [conditionInput, setConditionInput] = useState('');
    const [medicationInput, setMedicationInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                bloodType: initialData.bloodType || '',
                height: initialData.height || '',
                weight: initialData.weight || '',
                allergies: initialData.allergies || [],
                chronicConditions: initialData.chronicConditions || [],
                currentMedications: initialData.currentMedications || [],
                emergencyContactName: initialData.emergencyContactName || '',
                emergencyContactPhone: initialData.emergencyContactPhone || ''
            });
        }
    }, [initialData]);

    const [updatePersonalInfo, { loading }] = useMutation(UPDATE_PATIENT_PERSONAL_INFO, {
        refetchQueries: [
            { query: GET_PATIENT_PERSONAL_INFO, variables: { patientId } }
        ],
        onCompleted: () => {
            showSuccess('Personal information updated successfully!');
            onClose();
        },
        onError: (error) => {
            showError(`Failed to update: ${error.message}`);
        }
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addToArray = (field, input, setInput) => {
        if (input.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], input.trim()]
            }));
            setInput('');
        }
    };

    const removeFromArray = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updatePersonalInfo({
                variables: {
                    patientId,
                    input: {
                        bloodType: formData.bloodType || null,
                        height: formData.height ? parseFloat(formData.height) : null,
                        weight: formData.weight ? parseFloat(formData.weight) : null,
                        allergies: formData.allergies,
                        chronicConditions: formData.chronicConditions,
                        currentMedications: formData.currentMedications,
                        emergencyContactName: formData.emergencyContactName || null,
                        emergencyContactPhone: formData.emergencyContactPhone || null
                    }
                }
            });
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const renderArraySection = (title, field, input, setInput, icon, placeholder) => (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                    {icon}
                    {title}
                </div>
            </label>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(field, input, setInput))}
                />
                <button
                    type="button"
                    onClick={() => addToArray(field, input, setInput)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-1 font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {formData[field].length > 0 && (
                <div className="space-y-2">
                    {formData[field].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border">
                            <span className="text-sm text-gray-700">{item}</span>
                            <button
                                type="button"
                                onClick={() => removeFromArray(field, index)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg border border-gray-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <User className="w-6 h-6" />
                                {initialData ? 'Edit Personal Information' : 'Add Personal Information'}
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Update your medical and emergency contact details
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-indigo-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-md transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Medical Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Basic Medical Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Blood Type
                                </label>
                                <select
                                    value={formData.bloodType}
                                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Blood Type</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
                                    placeholder="175"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
                                    placeholder="70.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Medical Conditions & Medications
                        </h3>

                        {renderArraySection(
                            'Allergies',
                            'allergies',
                            allergyInput,
                            setAllergyInput,
                            <AlertTriangle className="w-4 h-4 text-red-500" />,
                            'Add allergy (e.g., Peanuts, Shellfish)'
                        )}

                        {renderArraySection(
                            'Chronic Conditions',
                            'chronicConditions',
                            conditionInput,
                            setConditionInput,
                            <Heart className="w-4 h-4 text-orange-500" />,
                            'Add chronic condition (e.g., Diabetes, Hypertension)'
                        )}

                        {renderArraySection(
                            'Current Medications',
                            'currentMedications',
                            medicationInput,
                            setMedicationInput,
                            <Plus className="w-4 h-4 text-blue-500" />,
                            'Add medication (e.g., Aspirin 100mg daily)'
                        )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-green-600" />
                            Emergency Contact
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.emergencyContactName}
                                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.emergencyContactPhone}
                                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                                    placeholder="1234567890"
                                    pattern="[0-9]{10}"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-2 text-white font-medium rounded-md transition-all ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {loading ? 'Saving...' : 'Save Personal Information'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PersonalInfoForm;