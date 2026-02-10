import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaUser, FaEye, FaEyeSlash, FaArrowLeft, FaLeaf, FaSun, FaSeedling } from 'react-icons/fa';
import Notification from '../components/Notification';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setNotification({ show: true, message: 'Please enter a valid email address.', type: 'error' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setNotification({ show: true, message: 'Passwords do not match!', type: 'error' });
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setNotification({
                show: true,
                message: 'Password must be 8+ characters with uppercase, lowercase, and a number.',
                type: 'error'
            });
            return;
        }

        if (formData.phone) {
            const phoneRegex = /^(\+94|0)\d{9}$/;
            if (!phoneRegex.test(formData.phone)) {
                setNotification({
                    show: true,
                    message: 'Invalid phone format. Please use 0771234567 or +94771234567.',
                    type: 'error'
                });
                return;
            }
        }

        setLoading(true);

        const result = await signup(
            formData.name,
            formData.email,
            formData.password,
            formData.phone,
            formData.address
        );

        if (result.success) {
            navigate('/login', {
                state: {
                    message: 'Account created successfully! Please login with your credentials.'
                }
            });
        } else {
            setNotification({ show: true, message: result.error, type: 'error' });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-0 md:p-6 overflow-hidden font-authFont">
            {/* Professional Animated Background with Image */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/Images/background_form.jpg)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-ecoBeige/80 via-white/75 to-ecoLight/70 dark:from-gray-950/90 dark:via-gray-900/85 dark:to-ecoDark/80 backdrop-blur-sm"></div>
            </div>

            {/* Floating Organic Blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-ecoGreen/10 rounded-full blur-[120px] animate-float"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ecoLight/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-white/40 dark:bg-white/5 rounded-full blur-[80px] animate-pulse"></div>

            <div className="relative z-10 w-full max-w-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl rounded-3xl md:rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.08),0_32px_128px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_32px_128px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden border-2 border-white/60 dark:border-white/20 p-8 md:p-12">

                {/* Floating Home Button */}
                <Link to="/" className="absolute top-6 right-6 z-50 group flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
                    <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform text-ecoGreen" />
                    <span className="font-black text-[9px] uppercase tracking-[0.2em] text-gray-900 dark:text-white">Home</span>
                </Link>

                <div className="flex flex-col items-center mb-6 animate-fade-in-up">
                    <Link to="/" className="mb-4 group transition-transform hover:scale-110 relative">
                        <div className="absolute inset-0 bg-ecoGreen/10 rounded-full blur-xl group-hover:bg-ecoGreen/20 transition-colors"></div>
                        <div className="relative w-20 h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-2xl overflow-hidden">
                            <FaSeedling className="w-10 h-10 text-ecoGreen animate-jump" />
                        </div>
                    </Link>
                    <h2 className="text-3xl font-ecoHeading font-black text-gray-900 dark:text-white mb-1 tracking-tight">Create Account</h2>
                    <p className="text-gray-600 dark:text-gray-400 font-bold text-sm text-center">Join Our Green Community</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-1">Start your journey today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                            <div className="relative shadow-sm rounded-xl">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-ecoGreen transition-colors z-10" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-ecoGreen focus:ring-4 focus:ring-ecoGreen/20 focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus:-translate-y-0.5 transition-all duration-300 outline-none text-gray-950 dark:text-white font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                            <div className="relative shadow-sm rounded-xl">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-ecoGreen transition-colors z-10" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                    className="w-full pl-11 pr-4 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-ecoGreen focus:ring-4 focus:ring-ecoGreen/20 focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus:-translate-y-0.5 transition-all duration-300 outline-none text-gray-950 dark:text-white font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                            <div className="relative shadow-sm rounded-xl">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-ecoGreen transition-colors z-10" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0771234567"
                                    className="w-full pl-11 pr-4 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-ecoGreen focus:ring-4 focus:ring-ecoGreen/20 focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus:-translate-y-0.5 transition-all duration-300 outline-none text-gray-950 dark:text-white font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Location</label>
                            <div className="relative shadow-sm rounded-xl">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-ecoGreen transition-colors z-10" />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Colombo, SL"
                                    className="w-full pl-11 pr-4 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-ecoGreen focus:ring-4 focus:ring-ecoGreen/20 focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus:-translate-y-0.5 transition-all duration-300 outline-none text-gray-950 dark:text-white font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 group">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
                        <div className="relative shadow-sm rounded-xl">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-ecoGreen transition-colors z-10" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-ecoGreen focus:ring-4 focus:ring-ecoGreen/20 focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus:-translate-y-0.5 transition-all duration-300 outline-none text-gray-950 dark:text-white font-bold text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ecoGreen transition-colors"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5 group">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
                        <div className="relative shadow-sm rounded-xl">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-ecoGreen transition-colors z-10" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-ecoGreen focus:ring-4 focus:ring-ecoGreen/20 focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus:-translate-y-0.5 transition-all duration-300 outline-none text-gray-950 dark:text-white font-bold text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-ecoGreen transition-colors"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ecoGreen hover:bg-ecoDark text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all duration-300 shadow-xl shadow-ecoGreen/20 hover:shadow-ecoGreen/40 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        ) : (
                            <>
                                <span>Register</span>
                                <FaUserPlus className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 text-center pb-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-ecoGreen hover:text-ecoDark transition-colors ml-2 border-b-2 border-ecoGreen/30 hover:border-ecoGreen pb-0.5">
                            Login Here
                        </Link>
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400 dark:text-gray-500">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Data Protected</span>
                    </div>
                </div>

                {notification.show && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification({ ...notification, show: false })}
                    />
                )}
            </div>
        </div>
    );
}

export default Signup;

