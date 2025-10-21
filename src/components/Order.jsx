import React, { useState, useEffect } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Mock API fetch simulation
const fetchOrders = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "#ORD001", customer: "John Doe", date: "2025-10-21", total: "450.00", status: "Pending", items: 3 },
        { id: "#ORD002", customer: "Jane Smith", date: "2025-10-20", total: "1200.00", status: "Completed", items: 5 },
        { id: "#ORD003", customer: "Alice Johnson", date: "2025-10-19", total: "750.00", status: "Cancelled", items: 2 },
      ]);
    }, 1000);
  });

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);

  const [newOrder, setNewOrder] = useState({
    customer: "",
    date: "",
    items: "",
    total: "",
    status: "Pending",
  });

  useEffect(() => {
    const getOrders = async () => {
      const data = await fetchOrders();
      setOrders(data);
    };
    getOrders();
  }, []);

  const handleDelete = () => {
    setOrders(orders.filter((o) => o.id !== deleteOrder.id));
    setDeleteOrder(null);
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(
      orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  const handleAddOrder = () => {
    const newId = `#ORD${(orders.length + 1).toString().padStart(3, "0")}`;
    setOrders([...orders, { ...newOrder, id: newId }]);
    setNewOrder({ customer: "", date: "", items: "", total: "", status: "Pending" });
    setShowAddModal(false);
  };

  const handleEditOrder = () => {
    setOrders(
      orders.map((o) => (o.id === editOrder.id ? editOrder : o))
    );
    setEditOrder(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />
      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Order Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button
            className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
          >
            <span className="me-2">+</span> Add New Order
          </button>
        </div>

        {/* Orders Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="align-middle hover-shadow">
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.items}</td>
                    <td className="fw-bold">₹{order.total}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm ${
                          order.status === "Pending"
                            ? "bg-warning text-dark"
                            : order.status === "Completed"
                            ? "bg-success text-white"
                            : "bg-danger text-white"
                        }`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-1 shadow-sm"
                        onClick={() => setViewOrder(order)}
                        title="View Order"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning me-1 shadow-sm"
                        onClick={() => setEditOrder(order)}
                        title="Edit Order"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger shadow-sm"
                        onClick={() => setDeleteOrder(order)}
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Order</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-control" value={newOrder.customer} onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={newOrder.date} onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Items</label>
                    <input type="number" className="form-control" value={newOrder.items} onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total (₹)</label>
                    <input type="text" className="form-control" value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}>
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddOrder}>Add Order</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editOrder && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Order {editOrder.id}</h5>
                  <button type="button" className="btn-close" onClick={() => setEditOrder(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-control" value={editOrder.customer} onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={editOrder.date} onChange={(e) => setEditOrder({ ...editOrder, date: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Items</label>
                    <input type="number" className="form-control" value={editOrder.items} onChange={(e) => setEditOrder({ ...editOrder, items: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total (₹)</label>
                    <input type="text" className="form-control" value={editOrder.total} onChange={(e) => setEditOrder({ ...editOrder, total: e.target.value })}/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={editOrder.status} onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}>
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setEditOrder(null)}>Cancel</button>
                  <button className="btn btn-warning" onClick={handleEditOrder}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View & Delete modals remain unchanged */}
        {viewOrder && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Order Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewOrder(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Order ID:</strong> {viewOrder.id}</p>
                  <p><strong>Customer:</strong> {viewOrder.customer}</p>
                  <p><strong>Date:</strong> {viewOrder.date}</p>
                  <p><strong>Items:</strong> {viewOrder.items}</p>
                  <p><strong>Total:</strong> ₹{viewOrder.total}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        viewOrder.status === "Pending"
                          ? "bg-warning text-dark"
                          : viewOrder.status === "Completed"
                          ? "bg-success"
                          : "bg-danger"
                      } px-3 py-2 fw-semibold`}
                    >
                      {viewOrder.status}
                    </span>
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewOrder(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteOrder && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-sm">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Order</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteOrder(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteOrder.id}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteOrder(null)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .btn-gradient-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
        }
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
        }
        .hover-shadow:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default OrderPage;
