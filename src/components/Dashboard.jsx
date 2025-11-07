import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/fixedHeader.css";


// Simplified Card Component for reusability
const StatCard = ({ title, value, percentage, icon, colorClass, percentageColor }) => (
    // Added animate-hover-lift class
    <div className="card shadow-sm border-0 h-100 rounded-3 animate-hover-lift">
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`p-3 rounded-circle bg-${colorClass}-light text-${colorClass} d-flex align-items-center justify-content-center`} style={{ width: '45px', height: '45px' }}>
                    <span className="fs-5">{icon}</span> 
                </div>
            </div>
            <p className="text-muted mb-1 small">{title}</p>
            <h3 className="card-title fw-bold mb-1">{value}</h3>
            <p className={`small fw-semibold text-${percentageColor}`}>
                <span className="me-1">↑</span> {percentage}
            </p>
        </div>
    </div>
);

// REMOVED THE sidebarCollapsed PROP AND INLINE STYLE
const Dashboard = () => {
    return (
        <div 
            className="flex-fill bg-light" 
            style={{ minHeight: '100vh' }} >

            <FixedHeader/>
        
         

            {/* Dashboard Content */}
            <main className="p-4">
                {/* 4 Stat Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-lg-3 col-md-6">
                        <StatCard 
                            title="Total Sales" 
                            value="$45,210" 
                            percentage="1.89%" 
                            icon="📈" 
                            colorClass="success"
                            percentageColor="success" 
                        />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <StatCard 
                            title="Total Income" 
                            value="$58,950" 
                            percentage="2.15%" 
                            icon="💵" 
                            colorClass="warning" 
                            percentageColor="success"
                        />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <StatCard 
                            title="Orders Paid" 
                            value="38,120" 
                            percentage="0.15%" 
                            icon="🛒" 
                            colorClass="danger" 
                            percentageColor="danger"
                        />
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <StatCard 
                            title="Total Visitor" 
                            value="45,120" 
                            percentage="1.89%" 
                            icon="👥" 
                            colorClass="info" 
                            percentageColor="success"
                        />
                    </div>
                </div>
                
                {/* Charts and Tables */}
                <div className="row g-4">
                    {/* Recent Order Chart */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-3 animate-hover-lift">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold">Recent Order</h5>
                                <div className="text-center bg-light p-5 my-4 border rounded-3" style={{ minHeight: '200px' }}>
                                    Line Chart Placeholder (Jan - Dec)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-3 animate-hover-lift">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold d-flex justify-content-between">
                                    Top Products
                                    <span className="small text-primary">View all</span>
                                </h5>
                                <ul className="list-group list-group-flush small">
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">Organic Coffee Beans <span className="text-muted">150 items</span></li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">Premium Pulphones Cat... <span className="text-muted">190 items</span></li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">Smart Fitness Tracker <span className="text-muted">100 items</span></li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">Gourmet Adulhut Dog <span className="text-muted">130 items</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Top Countries by Sales */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-3 animate-hover-lift">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold d-flex justify-content-between">
                                    Top Countries by Sales
                                    <span className="small text-primary">View all</span>
                              
                                </h5>
                                <ul className="list-group list-group-flush small">
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">🇹🇷 Turkish Flag <span className="fw-bold">6,972</span></li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">🇧🇪 Belgium <span className="fw-bold">6,972</span></li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">🇸🇪 Sweden <span className="fw-bold">6,972</span></li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-0">🇯🇵 Japan <span className="fw-bold">6,972</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
};

export default Dashboard;
