import React from 'react';
import { FaTimes } from 'react-icons/fa';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    const typeStyles = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        info: 'bg-blue-500 hover:bg-blue-600',
        success: 'bg-green-500 hover:bg-green-600'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-none shadow-2xl max-w-md w-full border border-black dark:border-white overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 bg-gray-50 dark:bg-gray-900">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-none font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-black/10 dark:border-white/10"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-3 text-white rounded-none font-bold transition border border-black/20 dark:border-white/20 shadow-md active:scale-95 ${typeStyles[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
