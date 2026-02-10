import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, workshopsAPI } from '../services/api';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPlus, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const AdminCalendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    // Effect to update selected date when currentDate (month/year) changes
    useEffect(() => {
        const now = new Date();
        if (currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()) {
            setSelectedDate(now);
        } else {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
        }
    }, [currentDate]);

    const parseSQLDate = (dateInput) => {
        if (!dateInput) return { y: 0, m: 0, d: 0 };

        // If it's already a Date object (expected from MySQL driver)
        if (dateInput instanceof Date) {
            return {
                y: dateInput.getFullYear(),
                m: dateInput.getMonth() + 1,
                d: dateInput.getDate()
            };
        }

        // Fallback for strings (SQLite compatibility or partial parsing)
        const parts = String(dateInput).split('T')[0].split('-');
        return {
            y: parseInt(parts[0]) || 0,
            m: parseInt(parts[1]) || 0,
            d: parseInt(parts[2]) || 0
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, workshopsRes] = await Promise.all([
                eventsAPI.getAll(),
                workshopsAPI.getAll()
            ]);

            const events = eventsRes.data.events || [];
            const workshops = workshopsRes.data.workshops || [];

            const combined = [
                ...events.map(e => ({
                    ...e,
                    type: 'Event',
                    date: e.event_date,
                    displayTime: e.event_time,
                    path: `/admin/events/${e.event_id || e.id}`
                })),
                ...workshops.map(w => ({
                    ...w,
                    type: 'Workshop',
                    date: w.workshop_date,
                    displayTime: w.workshop_time,
                    path: `/admin/workshops/${w.workshop_id || w.id}`
                }))
            ];

            setItems(combined);

            // AUTO-NAVIGATE: If current month has no events but there are future events, jump to the first one
            const hasEventsInCurrentMonth = combined.some(item => {
                const { y, m } = parseSQLDate(item.date);
                return y === currentDate.getFullYear() && m === currentDate.getMonth() + 1;
            });

            if (!hasEventsInCurrentMonth && combined.length > 0) {
                // Find first event in the future relative to currentDate
                const sorted = [...combined].sort((a, b) => {
                    const da = new Date(a.date).getTime();
                    const db = new Date(b.date).getTime();
                    return da - db;
                });

                const firstItem = sorted[0];
                if (firstItem.date) {
                    const { y, m } = parseSQLDate(firstItem.date);
                    setCurrentDate(new Date(y, m - 1, 1));
                    setSelectedDate(new Date(y, m - 1, parseSQLDate(firstItem.date).d));
                }
            }

        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderHeader = () => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-8 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-ecoGreen/10 rounded-xl flex items-center justify-center text-ecoGreen">
                        <FaCalendarAlt className="text-xl md:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Master Schedule</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Visual management of upcoming activities</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 self-center md:self-auto">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl shadow-inner border border-gray-200 dark:border-gray-600">
                        <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all text-gray-600 dark:text-gray-300">
                            <FaChevronLeft size={14} />
                        </button>
                        <div className="px-3 md:px-6 flex items-center justify-center font-bold text-gray-800 dark:text-white text-sm md:text-base min-w-[110px] md:min-w-[150px]">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </div>
                        <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all text-gray-600 dark:text-gray-300">
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["S", "M", "T", "W", "T", "F", "S"];
        const fullDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 mb-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                {fullDays.map((day, idx) => (
                    <div key={day} className="text-center font-black text-gray-400 dark:text-gray-500 uppercase text-[10px] tracking-widest py-2">
                        <span className="hidden md:inline">{day}</span>
                        <span className="md:hidden">{days[idx]}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        // Empty cells for first week
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-12 md:h-32 bg-gray-50/10 dark:bg-gray-900/10 border-transparent"></div>);
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayItems = items.filter(item => {
                const { y, m, d } = parseSQLDate(item.date);
                return y === year && m === month + 1 && d === day;
            });

            const dateObj = new Date(year, month, day);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const isSelected = selectedDate?.toDateString() === dateObj.toDateString();

            cells.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(dateObj)}
                    className={`h-12 md:h-32 bg-white dark:bg-gray-800 border-r border-b border-gray-100 dark:border-gray-700/50 p-1 md:p-2 overflow-y-auto hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group relative cursor-pointer ${isSelected ? 'ring-2 ring-inset ring-ecoGreen/30 bg-ecoGreen/5 dark:bg-ecoGreen/10' : ''
                        }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs md:text-sm font-bold ${isToday
                            ? 'bg-ecoGreen text-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full shadow-md'
                            : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                            }`}>
                            {day}
                        </span>
                    </div>

                    {/* Desktop View: Full Items */}
                    <div className="hidden md:block space-y-1">
                        {dayItems.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); navigate(item.path); }}
                                className={`text-[10px] md:text-xs p-1 md:p-2 rounded-md cursor-pointer font-bold border-l-4 leading-tight transition-all hover:translate-x-1 shadow-sm ${item.type === 'Event'
                                    ? 'bg-orange-50 text-orange-700 border-orange-500 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-400'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-yellow-400'
                                    }`}
                                title={`${item.type}: ${item.title}`}
                            >
                                {item.title}
                            </div>
                        ))}
                    </div>

                    {/* Mobile View: Dots Only */}
                    <div className="md:hidden flex flex-wrap justify-center gap-0.5 mt-1">
                        {dayItems.slice(0, 3).map((item, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${item.type === 'Event' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                            />
                        ))}
                        {dayItems.length > 3 && <div className="text-[8px] leading-none text-ecoGreen">+</div>}
                    </div>
                </div>
            );
        }

        // Add enough trailing cells to complete the grid UI
        const totalCells = cells.length;
        const trailingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
        for (let i = 0; i < trailingCells; i++) {
            cells.push(<div key={`trailing-${i}`} className="h-12 md:h-32 bg-gray-50/10 dark:bg-gray-900/10 border-transparent"></div>);
        }

        return <div className="grid grid-cols-7 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">{cells}</div>;
    };

    const renderAgenda = () => {
        if (!selectedDate) return null;

        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        const selectedItems = items.filter(item => {
            const { y, m, d } = parseSQLDate(item.date);
            return y === year && m === month + 1 && d === day;
        });

        return (
            <div className="mt-6 md:hidden">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 px-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        Agenda for {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </h2>
                    <div className="h-1 px-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>

                <div className="space-y-3">
                    {selectedItems.length > 0 ? (
                        selectedItems.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(item.path)}
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 shadow-md flex items-center gap-4 transition-transform active:scale-95"
                                style={{ borderLeftColor: item.type === 'Event' ? '#f97316' : '#eab308' }}
                            >
                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${item.type === 'Event' ? 'bg-orange-50 dark:bg-orange-950' : 'bg-yellow-50 dark:bg-yellow-950'}`}>
                                    <FaClock className={item.type === 'Event' ? 'text-orange-500' : 'text-yellow-600'} />
                                    <span className={`text-[10px] font-bold ${item.type === 'Event' ? 'text-orange-700 dark:text-orange-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                                        {item.displayTime?.split(' ')[0] || ''}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-1">{item.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                        <FaMapMarkerAlt className="text-ecoGreen" />
                                        <span className="truncate">{item.location || 'Urban Harvest Hub'}</span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${item.type === 'Event' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {item.type}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                            <p className="text-gray-400 text-sm font-medium italic">No activities planned for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderLegend = () => {
        return (
            <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-6 bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full md:w-fit">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                    <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                    <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Workshops</span>
                </div>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-ecoGreen rounded-full shadow-sm"></div>
                    <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Today</span>
                </div>
                {items.length > 0 && (
                    <>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                        <div className="text-[10px] text-gray-400 font-bold">Planned: {items.length}</div>
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <div className="loading-spinner"></div>
                <p className="text-gray-500 font-bold animate-pulse">Syncing Schedule...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {renderAgenda()}
            {renderLegend()}
        </div>
    );
};

export default AdminCalendar;
