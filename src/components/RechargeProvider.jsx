import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Example initial recharge providers
const initialProviders = [
  { id: "#RP1001", name: "Airtel", type: "Mobile", status: "Active" },
  { id: "#RP1002", name: "Jio", type: "Mobile", status: "Active" },
  { id: "#RP1003", name: "BSNL", type: "Mobile", status: "Inactive" },
];

const RechargeProviders = () => {
  const [providers, setProviders] = useState(initialProviders);
  const [newProvider, setNewProvider] = useState({ name: "", type: "Mobile", status: "Active" });
  const [editProvider, setEditProvider] = useState(null);
  const [deleteProvider, setDeleteProvider] = useState(null);
  const [viewProvider, setViewProvider] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Provider
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#RP${1000 + providers.length + 1}`;
    setProviders([...providers, { ...newProvider, id: newId }]);
    setNewProvider({ name: "", type: "Mobile", status: "Active" });
    setShowAddModal(false);
  };

  // Edit Provider
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProviders(providers.map((p) => (p.id === editProvider.id ? editProvider : p)));
    setEditProvider(null);
  };

  // Delete Provider
  const handleDelete = () => {
    setProviders(providers.filter((p) => p.id !== deleteProvider.id));
    setDeleteProvider(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />
      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Recharge Provider Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Provider
          </button>
        </div>

        {/* Providers Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="align-middle hover-shadow">
                    <td>{provider.id}</td>
                    <td>{provider.name}</td>
                    <td>{provider.type}</td>
                    <td>
                      <span className={`badge ${provider.status === "Active" ? "bg-success" : "bg-danger"}`}>{provider.status}</span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewProvider(provider)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditProvider(provider)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteProvider(provider)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Provider Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Provider</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Provider Name</label>
                      <input type="text" className="form-control" value={newProvider.name} onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={newProvider.type} onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value })}>
                        <option>Mobile</option>
                        <option>DTH</option>
                        <option>Electricity</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newProvider.status} onChange={(e) => setNewProvider({ ...newProvider, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Provider</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Provider Modal */}
        {editProvider && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Provider</h5>
                    <button type="button" className="btn-close" onClick={() => setEditProvider(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Provider Name</label>
                      <input type="text" className="form-control" value={editProvider.name} onChange={(e) => setEditProvider({ ...editProvider, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={editProvider.type} onChange={(e) => setEditProvider({ ...editProvider, type: e.target.value })}>
                        <option>Mobile</option>
                        <option>DTH</option>
                        <option>Electricity</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editProvider.status} onChange={(e) => setEditProvider({ ...editProvider, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditProvider(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Provider Modal */}
        {viewProvider && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Provider Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewProvider(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewProvider.id}</p>
                  <p><strong>Name:</strong> {viewProvider.name}</p>
                  <p><strong>Type:</strong> {viewProvider.type}</p>
                  <p><strong>Status:</strong> {viewProvider.status}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewProvider(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Provider Modal */}
        {deleteProvider && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Provider</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteProvider(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteProvider.name}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteProvider(null)}>Cancel</button>
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

export default RechargeProviders;
