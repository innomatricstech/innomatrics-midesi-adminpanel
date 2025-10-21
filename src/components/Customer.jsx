import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Sample customer data
const initialCustomers = [
  {
    id: "#C1001",
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    addresses: [
      { id: "#A1", type: "Home", address: "123 Main St, City, Country" },
      { id: "#A2", type: "Work", address: "456 Office Rd, City, Country" },
    ],
    notifications: [
      { id: "#N1", message: "Promo: 20% off!", date: "2025-10-20" },
      { id: "#N2", message: "Order shipped", date: "2025-10-18" },
    ],
    orders: [
      { id: "#O1001", product: "Dog Food", amount: "₹1,452.50", status: "Delivered" },
      { id: "#O1002", product: "Grain Free Dog Food", amount: "₹1,250.00", status: "Pending" },
    ],
  },
  {
    id: "#C1002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "9123456780",
    addresses: [
      { id: "#A3", type: "Home", address: "789 Street, City, Country" },
    ],
    notifications: [
      { id: "#N3", message: "Welcome bonus added!", date: "2025-10-19" },
    ],
    orders: [
      { id: "#O1003", product: "Cat Food", amount: "₹800.00", status: "Delivered" },
    ],
  },
];

const CustomerDetails = () => {
  const [customers] = useState(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("data");

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Customer Details</h2>

        {/* Customer List */}
        <div className="mb-4">
          <h5>Select Customer</h5>
          <div className="d-flex gap-2 flex-wrap">
            {customers.map((customer) => (
              <button
                key={customer.id}
                className={`btn ${selectedCustomer?.id === customer.id ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setSelectedCustomer(customer)}
              >
                {customer.name}
              </button>
            ))}
          </div>
        </div>

        {selectedCustomer && (
          <div className="card shadow-lg border-0 rounded-4 p-4">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "data" ? "active" : ""}`} onClick={() => setActiveTab("data")}>
                  Data
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "address" ? "active" : ""}`} onClick={() => setActiveTab("address")}>
                  Address
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
                  Notifications
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
                  Orders
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div>
              {activeTab === "data" && (
                <div>
                  <p><strong>ID:</strong> {selectedCustomer.id}</p>
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                </div>
              )}

              {activeTab === "address" && (
                <div>
                  {selectedCustomer.addresses.map((addr) => (
                    <div key={addr.id} className="border p-3 mb-2 rounded">
                      <p><strong>{addr.type}:</strong> {addr.address}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  {selectedCustomer.notifications.map((note) => (
                    <div key={note.id} className="border p-3 mb-2 rounded">
                      <p>{note.message}</p>
                      <small className="text-muted">{note.date}</small>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.product}</td>
                          <td>{order.amount}</td>
                          <td>
                            <span className={`badge ${order.status === "Delivered" ? "bg-success" : "bg-warning text-dark"}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .nav-tabs .nav-link.active {
          background-color: #4f46e5;
          color: white;
        }
        .hover-shadow:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerDetails;
