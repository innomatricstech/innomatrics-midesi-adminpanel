import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Recharts imports
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
import "../styles/dashboard.css";

// ✅ StatCard Component
const StatCard = ({ title, value, icon, colorClass, animationDelay }) => (
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

            <p className="mb-1 small fw-semibold text-uppercase">{title}</p>
            <h2 className="fw-bold mb-1">{value}</h2>
        </div>
    </div>
);

const Dashboard = () => {

    // ✅ STATS
    const [stats, setStats] = useState({
        todayTotalOrders: 0,
        todayPending: 0,
        todayCanceled: 0,
        todayDelivered: 0,
        totalProducts: 0,
        totalPartners: 0,
        totalCustomers: 0,
    });

    // ✅ ADMIN DATA
    const [adminData, setAdminData] = useState(null);

    // ✅ DAILY ORDERS LIST
    const [todayOrders, setTodayOrders] = useState([]);

    const displayName = adminData?.name || "Admin";
    const displayEmail = adminData?.email || "No Email";
    const displayUid = adminData?.uid || adminData?.id || "Unknown UID";

    const userPhoto =
        adminData?.photoURL && adminData.photoURL !== "null"
            ? adminData.photoURL
            : "https://static.vecteezy.com/system/resources/previews/024/183/502/non_2x/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg";

    const PIE_DATA = [
        { name: 'Delivered', value: 400, color: '#0d9488' },
        { name: 'Pending', value: 300, color: '#f59e0b' },
        { name: 'Canceled', value: 300, color: '#dc2626' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Fetch Admin Data
                const adminSnap = await getDocs(collection(db, "admins"));
                if (!adminSnap.empty) {
                    setAdminData({
                        id: adminSnap.docs[0].id,
                        ...adminSnap.docs[0].data(),
                    });
                }

                // =============================
                // ✅ Fetch Today's Orders
                // =============================
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);

                const ordersSnap = await getDocs(collection(db, "orders"));
                const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const todaysOrders = allOrders.filter(order => {
                    if (!order.createdAt) return false;
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= todayStart && orderDate <= todayEnd;
                });

                setTodayOrders(todaysOrders);

                setStats(prev => ({
                    ...prev,
                    todayTotalOrders: todaysOrders.length,
                    todayPending: todaysOrders.filter(o => o.status === "pending").length,
                    todayCanceled: todaysOrders.filter(o => o.status === "canceled").length,
                    todayDelivered: todaysOrders.filter(o => o.status === "delivered").length,
                }));

                // =============================
                // Fetch Total Stats (Products, Partners, Customers)
                // =============================
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

        fetchData();
    }, []);

    return (
        <div className="flex-fill bg-light" style={{ minHeight: "100vh" }}>

            {/* ✅ ADMIN PROFILE CARD */}
            <div
                className="card shadow border-0 rounded-4 p-3 mb-4 d-flex align-items-center flex-sm-row flex-column text-center text-sm-start"
                style={{ marginTop: "-30px" }}
            >
                <img
                    src={userPhoto}
                    alt={displayName}
                    className="rounded-circle shadow-sm border border-2"
                    width="80"
                    height="80"
                    style={{ objectFit: "cover" }}
                />

                <div className="ms-sm-4 mt-3 mt-sm-0">
                    <h5 className="fw-bold mb-1">{displayName}</h5>
                    <p className="text-muted mb-1">{displayEmail}</p>
                    <p className="text-muted small mb-0">
                        <strong>User ID:</strong> {displayUid}
                    </p>
                </div>
            </div>

            <main className="p-4">

                {/* ==================================================== */}
                {/* ✅ Today's Order Summary */}
                {/* ==================================================== */}
                <h5 className="fw-bold mb-3">Today's Order Summary</h5>
                <div className="row g-4 mb-4">
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

                {/* ==================================================== */}
                {/* Overall Stats */}
                {/* ==================================================== */}
                <h5 className="fw-bold mb-3">Overall Business Stats</h5>
                <div className="row g-4 mb-4">
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
                                            <CartesianGrid strokeDasharray="5 5" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="value" strokeWidth={4} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 animate-hover-lift chart-card">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold">Orders by Status (Overall)</h5>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={PIE_DATA}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={90}
                                            labelLine={false}
                                        >
                                            {PIE_DATA.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ==================================================== */}
                {/* ✅ DAILY ORDER LIST TABLE */}
                {/* ==================================================== */}
                <div className="card shadow border-0 rounded-4 mt-4 mb-5">
                    <div className="card-body">
                        <h5 className="fw-bold mb-3">Today's Orders</h5>

                        {todayOrders.length === 0 ? (
                            <p className="text-muted">No orders placed today.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Total Amount</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{order.customerName || "N/A"}</td>
                                                <td>₹{order.totalAmount || 0}</td>
                                                <td>
                                                    <span className={`badge 
                                                        ${order.status === "delivered" ? "bg-success" : ""}
                                                        ${order.status === "pending" ? "bg-warning text-dark" : ""}
                                                        ${order.status === "canceled" ? "bg-danger" : ""}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleTimeString()
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;