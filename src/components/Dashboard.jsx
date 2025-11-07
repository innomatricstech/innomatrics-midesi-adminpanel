import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// ✅ Recharts imports: PieChart, Pie, Cell, Legend added
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart, 
    Pie,      
    Cell,     
    Legend    
} from "recharts";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/fixedheader.css";
import "../styles/dashboard.css";
import FixedHeader from "./FixedHeader";

// ✅ StatCard Component (Updated to remove conflicting text classes)
const StatCard = ({ title, value, icon, colorClass, animationDelay }) => (
    // Apply animation class and inline style for staggered delay
    <div 
        className={`card shadow border-0 h-100 rounded-4 animate-hover-lift stat-card-${colorClass} stat-card-animated`}
        style={{ animationDelay: `${animationDelay}ms` }}
    >
        <div className="card-body position-relative">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                    className={`p-3 rounded-circle icon-${colorClass} d-flex align-items-center justify-content-center shadow-sm`}
                    style={{ width: "55px", height: "55px" }}
                >
                    <span className="fs-4">{icon}</span>
                </div>
            </div>
            {/* REMOVED: text-muted */}
            <p className="mb-1 small fw-semibold text-uppercase">{title}</p>
            {/* REMOVED: text-dark */}
            <h2 className="fw-bold mb-1">{value}</h2>
        </div>
    </div>
);


const Dashboard = () => {

    const [stats, setStats] = useState({
        todayTotalOrders: 0,
        todayPending: 0,
        todayCanceled: 0,
        todayDelivered: 0,
        totalProducts: 0,
        totalPartners: 0,
        totalCustomers: 0,
    });

    // 🌟 PIE CHART COLORS synchronized with the new success/warning/danger palette 🌟
    const PIE_DATA = [
        { name: 'Delivered', value: 400, color: '#0d9488' }, // Dark Teal
        { name: 'Pending', value: 300, color: '#f59e0b' },   // Dark Gold
        { name: 'Canceled', value: 300, color: '#dc2626' },  // Deep Red
    ];

    // ✅ Fetch counts from Firestore
    useEffect(() => {
        const fetchCounts = async () => {
            // ... (Firebase fetch logic remains the same)
            try {
                const partnersSnap = await getDocs(collection(db, "partners"));
                const customersSnap = await getDocs(collection(db, "customers"));
                const productsSnap = await getDocs(collection(db, "products"));

                setStats(prev => ({
                    ...prev,
                    totalPartners: partnersSnap.size,
                    totalCustomers: customersSnap.size,
                    totalProducts: productsSnap.size,
                }));
            } catch (error) {
                console.error("Firestore fetch error:", error);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="flex-fill bg-light" style={{ minHeight: "100vh" }}>
            <FixedHeader />

            <main className="p-4">

                {/* ✅ Today's Order Summary */}
                <h5 className="fw-bold mb-3">Today's Order Summary</h5>
                <div className="row g-4 mb-4">
                    {/* Staggered animation delay for stat cards (4 cards) */}
                    <div className="col-lg-3 col-md-6">
                        <StatCard title="Today's Total Orders" value={stats.todayTotalOrders} icon="🧾" colorClass="primary" animationDelay={0} />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <StatCard title="Today's Pending Orders" value={stats.todayPending} icon="⏳" colorClass="warning" animationDelay={100} />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <StatCard title="Today's Canceled Orders" value={stats.todayCanceled} icon="❌" colorClass="danger" animationDelay={200} />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <StatCard title="Today's Delivered Orders" value={stats.todayDelivered} icon="✅" colorClass="success" animationDelay={300} />
                    </div>
                </div>

                {/* ✅ Overall Stats */}
                <h5 className="fw-bold mb-3">Overall Business Stats</h5>
                <div className="row g-4 mb-4">
                    {/* Staggered animation delay for stat cards (3 cards) */}
                    <div className="col-lg-4 col-md-6">
                        <StatCard title="Total Products" value={stats.totalProducts} icon="📦" colorClass="info" animationDelay={400} />
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <StatCard title="Total Partners" value={stats.totalPartners} icon="🤝" colorClass="primary" animationDelay={500} />
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <StatCard title="Total Customers" value={stats.totalCustomers} icon="👥" colorClass="success" animationDelay={600} />
                    </div>
                </div>

                {/* ✅ Orders Charts (Line Chart and new Pie Chart) */}
                <div className="row g-4">
                    {/* Line Chart */}
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 animate-hover-lift chart-card">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold">Orders Analysis (Monthly)</h5>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={[
                                            { name: 'Jan', value: 30 },
                                            { name: 'Feb', value: 45 },
                                            { name: 'Mar', value: 28 },
                                            { name: 'Apr', value: 60 },
                                            { name: 'May', value: 75 },
                                        ]}>
                                            <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontWeight: 600 }} />
                                            <YAxis tick={{ fill: '#6b7280', fontWeight: 600 }} />
                                            <Tooltip contentStyle={{
                                                borderRadius: '12px',
                                                padding: '10px',
                                                border: 'none',
                                                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                                            }} />
                                            {/* Line stroke matches the Deep Blue color */}
                                            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4}
                                                dot={{ r: 5, fill: '#2563eb' }}
                                                activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PIE Chart */}
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 animate-hover-lift chart-card">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold">Orders by Status (Overall)</h5>
                                <div className="chart-container d-flex justify-content-center align-items-center">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={PIE_DATA}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                fill="#8884d8"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {/* Cells use the updated PIE_DATA colors */}
                                                {PIE_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{
                                                    paddingTop: '10px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500',
                                                }}
                                            />
                                            <Tooltip contentStyle={{
                                                borderRadius: '12px',
                                                padding: '10px',
                                                border: 'none',
                                                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                                            }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;