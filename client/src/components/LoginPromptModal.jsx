import { FaSignInAlt, FaTimes } from 'react-icons/fa';

function LoginPromptModal({ isOpen, onClose, onLogin, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-ecoGreen/10 dark:bg-ecoGreen/20 rounded-full flex items-center justify-center">
                        <FaSignInAlt className="text-3xl text-ecoGreen dark:text-ecoLight" />
                    </div>
                </div>

                {/* Message */}
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
                    Login Required
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onLogin}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-ecoGreen hover:bg-green-600 dark:bg-ecoGreen dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <FaSignInAlt />
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPromptModal;
