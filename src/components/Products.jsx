import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

const initialProducts = [
  { id: "#7712309", image: "🐕", name: "Dog Food, Chicken & Liver Recipe", price: "₹1,452.50", quantity: 1638, sale: 20, stock: "Out of stock" },
  { id: "#7712310", image: "🌾", name: "Grain Free Dry Dog Food | Rachael Ray Nutrish", price: "₹1,452.50", quantity: 1638, sale: 20, stock: "Out of stock" },
  { id: "#7712311", image: "🎃", name: "Weruva Pumpkin Patch Up! Pumpkin With Ginger", price: "₹1,452.50", quantity: 1638, sale: 20, stock: "Out of stock" },
];

const ProductList = () => {
  const [products, setProducts] = useState(initialProducts);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    image: "📦",
    name: "",
    price: "",
    quantity: 0,
    sale: 0,
    stock: "In stock",
  });

  // Add Product
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#${7712309 + products.length}`;
    setProducts([...products, { ...newProduct, id: newId }]);
    setNewProduct({ image: "📦", name: "", price: "", quantity: 0, sale: 0, stock: "In stock" });
    setShowAddModal(false);
  };

  // Edit Product
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProducts(products.map((p) => (p.id === editProduct.id ? editProduct : p)));
    setEditProduct(null);
  };

  // Delete Product
  const handleDelete = () => {
    setProducts(products.filter((p) => p.id !== deleteProduct.id));
    setDeleteProduct(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Product Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Product
          </button>
        </div>

        {/* Product Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Product ID</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Sale (%)</th>
                  <th>Stock</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="align-middle hover-shadow">
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-3 p-3 bg-light rounded-circle shadow-sm text-center fs-4">{product.image}</div>
                        <span className="fw-semibold">{product.name}</span>
                      </div>
                    </td>
                    <td>{product.id}</td>
                    <td className="fw-bold">{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <span className="badge bg-success text-white">{product.sale}%</span>
                    </td>
                    <td>
                      <span className={`badge ${product.stock === "Out of stock" ? "bg-danger" : "bg-success"} fw-semibold`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewProduct(product)} title="View Product">👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditProduct(product)} title="Edit Product">✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteProduct(product)} title="Delete Product">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Product</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Product Name</label>
                      <input type="text" className="form-control" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price (₹)</label>
                      <input type="text" className="form-control" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-control" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Sale (%)</label>
                      <input type="number" className="form-control" value={newProduct.sale} onChange={(e) => setNewProduct({ ...newProduct, sale: parseInt(e.target.value) })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Stock</label>
                      <select className="form-select" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}>
                        <option>In stock</option>
                        <option>Out of stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Product</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editProduct && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Product</h5>
                    <button type="button" className="btn-close" onClick={() => setEditProduct(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Product Name</label>
                      <input type="text" className="form-control" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price (₹)</label>
                      <input type="text" className="form-control" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-control" value={editProduct.quantity} onChange={(e) => setEditProduct({ ...editProduct, quantity: parseInt(e.target.value) })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Sale (%)</label>
                      <input type="number" className="form-control" value={editProduct.sale} onChange={(e) => setEditProduct({ ...editProduct, sale: parseInt(e.target.value) })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Stock</label>
                      <select className="form-select" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}>
                        <option>In stock</option>
                        <option>Out of stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Product Modal */}
        {viewProduct && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Product Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewProduct(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Image:</strong> {viewProduct.image}</p>
                  <p><strong>Name:</strong> {viewProduct.name}</p>
                  <p><strong>ID:</strong> {viewProduct.id}</p>
                  <p><strong>Price:</strong> {viewProduct.price}</p>
                  <p><strong>Quantity:</strong> {viewProduct.quantity}</p>
                  <p><strong>Sale:</strong> {viewProduct.sale}%</p>
                  <p><strong>Stock:</strong> {viewProduct.stock}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewProduct(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Product Modal */}
        {deleteProduct && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Product</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteProduct(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteProduct.name}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteProduct(null)}>Cancel</button>
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

export default ProductList;
