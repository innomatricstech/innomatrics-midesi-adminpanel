import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

const initialBanners = [
  { id: "#BNR1001", title: "Summer Sale", image: "🏖️", link: "https://example.com/summer", active: true },
  { id: "#BNR1002", title: "New Arrivals", image: "🆕", link: "https://example.com/new", active: true },
  { id: "#BNR1003", title: "Festive Offer", image: "🎉", link: "https://example.com/festive", active: false },
];

const BannerList = () => {
  const [banners, setBanners] = useState(initialBanners);
  const [editBanner, setEditBanner] = useState(null);
  const [deleteBanner, setDeleteBanner] = useState(null);
  const [viewBanner, setViewBanner] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBanner, setNewBanner] = useState({
    title: "",
    image: "",
    link: "",
    active: true,
  });

  // Add Banner
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#BNR${1000 + banners.length + 1}`;
    setBanners([...banners, { ...newBanner, id: newId }]);
    setNewBanner({ title: "", image: "", link: "", active: true });
    setShowAddModal(false);
  };

  // Edit Banner
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setBanners(banners.map((b) => (b.id === editBanner.id ? editBanner : b)));
    setEditBanner(null);
  };

  // Delete Banner
  const handleDelete = () => {
    setBanners(banners.filter((b) => b.id !== deleteBanner.id));
    setDeleteBanner(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Banner Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Banner
          </button>
        </div>

        {/* Banner Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Link</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="align-middle hover-shadow">
                    <td>{banner.title}</td>
                    <td>{banner.id}</td>
                    <td className="fs-4 text-center">{banner.image}</td>
                    <td><a href={banner.link} target="_blank" rel="noopener noreferrer">{banner.link}</a></td>
                    <td>
                      <span className={`badge ${banner.active ? "bg-success" : "bg-danger"}`}>{banner.active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewBanner(banner)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditBanner(banner)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteBanner(banner)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Banner Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Banner</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image (Emoji or URL)</label>
                      <input type="text" className="form-control" value={newBanner.image} onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Link</label>
                      <input type="text" className="form-control" value={newBanner.link} onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newBanner.active} onChange={(e) => setNewBanner({ ...newBanner, active: e.target.value === "true" })}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Banner</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Banner Modal */}
        {editBanner && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Banner</h5>
                    <button type="button" className="btn-close" onClick={() => setEditBanner(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" value={editBanner.title} onChange={(e) => setEditBanner({ ...editBanner, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image</label>
                      <input type="text" className="form-control" value={editBanner.image} onChange={(e) => setEditBanner({ ...editBanner, image: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Link</label>
                      <input type="text" className="form-control" value={editBanner.link} onChange={(e) => setEditBanner({ ...editBanner, link: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editBanner.active} onChange={(e) => setEditBanner({ ...editBanner, active: e.target.value === "true" })}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditBanner(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Banner Modal */}
        {viewBanner && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Banner Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewBanner(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewBanner.id}</p>
                  <p><strong>Title:</strong> {viewBanner.title}</p>
                  <p><strong>Image:</strong> {viewBanner.image}</p>
                  <p><strong>Link:</strong> <a href={viewBanner.link} target="_blank" rel="noopener noreferrer">{viewBanner.link}</a></p>
                  <p><strong>Status:</strong> {viewBanner.active ? "Active" : "Inactive"}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewBanner(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Banner Modal */}
        {deleteBanner && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Banner</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteBanner(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteBanner.title}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteBanner(null)}>Cancel</button>
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

export default BannerList;
