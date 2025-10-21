import React, { useState, useEffect } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

// Example referral data
const initialReferrals = [
  { id: "#REF1001", user: "Vishnu Prasath", referredUser: "Amit Kumar", bonus: 100, date: "2025-10-20" },
  { id: "#REF1002", user: "Sneha Reddy", referredUser: "Rahul Sharma", bonus: 150, date: "2025-10-18" },
  { id: "#REF1003", user: "Amit Kumar", referredUser: "Priya Singh", bonus: 200, date: "2025-10-15" },
];

const ReferralList = () => {
  const [referrals, setReferrals] = useState([]);

  // Fetch referral data (simulate API fetch)
  useEffect(() => {
    // In real app: fetch("/api/referrals").then(res => res.json()).then(data => setReferrals(data));
    setReferrals(initialReferrals);
  }, []);

  const [viewReferral, setViewReferral] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Referral Management</h2>

        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Referred User</th>
                  <th>Bonus (₹)</th>
                  <th>Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="align-middle hover-shadow">
                    <td>{ref.id}</td>
                    <td>{ref.user}</td>
                    <td>{ref.referredUser}</td>
                    <td className="fw-bold">{ref.bonus}</td>
                    <td>{ref.date}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewReferral(ref)}>👁️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Referral Modal */}
        {viewReferral && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Referral Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewReferral(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewReferral.id}</p>
                  <p><strong>User:</strong> {viewReferral.user}</p>
                  <p><strong>Referred User:</strong> {viewReferral.referredUser}</p>
                  <p><strong>Bonus:</strong> ₹{viewReferral.bonus}</p>
                  <p><strong>Date:</strong> {viewReferral.date}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewReferral(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ReferralList;
