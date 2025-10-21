import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Sample initial recharge requests
const initialRequests = [
  { id: "#RR1001", user: "Vishnu Prasath", provider: "Airtel", amount: 500, status: "Pending", date: "2025-10-20" },
  { id: "#RR1002", user: "Sneha Reddy", provider: "Jio", amount: 300, status: "Completed", date: "2025-10-19" },
  { id: "#RR1003", user: "Amit Kumar", provider: "BSNL", amount: 200, status: "Failed", date: "2025-10-18" },
];

const RechargeRequests = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [newRequest, setNewRequest] = useState({ user: "", provider: "Airtel", amount: 0, status: "Pending", date: "" });
  const [editRequest, setEditRequest] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Request
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#RR${1000 + requests.length + 1}`;
    setRequests([...requests, { ...newRequest, id: newId }]);
    setNewRequest({ user: "", provider: "Airtel", amount: 0, status: "Pending", date: "" });
    setShowAddModal(false);
  };

  // Edit Request
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setRequests(requests.map((r) => (r.id === editRequest.id ? editRequest : r)));
    setEditRequest(null);
  };

  // Delete Request
  const handleDelete = () => {
    setRequests(requests.filter((r) => r.id !== deleteRequest.id));
    setDeleteRequest(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />
      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Recharge Request Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Request
          </button>
        </div>

        {/* Requests Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Provider</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="align-middle hover-shadow">
                    <td>{req.id}</td>
                    <td>{req.user}</td>
                    <td>{req.provider}</td>
                    <td className="fw-bold">{req.amount}</td>
                    <td>
                      <span className={`badge ${
                        req.status === "Completed" ? "bg-success" : req.status === "Pending" ? "bg-warning text-dark" : "bg-danger"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.date}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewRequest(req)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditRequest(req)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteRequest(req)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Request Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Recharge Request</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">User</label>
                      <input type="text" className="form-control" value={newRequest.user} onChange={(e) => setNewRequest({ ...newRequest, user: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Provider</label>
                      <input type="text" className="form-control" value={newRequest.provider} onChange={(e) => setNewRequest({ ...newRequest, provider: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Amount (₹)</label>
                      <input type="number" className="form-control" value={newRequest.amount} onChange={(e) => setNewRequest({ ...newRequest, amount: parseInt(e.target.value) })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newRequest.status} onChange={(e) => setNewRequest({ ...newRequest, status: e.target.value })}>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Failed</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={newRequest.date} onChange={(e) => setNewRequest({ ...newRequest, date: e.target.value })} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Request</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Request Modal */}
        {editRequest && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Recharge Request</h5>
                    <button type="button" className="btn-close" onClick={() => setEditRequest(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">User</label>
                      <input type="text" className="form-control" value={editRequest.user} onChange={(e) => setEditRequest({ ...editRequest, user: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Provider</label>
                      <input type="text" className="form-control" value={editRequest.provider} onChange={(e) => setEditRequest({ ...editRequest, provider: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Amount (₹)</label>
                      <input type="number" className="form-control" value={editRequest.amount} onChange={(e) => setEditRequest({ ...editRequest, amount: parseInt(e.target.value) })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editRequest.status} onChange={(e) => setEditRequest({ ...editRequest, status: e.target.value })}>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Failed</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={editRequest.date} onChange={(e) => setEditRequest({ ...editRequest, date: e.target.value })} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditRequest(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Request Modal */}
        {viewRequest && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Recharge Request Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewRequest(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewRequest.id}</p>
                  <p><strong>User:</strong> {viewRequest.user}</p>
                  <p><strong>Provider:</strong> {viewRequest.provider}</p>
                  <p><strong>Amount:</strong> ₹{viewRequest.amount}</p>
                  <p><strong>Status:</strong> {viewRequest.status}</p>
                  <p><strong>Date:</strong> {viewRequest.date}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewRequest(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Request Modal */}
        {deleteRequest && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Recharge Request</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteRequest(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete request <strong>{deleteRequest.id}</strong> by <strong>{deleteRequest.user}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteRequest(null)}>Cancel</button>
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

export default RechargeRequests;
