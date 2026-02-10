import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import ProfileImageUpload from '../components/ProfileImageUpload';
import ThemeToggle from '../components/ThemeToggle';

function AdminProfile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.profile_image);

    const handleImageUpdate = (newImageUrl) => {
        setProfileImage(newImageUrl);
        if (user) {
            setUser({ ...user, profile_image: newImageUrl });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">View your account information</p>
            </div>

            {/* Profile Card */}
            <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                {/* Profile Icon */}
                <div className="flex justify-center mb-6">
                    <ProfileImageUpload
                        currentImage={profileImage}
                        onImageUpdate={handleImageUpdate}
                        userName={user?.name || 'Admin User'}
                    />
                </div>

                {/* Profile Info */}
                <div className="space-y-6">
                    {/* Name */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Full Name</label>
                        <div className="flex items-center gap-3">
                            <FaUserCircle className="text-ecoGreen text-xl" />
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.name || 'Admin User'}</p>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Email Address</label>
                        <div className="flex items-center gap-3">
                            <FaEnvelope className="text-ecoGreen text-xl" />
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.email}</p>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Role</label>
                        <div className="flex items-center gap-3">
                            <FaShieldAlt className="text-ecoGreen text-xl" />
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-ecoGreen text-white">
                                Administrator
                            </span>
                        </div>
                    </div>

                    {/* Member Since */}
                    <div className="pb-4">
                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Member Since</label>
                        <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-ecoGreen text-xl" />
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Preferences</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                <ThemeToggle mode="text-only" />
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> This is a read-only view of your admin profile. Contact the system administrator to update your information.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;
