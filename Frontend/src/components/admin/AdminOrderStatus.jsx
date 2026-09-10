
// import React from 'react';
// import { FiClock, FiCheckCircle, FiTruck, FiXCircle, FiPackage } from 'react-icons/fi';

// const AdminOrderStatus = ({ data, loading }) => {
//     if (loading) {
//         return (
//             <div className="bg-white rounded-2xl border border-sky-100 p-5 animate-pulse shadow-sm">
//                 <div className="h-6 bg-sky-100 rounded-full w-1/3 mb-4" />
//                 <div className="h-40 bg-sky-50 rounded-full mx-auto w-40" />
//             </div>
//         );
//     }

//     const defaultData = [
//         { status: 'pending', count: 45, color: '#7DD3FC', icon: FiClock },
//         { status: 'processing', count: 120, color: '#38BDF8', icon: FiPackage },
//         { status: 'shipped', count: 250, color: '#0EA5E9', icon: FiTruck },
//         { status: 'delivered', count: 780, color: '#1D4ED8', icon: FiCheckCircle },
//         { status: 'cancelled', count: 50, color: '#94A3B8', icon: FiXCircle },
//     ];

//     const items = data || defaultData;
//     const total = items.reduce((sum, item) => sum + item.count, 0);

//     const radius = 55;
//     const circumference = 2 * Math.PI * radius;
//     let currentOffset = 0;

//     const getIcon = (item) => {
//         const Icon = item.icon;
//         return <Icon className="w-3.5 h-3.5" />;
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-shadow duration-300">
//             <div className="flex items-center justify-between gap-3 mb-5">
//                 <div className="flex items-center gap-2.5">
//                     <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />
//                     <div>
//                         <h3 className="text-sm sm:text-base font-bold text-slate-800">Order Status</h3>
//                         <p className="text-[11px] text-slate-400 mt-0.5">Live distribution</p>
//                     </div>
//                 </div>
//                 <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full ring-1 ring-sky-100 whitespace-nowrap">
//                     Total: {total}
//                 </span>
//             </div>

//             <div className="flex flex-col sm:flex-row items-center gap-6">
//                 {/* Donut Chart */}
//                 <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex-shrink-0">
//                     <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 140 140">
//                         <circle cx="70" cy="70" r={radius} fill="none" stroke="#F0F9FF" strokeWidth="12" />
//                         {items.map((item, index) => {
//                             const percentage = (item.count / total) * 100;
//                             const dashArray = (percentage / 100) * circumference;
//                             const offset = currentOffset;
//                             currentOffset += dashArray;
//                             return (
//                                 <circle
//                                     key={index}
//                                     cx="70"
//                                     cy="70"
//                                     r={radius}
//                                     fill="none"
//                                     stroke={item.color}
//                                     strokeWidth="12"
//                                     strokeLinecap="round"
//                                     strokeDasharray={`${dashArray} ${circumference - dashArray}`}
//                                     strokeDashoffset={-offset}
//                                     className="transition-all duration-700"
//                                 />
//                             );
//                         })}
//                     </svg>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="text-center">
//                             <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">{total}</p>
//                             <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total Orders</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Legend */}
//                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full">
//                     {items.map((item, index) => {
//                         const percentage = ((item.count / total) * 100).toFixed(1);
//                         return (
//                             <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-sky-50 transition-colors">
//                                 <div className="flex items-center gap-2 min-w-0">
//                                     <span
//                                         className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
//                                         style={{ backgroundColor: item.color }}
//                                     />
//                                     <span className="text-xs font-medium text-slate-600 capitalize flex items-center gap-1 truncate">
//                                         {getIcon(item)}
//                                         {item.status}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-2 flex-shrink-0">
//                                     <span className="text-xs font-bold text-slate-800">{item.count}</span>
//                                     <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full font-semibold">{percentage}%</span>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminOrderStatus;




import React from 'react';
import {
    FiClock,
    FiCheckCircle,
    FiTruck,
    FiXCircle,
    FiPackage,
} from 'react-icons/fi';

const AdminOrderStatus = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-full overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <div className="animate-pulse">
                    <div className="mb-5 h-6 w-32 rounded-lg bg-sky-100" />
                    <div className="mx-auto h-40 w-40 rounded-full bg-slate-100" />

                    <div className="mt-5 space-y-2">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="h-10 w-full rounded-xl bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const defaultData = [
        {
            status: 'pending',
            count: 45,
            color: '#0EA5E9',
            icon: FiClock,
        },
        {
            status: 'processing',
            count: 120,
            color: '#3B82F6',
            icon: FiPackage,
        },
        {
            status: 'shipped',
            count: 250,
            color: '#6366F1',
            icon: FiTruck,
        },
        {
            status: 'delivered',
            count: 780,
            color: '#10B981',
            icon: FiCheckCircle,
        },
        {
            status: 'cancelled',
            count: 50,
            color: '#F43F5E',
            icon: FiXCircle,
        },
    ];

    const items = Array.isArray(data) && data.length > 0
        ? data
        : defaultData;

    const total = items.reduce(
        (sum, item) => sum + Number(item.count || 0),
        0
    );

    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    let currentOffset = 0;

    return (
        <div className="h-full min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-5">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-800">
                            Order Status
                        </h3>

                        <p className="truncate text-[11px] text-slate-400">
                            Live distribution
                        </p>
                    </div>
                </div>

                <span
                    title={`Total: ${total}`}
                    className="max-w-28 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-blue-700"
                >
                    Total: {total}
                </span>
            </div>

            <div className="mt-5 flex min-w-0 flex-col items-center">
                <div className="relative h-40 w-40 shrink-0">
                    <svg
                        className="h-full w-full -rotate-90"
                        viewBox="0 0 140 140"
                        aria-label={`Order status chart showing ${total} total orders`}
                    >
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-sky-50"
                        />

                        {items.map((item, index) => {
                            const count = Number(item.count || 0);
                            const percentage =
                                total > 0 ? (count / total) * 100 : 0;
                            const dashArray =
                                (percentage / 100) * circumference;
                            const offset = currentOffset;

                            currentOffset += dashArray;

                            return (
                                <circle
                                    key={`${item.status}-${index}`}
                                    cx="70"
                                    cy="70"
                                    r={radius}
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${dashArray} ${
                                        circumference - dashArray
                                    }`}
                                    strokeDashoffset={-offset}
                                    className="transition-all duration-700"
                                />
                            );
                        })}
                    </svg>

                    <div className="absolute inset-0 grid place-items-center">
                        <div className="max-w-24 overflow-hidden text-center">
                            <p
                                title={String(total)}
                                className="truncate text-2xl font-bold text-slate-900"
                            >
                                {total}
                            </p>

                            <p className="truncate text-[10px] font-semibold uppercase text-slate-400">
                                Total Orders
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid w-full min-w-0 grid-cols-1 gap-2">
                    {items.map((item, index) => {
                        const Icon = item.icon || FiClock;
                        const count = Number(item.count || 0);
                        const percentage =
                            total > 0
                                ? ((count / total) * 100).toFixed(1)
                                : '0.0';

                        return (
                            <div
                                key={`${item.status}-${index}`}
                                className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_112px] items-center gap-2 overflow-hidden rounded-xl border border-transparent bg-slate-50 px-3 py-2 transition-colors hover:border-sky-100 hover:bg-sky-50"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor: item.color,
                                        }}
                                    />

                                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                    <span
                                        title={item.status}
                                        className="min-w-0 truncate text-xs font-semibold capitalize text-slate-600"
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_52px] items-center justify-end gap-1.5 overflow-hidden">
                                    <span
                                        title={String(count)}
                                        className="min-w-0 truncate text-right text-xs font-bold text-slate-900"
                                    >
                                        {count}
                                    </span>

                                    <span
                                        title={`${percentage}%`}
                                        className="w-[52px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-white px-1.5 py-1 text-center text-[10px] font-semibold text-blue-600 ring-1 ring-sky-100"
                                    >
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderStatus;
