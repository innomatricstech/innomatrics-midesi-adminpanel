import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

const initialBrands = [
  { id: "#B1001", name: "Pedigree", country: "USA", established: 1957, productsCount: 25, active: true },
  { id: "#B1002", name: "Royal Canin", country: "France", established: 1968, productsCount: 40, active: true },
  { id: "#B1003", name: "Whiskas", country: "UK", established: 1930, productsCount: 30, active: false },
];

const BrandList = () => {
  const [brands, setBrands] = useState(initialBrands);
  const [editBrand, setEditBrand] = useState(null);
  const [deleteBrand, setDeleteBrand] = useState(null);
  const [viewBrand, setViewBrand] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBrand, setNewBrand] = useState({
    name: "",
    country: "",
    established: "",
    productsCount: 0,
    active: true,
  });

  // Add Brand
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#B${1000 + brands.length + 1}`;
    setBrands([...brands, { ...newBrand, id: newId }]);
    setNewBrand({ name: "", country: "", established: "", productsCount: 0, active: true });
    setShowAddModal(false);
  };

  // Edit Brand
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setBrands(brands.map((b) => (b.id === editBrand.id ? editBrand : b)));
    setEditBrand(null);
  };

  // Delete Brand
  const handleDelete = () => {
    setBrands(brands.filter((b) => b.id !== deleteBrand.id));
    setDeleteBrand(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Brand Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Brand
          </button>
        </div>

        {/* Brand Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Brand Name</th>
                  <th>ID</th>
                  <th>Country</th>
                  <th>Established</th>
                  <th>Products Count</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="align-middle hover-shadow">
                    <td>{brand.name}</td>
                    <td>{brand.id}</td>
                    <td>{brand.country}</td>
                    <td>{brand.established}</td>
                    <td>{brand.productsCount}</td>
                    <td>
                      <span className={`badge ${brand.active ? "bg-success" : "bg-danger"}`}>{brand.active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewBrand(brand)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditBrand(brand)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteBrand(brand)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Brand Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Brand</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Brand Name</label>
                      <input type="text" className="form-control" value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" value={newBrand.country} onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Established</label>
                      <input type="number" className="form-control" value={newBrand.established} onChange={(e) => setNewBrand({ ...newBrand, established: parseInt(e.target.value) })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Products Count</label>
                      <input type="number" className="form-control" value={newBrand.productsCount} onChange={(e) => setNewBrand({ ...newBrand, productsCount: parseInt(e.target.value) })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newBrand.active} onChange={(e) => setNewBrand({ ...newBrand, active: e.target.value === "true" })}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Brand</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Brand Modal */}
        {editBrand && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Brand</h5>
                    <button type="button" className="btn-close" onClick={() => setEditBrand(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Brand Name</label>
                      <input type="text" className="form-control" value={editBrand.name} onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" value={editBrand.country} onChange={(e) => setEditBrand({ ...editBrand, country: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Established</label>
                      <input type="number" className="form-control" value={editBrand.established} onChange={(e) => setEditBrand({ ...editBrand, established: parseInt(e.target.value) })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Products Count</label>
                      <input type="number" className="form-control" value={editBrand.productsCount} onChange={(e) => setEditBrand({ ...editBrand, productsCount: parseInt(e.target.value) })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editBrand.active} onChange={(e) => setEditBrand({ ...editBrand, active: e.target.value === "true" })}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditBrand(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Brand Modal */}
        {viewBrand && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Brand Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewBrand(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewBrand.id}</p>
                  <p><strong>Name:</strong> {viewBrand.name}</p>
                  <p><strong>Country:</strong> {viewBrand.country}</p>
                  <p><strong>Established:</strong> {viewBrand.established}</p>
                  <p><strong>Products Count:</strong> {viewBrand.productsCount}</p>
                  <p><strong>Status:</strong> {viewBrand.active ? "Active" : "Inactive"}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewBrand(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Brand Modal */}
        {deleteBrand && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Brand</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteBrand(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteBrand.name}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteBrand(null)}>Cancel</button>
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

export default BrandList;
