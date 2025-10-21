import React, { useState, useEffect } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Example initial wallet data
const initialWallets = [
  { id: "#WAL1001", user: "Vishnu Prasath", email: "vishnu@example.com", balance: 1200 },
  { id: "#WAL1002", user: "Amit Kumar", email: "amit@example.com", balance: 500 },
  { id: "#WAL1003", user: "Sneha Reddy", email: "sneha@example.com", balance: 3000 },
];

const WalletList = () => {
  const [wallets, setWallets] = useState(initialWallets);
  const [editWallet, setEditWallet] = useState(null);
  const [viewWallet, setViewWallet] = useState(null);

  // Fetch wallets (simulate with useEffect)
  useEffect(() => {
    // Example: fetch from API
    // fetch("/api/wallets").then(res => res.json()).then(data => setWallets(data));
    console.log("Wallets loaded:", wallets);
  }, []);

  // Handle balance update
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setWallets(wallets.map((w) => (w.id === editWallet.id ? editWallet : w)));
    setEditWallet(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Wallet Management</h2>

        {/* Wallets Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Balance (₹)</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id} className="align-middle hover-shadow">
                    <td>{wallet.user}</td>
                    <td>{wallet.id}</td>
                    <td>{wallet.email}</td>
                    <td className="fw-bold">{wallet.balance}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewWallet(wallet)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info shadow-sm" onClick={() => setEditWallet(wallet)}>✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Wallet Modal */}
        {editWallet && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Update Balance</h5>
                    <button type="button" className="btn-close" onClick={() => setEditWallet(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">User</label>
                      <input type="text" className="form-control" value={editWallet.user} disabled />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="text" className="form-control" value={editWallet.email} disabled />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Balance (₹)</label>
                      <input type="number" className="form-control" value={editWallet.balance} onChange={(e) => setEditWallet({ ...editWallet, balance: parseFloat(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditWallet(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Balance</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Wallet Modal */}
        {viewWallet && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Wallet Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewWallet(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewWallet.id}</p>
                  <p><strong>User:</strong> {viewWallet.user}</p>
                  <p><strong>Email:</strong> {viewWallet.email}</p>
                  <p><strong>Balance:</strong> ₹{viewWallet.balance}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewWallet(null)}>Close</button>
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

export default WalletList;
