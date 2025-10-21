import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Sample initial partners
const initialPartners = [
  { id: "#P1001", name: "ABC Tech", email: "abc@tech.com", phone: "9876543210", status: "Active", createdAt: "2025-10-20" },
  { id: "#P1002", name: "XYZ Solutions", email: "xyz@solutions.com", phone: "9123456780", status: "Inactive", createdAt: "2025-10-19" },
];

const PartnerManagement = () => {
  const [partners, setPartners] = useState(initialPartners);
  const [newPartner, setNewPartner] = useState({ name: "", email: "", phone: "", status: "Active", createdAt: "" });
  const [editPartner, setEditPartner] = useState(null);
  const [deletePartner, setDeletePartner] = useState(null);
  const [viewPartner, setViewPartner] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Partner
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#P${1000 + partners.length + 1}`;
    setPartners([...partners, { ...newPartner, id: newId }]);
    setNewPartner({ name: "", email: "", phone: "", status: "Active", createdAt: "" });
    setShowAddModal(false);
  };

  // Edit Partner
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPartners(partners.map((p) => (p.id === editPartner.id ? editPartner : p)));
    setEditPartner(null);
  };

  // Delete Partner
  const handleDelete = () => {
    setPartners(partners.filter((p) => p.id !== deletePartner.id));
    setDeletePartner(null);
  };

  // Change Status
  const toggleStatus = (partner) => {
    setPartners(
      partners.map((p) =>
        p.id === partner.id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p
      )
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />
      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Partner Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Partner
          </button>
        </div>

        {/* Partner Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="align-middle hover-shadow">
                    <td>{partner.id}</td>
                    <td>{partner.name}</td>
                    <td>{partner.email}</td>
                    <td>{partner.phone}</td>
                    <td>
                      <span
                        className={`badge ${partner.status === "Active" ? "bg-success" : "bg-danger"} cursor-pointer`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleStatus(partner)}
                        title="Click to toggle status"
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td>{partner.createdAt}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewPartner(partner)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditPartner(partner)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeletePartner(partner)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Partner Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Partner</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={newPartner.email} onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input type="text" className="form-control" value={newPartner.phone} onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newPartner.status} onChange={(e) => setNewPartner({ ...newPartner, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Created At</label>
                      <input type="date" className="form-control" value={newPartner.createdAt} onChange={(e) => setNewPartner({ ...newPartner, createdAt: e.target.value })} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Partner</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Partner Modal */}
        {editPartner && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Partner</h5>
                    <button type="button" className="btn-close" onClick={() => setEditPartner(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={editPartner.name} onChange={(e) => setEditPartner({ ...editPartner, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={editPartner.email} onChange={(e) => setEditPartner({ ...editPartner, email: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input type="text" className="form-control" value={editPartner.phone} onChange={(e) => setEditPartner({ ...editPartner, phone: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editPartner.status} onChange={(e) => setEditPartner({ ...editPartner, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Created At</label>
                      <input type="date" className="form-control" value={editPartner.createdAt} onChange={(e) => setEditPartner({ ...editPartner, createdAt: e.target.value })} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditPartner(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Partner Modal */}
        {viewPartner && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Partner Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewPartner(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewPartner.id}</p>
                  <p><strong>Name:</strong> {viewPartner.name}</p>
                  <p><strong>Email:</strong> {viewPartner.email}</p>
                  <p><strong>Phone:</strong> {viewPartner.phone}</p>
                  <p><strong>Status:</strong> {viewPartner.status}</p>
                  <p><strong>Created At:</strong> {viewPartner.createdAt}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewPartner(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Partner Modal */}
        {deletePartner && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Partner</h5>
                  <button type="button" className="btn-close" onClick={() => setDeletePartner(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete partner <strong>{deletePartner.name}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeletePartner(null)}>Cancel</button>
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

export default PartnerManagement;
