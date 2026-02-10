import { FaUser, FaEnvelope, FaPhone, FaUsers, FaCalendar } from 'react-icons/fa';

function BookingsList({ bookings, totalBookings, totalAttendees, type = 'event' }) {
    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <FaUsers className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No bookings yet for this {type}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 text-white p-3 rounded-lg">
                            <FaUsers className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Total Bookings</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalBookings}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white p-3 rounded-lg">
                            <FaUser className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-300 font-medium">Total Attendees</p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{totalAttendees}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Cards (Visible only on mobile) */}
            <div className="md:hidden space-y-4">
                {bookings.map((booking, index) => (
                    <div key={booking.booking_id || index} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                    <FaUser className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{booking.user_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(booking.booking_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-bold">
                                {booking.quantity} {booking.quantity === 1 ? 'person' : 'people'}
                            </span>
                        </div>
                        <div className="space-y-1 pl-11">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <FaEnvelope className="text-[10px]" />
                                <span className="truncate">{booking.user_email}</span>
                            </div>
                            {booking.user_phone && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <FaPhone className="text-[10px]" />
                                    <span>{booking.user_phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Attendees
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Booking Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {bookings.map((booking, index) => (
                            <tr key={booking.booking_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                            <FaUser className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{booking.user_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <FaEnvelope className="text-xs" />
                                            <span>{booking.user_email}</span>
                                        </div>
                                        {booking.user_phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <FaPhone className="text-xs" />
                                                <span>{booking.user_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                                        {booking.quantity} {booking.quantity === 1 ? 'person' : 'people'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCalendar className="text-xs" />
                                        <span>{new Date(booking.booking_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BookingsList;
