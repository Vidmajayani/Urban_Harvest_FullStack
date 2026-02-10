import { FaUser, FaEnvelope, FaPhone, FaShoppingCart, FaCalendar, FaDollarSign } from 'react-icons/fa';

function ProductSalesList({ sales, totalSold, totalRevenue, totalCustomers }) {
    if (!sales || sales.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <FaShoppingCart className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No sales yet for this product</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 text-white p-3 rounded-lg">
                            <FaShoppingCart className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Total Quantity Sold</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalSold}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white p-3 rounded-lg">
                            <FaDollarSign className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-300 font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-100">Rs {totalRevenue}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500 text-white p-3 rounded-lg">
                            <FaUser className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">Unique Customers</p>
                            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalCustomers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Cards (Visible only on mobile) */}
            <div className="md:hidden space-y-4">
                {sales.map((sale, index) => (
                    <div key={`${sale.order_id}-${index}`} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                    <FaUser className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{sale.user_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(sale.order_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Qty: {sale.quantity}</p>
                                <p className="text-xs text-ecoGreen font-bold">Rs {sale.subtotal}</p>
                            </div>
                        </div>
                        <div className="space-y-1 pl-11">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <FaEnvelope className="text-[10px]" />
                                <span className="truncate">{sale.user_email}</span>
                            </div>
                            {sale.user_phone && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <FaPhone className="text-[10px]" />
                                    <span>{sale.user_phone}</span>
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
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Detail
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Order Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {sales.map((sale, index) => (
                            <tr key={`${sale.order_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                            <FaUser className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{sale.user_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <FaEnvelope className="text-xs" />
                                            <span>{sale.user_email}</span>
                                        </div>
                                        {sale.user_phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <FaPhone className="text-xs" />
                                                <span>{sale.user_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            Qty: {sale.quantity}
                                        </p>
                                        <p className="text-xs text-ecoGreen font-bold">
                                            Rs {sale.subtotal}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCalendar className="text-xs" />
                                        <span>{new Date(sale.order_date).toLocaleDateString('en-US', {
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

export default ProductSalesList;
