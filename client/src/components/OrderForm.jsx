import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaShoppingCart, FaMapMarkerAlt, FaCreditCard, FaLock, FaCheckCircle, FaExclamationCircle, FaStar } from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";

function OrderForm({ productId, title, initialQuantity = 1, price = 0, initialSubscription = false }) {
    // Personal & Delivery Info
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        deliveryAddress: "",
        city: "",
        state: "",
        zipCode: "",
        quantity: initialQuantity
    });

    // Payment Info
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [total, setTotal] = useState(price * initialQuantity);

    // Subscription state
    const [isSubscription, setIsSubscription] = useState(initialSubscription);
    const [subscriptionFrequency, setSubscriptionFrequency] = useState("weekly");
    const { showNotification } = useNotification();

    // Update total when quantity changes
    useEffect(() => {
        setTotal(formData.quantity * price);
    }, [formData.quantity, price]);

    // Update quantity from props
    useEffect(() => {
        setFormData(prev => ({ ...prev, quantity: initialQuantity }));
    }, [initialQuantity]);


    // Validation
    const validate = () => {
        let tempErrors = {};

        // Personal info
        if (!formData.name.trim()) tempErrors.name = "Name required";
        if (!formData.email) tempErrors.email = "Email required";
        else if (!/\S+@\S+\.\S/.test(formData.email)) tempErrors.email = "Invalid email";
        if (!formData.phone) tempErrors.phone = "Phone required";
        else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) tempErrors.phone = "Invalid phone";

        // Delivery address
        if (!formData.deliveryAddress.trim()) tempErrors.deliveryAddress = "Address required";
        if (!formData.city.trim()) tempErrors.city = "City required";
        if (!formData.state.trim()) tempErrors.state = "State required";
        if (!formData.zipCode) tempErrors.zipCode = "ZIP required";
        else if (!/^\d{5,6}$/.test(formData.zipCode)) tempErrors.zipCode = "Invalid ZIP";

        if (formData.quantity < 1) tempErrors.quantity = "Min 1";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleZipChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData({ ...formData, zipCode: value });
        if (errors.zipCode) setErrors({ ...errors, zipCode: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                // Import ordersAPI
                const { ordersAPI } = await import('../services/api');

                // Prepare order data
                const orderData = {
                    product_id: productId,
                    quantity: formData.quantity,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    delivery_address: formData.deliveryAddress,
                    delivery_city: formData.city,
                    delivery_state: formData.state,
                    delivery_zip: formData.zipCode,
                    payment_method: paymentMethod,
                    is_subscription: isSubscription,
                    subscription_frequency: isSubscription ? subscriptionFrequency : null
                };

                // Create order in database
                await ordersAPI.create(orderData);

                setSubmitted(true);
                console.log("✅ Order saved to database:", { product: title, ...orderData, total });
            } catch (error) {
                console.error('Error saving order:', error);
                showNotification('Failed to place order. Please try again.', 'error');
            }
        }
    };

    // Success message
    if (submitted) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 fold:p-6 rounded-xl fold:rounded-2xl text-center">
                <div className="bg-green-100 dark:bg-green-800/50 w-12 h-12 fold:w-16 fold:h-16 rounded-full flex items-center justify-center mx-auto mb-3 fold:mb-4">
                    <FaCheckCircle className="text-2xl fold:text-3xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base fold:text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">Order Successful!</h3>
                <p className="text-xs fold:text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Ordered <span className="font-bold">{formData.quantity} × {title}</span>
                </p>
                <p className="text-lg fold:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white my-3 fold:my-4">
                    Total: Rs {total.toFixed(2)}
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-ecoGreen/20 shadow-sm mb-6 max-w-sm mx-auto">
                    <p className="font-bold text-gray-800 dark:text-white mb-3">How was your experience?</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/my-activity"
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-ecoGreen text-white hover:bg-ecoDark transition-colors"
                        >
                            <FaStar className="text-xl mb-1" />
                            <span className="text-sm font-bold">Review Now</span>
                        </Link>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({ name: "", email: "", phone: "", deliveryAddress: "", city: "", state: "", zipCode: "", quantity: 1 });
                            }}
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FaShoppingCart className="text-xl mb-1" />
                            <span className="text-sm font-bold">Shop More</span>
                        </button>
                    </div>
                </div>

                <p className="text-[10px] fold:text-xs text-gray-500 dark:text-gray-400">
                    Confirmation sent to {formData.email}
                </p>
            </div>
        );
    }

    // Form
    return (
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 shadow-eco rounded-xl fold:rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-base fold:text-lg sm:text-2xl font-ecoHeading mb-4 fold:mb-5 text-gray-800 dark:text-white flex items-center gap-2">
                <FaShoppingCart className="text-ecoGreen text-sm fold:text-base sm:text-xl" />
                Complete Your Order
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 fold:space-y-5">
                {/* Personal Info */}
                <div className="space-y-3 fold:space-y-4">
                    <h4 className="text-sm fold:text-base font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Contact Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 fold:gap-4">
                        <div>
                            <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Full Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-2 fold:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs fold:text-sm" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm Rs {errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-2 fold:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs fold:text-sm" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm Rs {errors.email ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {errors.email && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.email}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm Rs {errors.phone ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`}
                            placeholder="1234567890"
                        />
                        {errors.phone && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.phone}</p>}
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 fold:space-y-4">
                    <h4 className="text-sm fold:text-base font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Delivery Address
                    </h4>

                    <div>
                        <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Street Address</label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-2 fold:left-3 top-2 fold:top-3 text-gray-400 text-xs fold:text-sm" />
                            <input
                                type="text"
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleChange}
                                className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm Rs {errors.deliveryAddress ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`}
                                placeholder="123 Main St"
                            />
                        </div>
                        {errors.deliveryAddress && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.deliveryAddress}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-2 fold:gap-3">
                        <div>
                            <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full px-2 fold:px-3 py-2 fold:py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm Rs {errors.city ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} placeholder="City" />
                            {errors.city && <p className="text-red-500 text-[9px] mt-0.5">Required</p>}
                        </div>
                        <div>
                            <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className={`w-full px-2 fold:px-3 py-2 fold:py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm ${errors.state ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} placeholder="State" />
                            {errors.state && <p className="text-red-500 text-[9px] mt-0.5">Required</p>}
                        </div>
                        <div>
                            <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">ZIP</label>
                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleZipChange} className={`w-full px-2 fold:px-3 py-2 fold:py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm ${errors.zipCode ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} placeholder="12345" />
                            {errors.zipCode && <p className="text-red-500 text-[9px] mt-0.5">Invalid</p>}
                        </div>
                    </div>
                </div>

                {/* Subscription Options */}
                <div className="space-y-3 fold:space-y-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm fold:text-base font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        🔄 Subscription Options
                    </h4>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSubscription}
                            onChange={(e) => setIsSubscription(e.target.checked)}
                            className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div>
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                Make this a subscription
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Get regular deliveries and never run out!
                            </p>
                        </div>
                    </label>

                    {isSubscription && (
                        <div className="mt-3 pl-7">
                            <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Delivery Frequency
                            </label>
                            <select
                                value={subscriptionFrequency}
                                onChange={(e) => setSubscriptionFrequency(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="weekly">Weekly (Every 7 days)</option>
                                <option value="bi-weekly">Bi-weekly (Every 14 days)</option>
                                <option value="monthly">Monthly (Every 30 days)</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                💡 You can pause or cancel anytime from "My Orders"
                            </p>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-ecoGreen/5 to-ecoDark/5 dark:from-ecoGreen/10 dark:to-ecoDark/10 p-3 fold:p-4 rounded-lg fold:rounded-xl border border-ecoGreen/20">
                    <h4 className="text-sm fold:text-base font-bold text-gray-800 dark:text-white mb-2 fold:mb-3">Order Summary</h4>
                    <div className="space-y-1.5 fold:space-y-2 text-xs fold:text-sm">
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>Product: {title}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                            <span>Quantity</span>
                            <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm text-center" />
                        </div>
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>Price</span>
                            <span>{formData.quantity} × Rs {price}</span>
                        </div>
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-base fold:text-lg text-gray-900 dark:text-white">
                            <span>Total</span>
                            <span className="text-ecoGreen dark:text-ecoLight">Rs {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-3 fold:space-y-4">
                    <h4 className="text-sm fold:text-base font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2 flex items-center gap-2">
                        <FaLock className="text-xs fold:text-sm text-green-600" />
                        Payment Information
                    </h4>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs fold:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-ecoGreen focus:ring-ecoGreen/20 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs fold:text-sm"
                        >
                            <option value="card">💳 Credit/Debit Card</option>
                            <option value="cash">💵 Cash on Delivery</option>
                            <option value="paypal">🅿️ PayPal</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Payment will be processed securely at delivery/checkout
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" className="w-full bg-gradient-to-r from-ecoGreen to-ecoDark hover:from-ecoDark hover:to-ecoGreen text-white font-bold py-3 fold:py-3.5 sm:py-4 px-4 rounded-lg fold:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs fold:text-sm sm:text-base flex items-center justify-center gap-2">
                    <FaLock className="text-xs fold:text-sm" />
                    Complete Order - Rs {total.toFixed(2)}
                </button>

                <p className="text-center text-[9px] fold:text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    🔒 Your payment is 100% secure and encrypted
                </p>
            </form>
        </div>
    );
}

export default OrderForm;

