import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';

function OrderSuccessModal({ isOpen }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-6 fold:p-8 sm:p-12 max-w-sm w-full relative animate-scale-up border border-white/20">
                <div className="text-center">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-ecoGreen/10 dark:bg-ecoGreen/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <FaCheckCircle className="text-5xl text-ecoGreen" />
                        </div>
                        <h2 className="text-3xl font-ecoHeading font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                            Order <span className="text-ecoGreen">Placed!</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                            Freshness is on its way! 🎉
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs leading-relaxed max-w-[240px] mx-auto">
                            We've received your order and our team is already getting it ready.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/my-activity"
                            className="w-full inline-flex items-center justify-center gap-3 bg-ecoGreen hover:bg-ecoDark text-white font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-ecoGreen/20 hover:scale-[1.02] active:scale-95 text-xs"
                        >
                            <FaShoppingBag /> View My Orders
                        </Link>
                        <Link
                            to="/"
                            className="w-full inline-flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 text-xs"
                        >
                            <FaHome /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccessModal;
