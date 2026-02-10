import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Professional Notification Component
 * Shows an animated toast message at the top right
 */
const Notification = ({ message, type = 'success', onClose, duration = 10000 }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 400); // Match animation duration
    };

    const icons = {
        success: <FaCheckCircle className="text-white text-xl" />,
        error: <FaExclamationCircle className="text-white text-xl" />,
        info: <FaInfoCircle className="text-white text-xl" />
    };

    const bgColors = {
        success: 'bg-ecoGreen',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white min-w-[320px] max-w-md backdrop-blur-md bg-opacity-90 ${bgColors[type]} ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>

            <div className="flex-1">
                <p className="font-semibold text-sm tracking-wide">{message}</p>
            </div>

            <button
                onClick={handleClose}
                className="ml-4 hover:bg-white/20 p-1.5 rounded-full transition-colors duration-200"
            >
                <FaTimes className="text-white/80" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full overflow-hidden" style={{ width: '100%' }}>
                <div
                    className="h-full bg-white/50 notification-progress"
                    style={{
                        animationDuration: `${duration}ms`
                    }}
                />
            </div>


        </div>
    );
};

export default Notification;
