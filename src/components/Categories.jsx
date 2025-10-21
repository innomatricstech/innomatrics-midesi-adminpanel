import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

const initialCategories = [
  { id: "#1001", name: "Dog Food", description: "All types of dog food", status: "Active" },
  { id: "#1002", name: "Cat Food", description: "All types of cat food", status: "Active" },
  { id: "#1003", name: "Accessories", description: "Pet accessories and toys", status: "Inactive" },
];

const CategoryList = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [viewCategory, setViewCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  // Add Category
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#${1000 + categories.length + 1}`;
    setCategories([...categories, { ...newCategory, id: newId }]);
    setNewCategory({ name: "", description: "", status: "Active" });
    setShowAddModal(false);
  };

  // Edit Category
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setCategories(categories.map((c) => (c.id === editCategory.id ? editCategory : c)));
    setEditCategory(null);
  };

  // Delete Category
  const handleDelete = () => {
    setCategories(categories.filter((c) => c.id !== deleteCategory.id));
    setDeleteCategory(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Category Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Category
          </button>
        </div>

        {/* Category Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="align-middle hover-shadow">
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <span className={`badge ${category.status === "Active" ? "bg-success" : "bg-danger"} fw-semibold`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewCategory(category)} title="View Category">👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditCategory(category)} title="Edit Category">✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteCategory(category)} title="Delete Category">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Category</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <input type="text" className="form-control" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} required></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newCategory.status} onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Category</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editCategory && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Category</h5>
                    <button type="button" className="btn-close" onClick={() => setEditCategory(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <input type="text" className="form-control" value={editCategory.name} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" value={editCategory.description} onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })} required></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editCategory.status} onChange={(e) => setEditCategory({ ...editCategory, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditCategory(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Category Modal */}
        {viewCategory && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Category Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewCategory(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewCategory.id}</p>
                  <p><strong>Name:</strong> {viewCategory.name}</p>
                  <p><strong>Description:</strong> {viewCategory.description}</p>
                  <p><strong>Status:</strong> {viewCategory.status}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewCategory(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Category Modal */}
        {deleteCategory && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Category</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteCategory(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteCategory.name}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteCategory(null)}>Cancel</button>
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

export default CategoryList;
