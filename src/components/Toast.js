import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = React.createContext();

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

function Toast({ id, type, message, duration = 2000, onRemove }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onRemove(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onRemove]);

    const getToastStyles = () => {
        const baseStyles = "flex items-center p-4 mb-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out";

        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-500 text-white border-l-4 border-green-600`;
            case 'error':
                return `${baseStyles} bg-red-500 text-white border-l-4 border-red-600`;
            case 'warning':
                return `${baseStyles} bg-yellow-500 text-white border-l-4 border-yellow-600`;
            case 'info':
                return `${baseStyles} bg-blue-500 text-white border-l-4 border-blue-600`;
            default:
                return `${baseStyles} bg-gray-500 text-white border-l-4 border-gray-600`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <XCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    return (
        <div
            className={`${getToastStyles()} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            <span className="mr-3">{getIcon()}</span>
            <span className="flex-1">{message}</span>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onRemove(id), 300);
                }}
                className="ml-3 text-white hover:text-gray-200 focus:outline-none"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onRemove={removeToast}
                />
            ))}
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message, duration) => {
        const id = Date.now() + Math.random();
        const newToast = { id, type, message, duration };
        setToasts(prev => [...prev, newToast]);
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showSuccess = (message, duration) => addToast('success', message, duration);
    const showError = (message, duration) => addToast('error', message, duration);
    const showWarning = (message, duration) => addToast('warning', message, duration);
    const showInfo = (message, duration) => addToast('info', message, duration);

    const value = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        addToast,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export default Toast; 