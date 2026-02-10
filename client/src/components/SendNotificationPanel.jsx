import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaPaperPlane, FaTimes, FaUsers, FaUser } from 'react-icons/fa';

function SendNotificationPanel() {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        userId: '',
        title: '',
        body: ''
    });
    const [sendToAll, setSendToAll] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setMessage({ type: '', text: '' });

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // Choose endpoint based on sendToAll
            const endpoint = sendToAll ? '/api/notifications/send-all' : '/api/notifications/send';

            // Prepare payload
            const payload = sendToAll
                ? { title: formData.title, body: formData.body, url: '/' }
                : { ...formData, url: '/' };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const successMsg = sendToAll
                    ? `✅ Notification sent to all users successfully!`
                    : `✅ Notification sent successfully!`;
                setMessage({ type: 'success', text: successMsg });
                setFormData({ userId: '', title: '', body: '' });
                setSendToAll(false);
            } else {
                setMessage({ type: 'error', text: data.error || data.message || 'Failed to send notification' });
            }
        } catch (error) {
            console.error('Send notification error:', error);
            setMessage({ type: 'error', text: 'Failed to send notification. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <FaBell className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Send Push Notification</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notify users about important updates</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-4 p-4 rounded-xl flex items-center justify-between ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-2">
                        <FaTimes />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Send to All Toggle */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sendToAll}
                            onChange={(e) => {
                                setSendToAll(e.target.checked);
                                if (e.target.checked) {
                                    setFormData({ ...formData, userId: '' });
                                }
                            }}
                            className="w-5 h-5 text-purple-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-2"
                        />
                        <div className="flex items-center gap-2">
                            {sendToAll ? (
                                <FaUsers className="text-purple-600 dark:text-purple-400" />
                            ) : (
                                <FaUser className="text-gray-600 dark:text-gray-400" />
                            )}
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {sendToAll ? 'Send to ALL Users' : 'Send to Specific User'}
                            </span>
                        </div>
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-8">
                        {sendToAll
                            ? '📢 Notification will be sent to all subscribed users'
                            : '👤 Notification will be sent to a specific user by ID'
                        }
                    </p>
                </div>

                {/* User ID - Only show if not sending to all */}
                {!sendToAll && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            User ID *
                        </label>
                        <input
                            type="number"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                            placeholder="e.g., 1"
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            The ID of the user to send the notification to
                        </p>
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Notification Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Order Shipped!"
                        maxLength={50}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                    </label>
                    <textarea
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Your order #123 has been shipped and will arrive in 2-3 days"
                        rows="3"
                        maxLength={150}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition resize-none"
                    />
                </div>



                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            <FaPaperPlane /> Send Notification
                        </>
                    )}
                </button>
            </form>

            {/* Quick Examples */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">💡 Quick Examples:</p>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                        <strong>Order Update:</strong> "Order Shipped!" → "Your order #123 is on the way"
                    </div>
                    <div>
                        <strong>Event Reminder:</strong> "Event Tomorrow!" → "Eco Workshop starts tomorrow at 10 AM"
                    </div>
                    <div>
                        <strong>New Product:</strong> "New Arrival!" → "Check out our fresh organic tomatoes"
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SendNotificationPanel;
