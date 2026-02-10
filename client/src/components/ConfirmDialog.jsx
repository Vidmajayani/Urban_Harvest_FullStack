import { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "No",
    confirmColor = "red" // red, blue, green, orange
}) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') onConfirm();
    };

    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        orange: 'bg-orange-600 hover:bg-orange-700'
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${confirmColor === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                            confirmColor === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                                confirmColor === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                    'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                            <FaExclamationTriangle className={`text-2xl ${confirmColor === 'red' ? 'text-red-600 dark:text-red-400' :
                                confirmColor === 'green' ? 'text-green-600 dark:text-green-400' :
                                    confirmColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-blue-600 dark:text-blue-400'
                                }`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition ${colorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
