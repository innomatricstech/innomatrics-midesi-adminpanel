import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const RechargeRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRechargeRequests = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all customers first
      const customersSnap = await getDocs(collection(db, "customers"));
      
      // 2. Map customer IDs to their names/referrer IDs for quick lookup
      const customerLookup = {};
      customersSnap.docs.forEach(d => {
        const data = d.data();
        customerLookup[d.id] = {
          name: data.name || data.fullName || "Unnamed",
          referredBy: data.referredBy || "Direct"
        };
      });

      // 3. Fetch recharge requests using parallel promises
      const allReqPromises = customersSnap.docs.map(async (customerDoc) => {
        const userId = customerDoc.id;
        const reqSnap = await getDocs(
          collection(db, `customers/${userId}/rechargeRequest`)
        );
        
        return reqSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId,
            userName: customerLookup[userId].name, // Get name from lookup
            referredBy: customerLookup[userId].referredBy, // Get referrer from lookup
            ...data,
            displayUtr: data.transactionId || data.utrId || "N/A", 
          };
        });
      });

      const nestedResults = await Promise.all(allReqPromises);
      const allRequests = nestedResults.flat();

      // Sort by Date
      const sorted = allRequests.sort((a, b) => {
        const dateA = a.requestedDate?.toDate?.() || 0;
        const dateB = b.requestedDate?.toDate?.() || 0;
        return dateB - dateA;
      });

      setRequests(sorted);
    } catch (error) {
      console.error("🔥 Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRechargeRequests();
  }, [fetchRechargeRequests]);

  // Excel Export with Referred By
  const handleDownloadExcel = () => {
    const excelData = requests.map((r) => ({
      "User Name": r.userName,
      "User ID": r.userId,
      "Referred By": r.referredBy,
      "UTR ID": r.displayUtr,
      "Mobile": r.number || "N/A",
      "Status": r.rechargeStatus || "Pending",
      "Date": r.requestedDate?.toDate ? r.requestedDate.toDate().toLocaleString() : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recharge Report");
    XLSX.writeFile(workbook, "Recharge_Requests.xlsx");
  };

  return (
    <div style={{ backgroundColor: "#f4f7f6", minHeight: "100vh", paddingTop: "80px" }}>
      <div className="container-fluid px-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center py-3 px-4 rounded-3 shadow-sm bg-white border mb-4">
          <h4 className="fw-bold m-0 text-primary">Recharge Management</h4>
          <button onClick={handleDownloadExcel} className="btn btn-success rounded-pill px-4">
             📥 Export Excel
          </button>
        </div>

        {/* Table Section */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr className="small text-uppercase text-muted">
                  <th className="ps-4">User & Referrer</th>
                  <th>UTR / Transaction ID</th>
                  <th>Mobile</th>
                  <th>Plan</th>
                  <th>Status Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5">Loading...</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{r.userName}</div>
                        <div className="text-muted small" style={{ fontSize: '11px' }}>
                          ID: {r.userId} | <span className="text-primary">Ref: {r.referredBy}</span>
                        </div>
                      </td>
                      <td><code className="small bg-light px-2 py-1">{r.displayUtr}</code></td>
                      <td className="fw-bold text-secondary">{r.number}</td>
                      <td>₹{r.plan?.price}</td>
                      <td>
                        <select
                          className="form-select form-select-sm fw-bold"
                          value={r.rechargeStatus}
                          onChange={(e) => handleStatusChange(r.userId, r.id, e.target.value)}
                          style={{ borderLeft: r.rechargeStatus === "Success" ? "4px solid green" : "4px solid orange" }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Success">Success</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeRequestList;