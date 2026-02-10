import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaTicketAlt, FaCommentAlt, FaCheckCircle, FaExclamationCircle, FaCreditCard, FaLock, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";

function BookingForm({ title, type, price = "Free", eventId, workshopId }) {
    // Determine the actual ID based on type
    const productId = type === 'Event' ? eventId : workshopId;
    // Parse price: can be "Free", "Rs 1500", or number
    const parsePrice = (priceValue) => {
        if (!priceValue || priceValue === "Free") return 0;
        if (typeof priceValue === 'number') return priceValue;
        if (typeof priceValue === 'string') {
            const match = priceValue.match(/[\d.]+/);
            return match ? parseFloat(match[0]) : 0;
        }
        return 0;
    };

    const isFree = !price || price === "Free";
    const numericPrice = parsePrice(price);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        tickets: 1,
        requests: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("card");

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [total, setTotal] = useState(numericPrice);
    const { showNotification } = useNotification();

    useEffect(() => {
        setTotal(formData.tickets * numericPrice);
    }, [formData.tickets, numericPrice]);

    const validate = () => {
        let tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Name required";
        else if (formData.name.length < 3) tempErrors.name = "Min 3 characters";
        if (!formData.email) tempErrors.email = "Email required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid email";
        if (!formData.phone) tempErrors.phone = "Phone required";
        else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) tempErrors.phone = "10 digits required";
        if (formData.tickets < 1) tempErrors.tickets = "Min 1 ticket";
        if (formData.tickets > 10) tempErrors.tickets = "Max 10 tickets";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const { bookingsAPI } = await import('../services/api');

                const bookingData = {
                    booking_type: type.toLowerCase(),
                    event_id: type === 'Event' ? productId : null,
                    workshop_id: type === 'Workshop' ? productId : null,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    special_requests: formData.requests,
                    quantity: formData.tickets,
                    total_amount: total,
                    payment_method: isFree ? null : paymentMethod
                };

                console.log('🚀 Sending booking data:', bookingData);
                console.log('📌 Type:', type, 'ProductId:', productId);

                await bookingsAPI.create(bookingData);

                setSubmitted(true);
                console.log("✅ Booking saved to database:", { type, title, ...formData, total });
            } catch (error) {
                console.error('Error saving booking:', error);
                showNotification('Failed to create booking. Please try again.', 'error');
            }
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 fold:p-6 rounded-xl text-center">
                <div className="bg-green-100 dark:bg-green-800/50 w-12 h-12 fold:w-16 fold:h-16 rounded-full flex items-center justify-center mx-auto mb-3 fold:mb-4">
                    <FaCheckCircle className="text-2xl fold:text-3xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base fold:text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">Booking Confirmed!</h3>
                <p className="text-xs fold:text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Booked <span className="font-bold">{formData.tickets} ticket(s)</span> for
                </p>
                <p className="text-sm fold:text-base font-ecoHeading text-ecoGreen dark:text-ecoLight mb-3">
                    {title}
                </p>
                <p className="text-lg fold:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {isFree ? "FREE" : `Total: Rs ${total.toFixed(2)}`}
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
                                setFormData({ name: "", email: "", phone: "", tickets: 1, requests: "" });
                            }}
                            className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FaTicketAlt className="text-xl mb-1" />
                            <span className="text-sm font-bold">Book More</span>
                        </button>
                    </div>
                </div>

                <p className="text-[10px] fold:text-xs text-gray-500">Confirmation sent to {formData.email}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 shadow-eco rounded-xl fold:rounded-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xs fold:text-sm sm:text-base md:text-2xl font-ecoHeading mb-3 fold:mb-4 sm:mb-5 text-gray-800 dark:text-white flex items-center gap-2">
                <FaTicketAlt className="text-ecoOrange text-[10px] fold:text-xs sm:text-sm md:text-xl" />
                Book Your Spot
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 fold:space-y-5">
                {/* Personal Info Section */}
                <div className="space-y-3 fold:space-y-4">
                    <h4 className="text-[10px] fold:text-xs sm:text-sm md:text-base font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Personal Information
                    </h4>

                    <div>
                        <label className="block text-[9px] fold:text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Full Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-2 fold:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs fold:text-sm" />
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-[10px] fold:text-xs sm:text-sm ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} placeholder="John Doe" />
                        </div>
                        {errors.name && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 fold:gap-4">
                        <div>
                            <label className="block text-[9px] fold:text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-2 fold:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs fold:text-sm" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-[10px] fold:text-xs sm:text-sm ${errors.email ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} placeholder="john@example.com" />
                            </div>
                            {errors.email && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-[9px] fold:text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Phone</label>
                            <div className="relative">
                                <FaPhone className="absolute left-2 fold:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs fold:text-sm" />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-[10px] fold:text-xs sm:text-sm ${errors.phone ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} placeholder="1234567890" />
                            </div>
                            {errors.phone && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.phone}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] fold:text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Tickets</label>
                        <div className="relative">
                            <FaTicketAlt className="absolute left-2 fold:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs fold:text-sm" />
                            <input type="number" name="tickets" min="1" max="10" value={formData.tickets} onChange={handleChange} className={`w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-2.5 sm:py-3 rounded-lg fold:rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-[10px] fold:text-xs sm:text-sm ${errors.tickets ? "border-red-300" : "border-gray-200 dark:border-gray-600 focus:border-ecoGreen focus:ring-ecoGreen/20"}`} />
                        </div>
                        {errors.tickets && <p className="flex items-center gap-1 text-red-500 text-[10px] fold:text-xs mt-1"><FaExclamationCircle />{errors.tickets}</p>}
                    </div>

                    <div>
                        <label className="block text-[9px] fold:text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Special Requests (Optional)</label>
                        <div className="relative">
                            <FaCommentAlt className="absolute left-2 fold:left-3 top-2 fold:top-3 text-gray-400 text-xs fold:text-sm" />
                            <textarea name="requests" rows="2" value={formData.requests} onChange={handleChange} className="w-full pl-8 fold:pl-10 pr-3 py-2 fold:py-3 rounded-lg fold:rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-ecoGreen focus:ring-ecoGreen/20 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-[10px] fold:text-xs sm:text-sm resize-none" placeholder="Dietary, accessibility needs, etc." />
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className={`p-3 fold:p-4 rounded-lg fold:rounded-xl border ${isFree ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700" : "bg-gradient-to-br from-ecoGreen/5 to-ecoOrange/5 dark:from-ecoGreen/10 dark:to-ecoOrange/10 border-ecoGreen/20"}`}>
                    <h4 className="text-xs fold:text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-2 fold:mb-3">Booking Summary</h4>
                    <div className="space-y-1.5 text-[10px] fold:text-xs sm:text-sm">
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>{type}: {title}</span>
                        </div>
                        {!isFree && (
                            <>
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>Tickets</span>
                                    <span>{formData.tickets} × Rs {numericPrice.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-sm fold:text-base sm:text-lg text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span className="text-ecoGreen dark:text-ecoLight">Rs {total.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        {isFree && (
                            <div className="flex justify-between font-bold text-sm fold:text-base sm:text-lg text-green-600 dark:text-green-400">
                                <span>Price</span>
                                <span>FREE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Section - Only if not free */}
                {!isFree && (
                    <div className="space-y-3 fold:space-y-4">
                        <h4 className="text-sm fold:text-base font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2 flex items-center gap-2">
                            <FaLock className="text-xs fold:text-sm text-green-600" />
                            Secure Payment
                        </h4>

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
                )}

                {/* Submit */}
                <button type="submit" className="w-full bg-gradient-to-r from-ecoGreen to-ecoDark hover:from-ecoDark hover:to-ecoGreen text-white font-bold py-3 fold:py-3.5 sm:py-4 px-4 rounded-lg fold:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs fold:text-sm sm:text-base flex items-center justify-center gap-2">
                    {!isFree && <FaLock className="text-xs fold:text-sm" />}
                    {isFree ? "Confirm Booking (FREE)" : `Complete Payment - Rs ${total.toFixed(2)}`}
                </button>

                {!isFree && (
                    <p className="text-center text-[9px] fold:text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        🔒 Your payment is encrypted and secure
                    </p>
                )}
            </form>
        </div>
    );
}

export default BookingForm;