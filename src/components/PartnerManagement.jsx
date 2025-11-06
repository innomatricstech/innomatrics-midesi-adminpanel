import React, { useState, useEffect, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import FixedHeader from "./FixedHeader";
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

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "joinedAtTimestamp",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const partnersPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [deletePartner, setDeletePartner] = useState(null);
  const [viewPartner, setViewPartner] = useState(null);

  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    status: "Active",
    fcmToken: "",
  });

  // 🔹 Search handler
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value.toLowerCase());
  }, []);

  // 🔹 Real-time Firestore fetch
  useEffect(() => {
    setLoading(true);
    const partnersCollection = collection(db, "partners");

    const unsubscribe = onSnapshot(
      partnersCollection,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          joinedAtTimestamp: doc.data().joinedAt || null,
          joinedAt: doc.data().joinedAt?.toDate
            ? doc.data().joinedAt.toDate().toLocaleDateString()
            : "N/A",
        }));
        setPartners(data);
        setLoading(false);
        setCurrentPage(1);
      },
      (error) => {
        console.error("Error fetching partners:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 🔹 Add Partner (existing code...)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "partners"), {
        name: newPartner.name,
        email: newPartner.email,
        mobileNumber: newPartner.mobileNumber,
        status: newPartner.status,
        fcmToken: newPartner.fcmToken || "", // ✅ don’t auto-generate
        joinedAt: serverTimestamp(),
      });
      setNewPartner({
        name: "",
        email: "",
        mobileNumber: "",
        status: "Active",
        fcmToken: "",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding partner:", err);
      alert("Failed to add partner.");
    }
  };

  // 🔹 Edit Partner (existing code...)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editPartner) return;
    try {
      const ref = doc(db, "partners", editPartner.id);
      const { id, joinedAt, joinedAtTimestamp, ...dataToUpdate } = editPartner;
      await updateDoc(ref, dataToUpdate);
      setEditPartner(null);
    } catch (err) {
      console.error("Error updating partner:", err);
      alert("Failed to update partner.");
    }
  };

  // 🔹 Delete Partner (existing code...)
  const handleDelete = async () => {
    if (!deletePartner) return;
    try {
      const ref = doc(db, "partners", deletePartner.id);
      await deleteDoc(ref);
      setDeletePartner(null);
    } catch (err) {
      console.error("Error deleting partner:", err);
      alert("Failed to delete partner.");
    }
  };

  // 🔹 Toggle status (existing code...)
  const toggleStatus = async (partner) => {
    try {
      const newStatus = partner.status === "Active" ? "Inactive" : "Active";
      const ref = doc(db, "partners", partner.id);
      await updateDoc(ref, { status: newStatus });
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  // 🔹 Sorting / Filtering / Pagination (existing code...)
  const sortedPartners = useMemo(() => {
    let sortable = [...partners];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null) return sortConfig.direction === "ascending" ? 1 : -1;
        if (bVal == null) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [partners, sortConfig]);

  const filteredPartners = useMemo(() => {
    if (!searchTerm) return sortedPartners;
    return sortedPartners.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const email = String(p.email || "").toLowerCase();
      const mobile = String(p.mobileNumber || "");
      const status = String(p.status || "").toLowerCase();
      return (
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        mobile.includes(searchTerm) ||
        status.includes(searchTerm)
      );
    });
  }, [sortedPartners, searchTerm]);

  const totalPages = Math.ceil(filteredPartners.length / partnersPerPage);
  const currentPartners = filteredPartners.slice(
    (currentPage - 1) * partnersPerPage,
    currentPage * partnersPerPage
  );

  const paginate = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const getSortIndicator = (key) => {
    const actualKey = key === "joinedAt" ? "joinedAtTimestamp" : key;
    if (sortConfig.key !== actualKey) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    const sortKey = key === "joinedAt" ? "joinedAtTimestamp" : key;
    setSortConfig({ key: sortKey, direction });
  };

  // 🆕 🔹 Excel Download Function
  const handleDownloadExcel = () => {
    // 1. Define the headers and keys for the CSV
    const headers = [
      "ID",
      "Name",
      "Email",
      "Mobile Number",
      "Status",
      "Joined Date",
      "FCM Token",
    ];
    const keys = [
      "id",
      "name",
      "email",
      "mobileNumber",
      "status",
      "joinedAt",
      "fcmToken",
    ];

    // 2. Map data to rows (CSV format)
    const csvRows = [];
    csvRows.push(headers.join(",")); // Add header row

    filteredPartners.forEach((partner) => {
      const row = keys.map((key) => {
        const value = partner[key] || "";
        // Simple escape for potential commas/quotes in data fields
        // Wrap value in double quotes if it contains a comma or quote
        const escapedValue =
          typeof value === "string" && (value.includes(",") || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        return escapedValue;
      });
      csvRows.push(row.join(","));
    });

    // 3. Create the final CSV string
    const csvString = csvRows.join("\n");

    // 4. Trigger the download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "partners_data.csv"); // File name
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 🔹 UI
  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader onSearchChange={handleSearchChange} />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Partner Management</h2>

        <div className="d-flex justify-content-end mb-3">
          {/* 🆕 Download Button */}
          <button
            className="btn btn-outline-success shadow-sm rounded-pill px-4 me-2"
            onClick={handleDownloadExcel}
            disabled={loading || filteredPartners.length === 0}
          >
            ⬇️ Download Excel
          </button>
          <button
            className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
          >
            + Add Partner
          </button>
        </div>

        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th onClick={() => requestSort("name")} style={{ cursor: "pointer" }}>
                    Name {getSortIndicator("name")}
                  </th>
                  <th>Email</th>
                  <th onClick={() => requestSort("status")} style={{ cursor: "pointer" }}>
                    Status {getSortIndicator("status")}
                  </th>
                  <th>Phone</th>
                  <th onClick={() => requestSort("joinedAt")} style={{ cursor: "pointer" }}>
                    Joined {getSortIndicator("joinedAt")}
                  </th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : currentPartners.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  currentPartners.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === "Active" || p.status === "Approved" ? "bg-success" : "bg-danger"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleStatus(p)}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{p.mobileNumber}</td>
                      <td>{p.joinedAt}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setViewPartner(p)}
                        >
                          👁️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => setEditPartner(p)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeletePartner(p)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (existing code...) */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => paginate(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Modals (existing code...) */}
      {/* View Partner Modal, Add Partner Modal, Edit Partner Modal, Delete Partner Modal... */}
      {/* ... (Your existing modal JSX here) ... */}
      
      {/* View Partner Modal */}
      {viewPartner && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">View Partner</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewPartner(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {viewPartner.id}</p>
                <p><strong>Name:</strong> {viewPartner.name}</p>
                <p><strong>Email:</strong> {viewPartner.email}</p>
                <p><strong>Mobile:</strong> {viewPartner.mobileNumber}</p>
                <p><strong>Status:</strong> {viewPartner.status}</p>
                <div className="mb-3">
                  <strong>FCM Token:</strong>
                  {viewPartner.fcmToken ? (
                    <div
                      className="position-relative"
                      style={{
                        maxHeight: "100px",
                        overflowY: "auto",
                        wordBreak: "break-all",
                        background: "#f8f9fa",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        marginTop: "5px",
                        fontSize: "0.9rem",
                        border: "1px solid #ddd",
                      }}
                    >
                      <span>{viewPartner.fcmToken}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(viewPartner.fcmToken);
                          alert("FCM Token copied to clipboard!");
                        }}
                        className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-1"
                        title="Copy token"
                      >
                        📋
                      </button>
                    </div>
                  ) : (
                    <span className="ms-2 text-muted">N/A</span>
                  )}
                </div>
                <p><strong>Joined:</strong> {viewPartner.joinedAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content rounded-4 shadow-lg">
              <form onSubmit={handleAddSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Add Partner</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Name"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Mobile Number"
                    value={newPartner.mobileNumber}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, mobileNumber: e.target.value })
                    }
                    required
                  />
                  <select
                    className="form-select mb-3"
                    value={newPartner.status}
                    onChange={(e) => setNewPartner({ ...newPartner, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                  </select>

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
                    Save Partner
                  </button>
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
            <div className="modal-content rounded-4 shadow-lg">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Partner</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditPartner(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editPartner.name}
                      onChange={(e) =>
                        setEditPartner({ ...editPartner, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editPartner.email}
                      onChange={(e) =>
                        setEditPartner({ ...editPartner, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editPartner.mobileNumber}
                      onChange={(e) =>
                        setEditPartner({
                          ...editPartner,
                          mobileNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editPartner.status}
                      onChange={(e) =>
                        setEditPartner({ ...editPartner, status: e.target.value })
                      }
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Pending</option>
                    </select>
                  </div>

                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditPartner(null)}
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

      {/* Delete Partner Modal */}
      {deletePartner && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setDeletePartner(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <b>{deletePartner.name}</b>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeletePartner(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-gradient-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
      `}</style>
    </div>
  );
};

export default PartnerManagement;