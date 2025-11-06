import React, { useState, useEffect } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  db,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "../firebase";

const RechargeProviders = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [newProvider, setNewProvider] = useState({
    providerName: "",
    image: "",
  });
  const [editProvider, setEditProvider] = useState(null);
  const [deleteProvider, setDeleteProvider] = useState(null);
  const [viewProvider, setViewProvider] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // 🔹 Fetch Providers (Realtime)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rechargeProvider"),
      (snapshot) => {
        const data = snapshot.docs.map((docu) => ({
          docId: docu.id,
          ...docu.data(),
        }));
        setProviders(data);
        setFilteredProviders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching providers:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProviders(providers);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = providers.filter(
      (p) =>
        p.providerName?.toLowerCase().includes(lower) ||
        p.docId?.toLowerCase().includes(lower)
    );
    setFilteredProviders(filtered);
  }, [searchTerm, providers]);

  // ➕ Add Provider
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newProvider.providerName || !newProvider.image) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const ref = await addDoc(collection(db, "rechargeProvider"), {
        providerName: newProvider.providerName,
        image: newProvider.image,
        createdAt: serverTimestamp(),
      });
      await updateDoc(ref, { id: ref.id });
      setShowAddModal(false);
      setNewProvider({ providerName: "", image: "" });
    } catch (err) {
      console.error("Error adding:", err);
      alert("Failed to add provider.");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit Provider
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProvider) return;
    try {
      setLoading(true);
      const ref = doc(db, "rechargeProvider", editProvider.docId);
      await updateDoc(ref, {
        providerName: editProvider.providerName,
        image: editProvider.image,
        updatedAt: serverTimestamp(),
      });
      setEditProvider(null);
    } catch (err) {
      console.error("Error updating:", err);
      alert("Failed to update provider.");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete Provider
  const handleDelete = async () => {
    if (!deleteProvider) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "rechargeProvider", deleteProvider.docId));
      setDeleteProvider(null);
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete provider.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader onSearchChange={setSearchTerm} />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">Recharge Providers</h2>
          <button
            className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            ➕ Add Provider
          </button>
        </div>

        {/* Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Logo</th>
                  <th>Provider Name</th>
                  <th>Doc ID</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((p) => (
                    <tr key={p.docId} className="hover-shadow">
                      <td>
                        <img
                          src={p.image}
                          alt={p.providerName}
                          style={{
                            height: "45px",
                            width: "45px",
                            objectFit: "contain",
                          }}
                          className="rounded-3 shadow-sm"
                        />
                      </td>
                      <td className="fw-semibold">{p.providerName}</td>
                      <td className="text-muted">{p.docId.substring(0, 8)}...</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setViewProvider(p)}
                        >
                          👁️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => setEditProvider(p)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteProvider(p)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      No providers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✨ Add Provider Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0 rounded-4">
                <div
                  className="modal-header text-white rounded-top-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #4f46e5, #6366f1)",
                  }}
                >
                  <h5 className="modal-title">➕ Add Provider</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Provider Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProvider.providerName}
                        onChange={(e) =>
                          setNewProvider({
                            ...newProvider,
                            providerName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={newProvider.image}
                        onChange={(e) =>
                          setNewProvider({ ...newProvider, image: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Provider
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ✏️ Edit Modal */}
        {editProvider && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0 rounded-4">
                <div
                  className="modal-header text-white rounded-top-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #4f46e5, #6366f1)",
                  }}
                >
                  <h5 className="modal-title">✏️ Edit Provider</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setEditProvider(null)}
                  ></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Document ID</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={editProvider.docId}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Provider Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editProvider.providerName}
                        onChange={(e) =>
                          setEditProvider({
                            ...editProvider,
                            providerName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editProvider.image}
                        onChange={(e) =>
                          setEditProvider({
                            ...editProvider,
                            image: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditProvider(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 👁️ View Modal */}
        {viewProvider && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg border-0 rounded-4">
                <div
                  className="modal-header text-white rounded-top-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #4f46e5, #6366f1)",
                  }}
                >
                  <h5 className="modal-title">📱 Provider Details</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setViewProvider(null)}
                  ></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <img
                    src={viewProvider.image}
                    alt={viewProvider.providerName}
                    className="rounded-3 shadow-sm mb-3"
                    style={{ height: "90px", width: "90px", objectFit: "contain" }}
                  />
                  <h5 className="fw-bold text-primary">
                    {viewProvider.providerName}
                  </h5>
                  <p className="text-muted mb-2">ID: {viewProvider.docId}</p>
                  <a
                    href={viewProvider.image}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Image
                  </a>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setViewProvider(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🗑️ Delete Modal */}
        {deleteProvider && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0 rounded-4">
                <div className="modal-header bg-danger text-white rounded-top-4">
                  <h5 className="modal-title">⚠️ Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteProvider(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete{" "}
                  <strong>{deleteProvider.providerName}</strong>?
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteProvider(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
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
