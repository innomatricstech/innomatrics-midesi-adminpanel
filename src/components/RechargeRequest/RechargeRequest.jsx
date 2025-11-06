import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { db } from "../../firebase"; // ✅ adjust your path
import { collection, getDocs } from "firebase/firestore";

const RechargeRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------------
  // ⚡ FAST FETCHING USING PROMISE.ALL
  // -------------------------------------------------------------------
  const fetchRechargeRequests = useCallback(async () => {
    setLoading(true);
    try {
      const customersSnap = await getDocs(collection(db, "customers"));

      // Fetch recharge requests for all customers in parallel
      const allReqPromises = customersSnap.docs.map(async (customer) => {
        const userId = customer.id;
        const reqSnap = await getDocs(
          collection(db, `customers/${userId}/rechargeRequest`)
        );
        return reqSnap.docs.map((doc) => ({
          id: doc.id,
          userId,
          ...doc.data(),
        }));
      });

      // Wait for all user subcollections together
      const nestedResults = await Promise.all(allReqPromises);

      // Flatten results into one array
      const allRequests = nestedResults.flat();

      // Sort by date (latest first)
      const sorted = allRequests.sort((a, b) => {
        const dateA = a.requestedDate?.toDate?.() || 0;
        const dateB = b.requestedDate?.toDate?.() || 0;
        return dateB - dateA;
      });

      setRequests(sorted);
    } catch (error) {
      console.error("🔥 Error fetching recharge requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRechargeRequests();
  }, [fetchRechargeRequests]);

  // -------------------------------------------------------------------
  // 🧾 EXCEL EXPORT
  // -------------------------------------------------------------------
  const handleDownloadExcel = () => {
    if (!requests.length) {
      alert("No recharge requests to export!");
      return;
    }

    const data = requests.map((r) => ({
      "User ID": r.userId,
      "Recharge ID": r.id,
      "Mobile Number": r.number || "N/A",
      "Plan Provider": r.plan?.rechargeProvider || "N/A",
      "Plan Price": r.plan?.price ? `₹${r.plan.price}` : "N/A",
      Status: r.rechargeStatus || "Pending",
      "Requested Date": r.requestedDate?.toDate
        ? r.requestedDate.toDate().toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recharge Requests");
    XLSX.writeFile(workbook, "RechargeRequests.xlsx");
  };

  // -------------------------------------------------------------------
  // 🎨 UI
  // -------------------------------------------------------------------
  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        paddingTop: "80px",
      }}
    >
      <div className="container-fluid px-4">
        {/* HEADER BAR */}
        <div
          className="d-flex justify-content-between align-items-center py-3 px-3 rounded-3 shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            className="fw-bold m-0"
            style={{
              color: "#007bff",
            }}
          >
            Recharge Management
          </h3>

          <button
            onClick={handleDownloadExcel}
            className="btn d-flex align-items-center gap-2 text-white fw-semibold rounded-pill px-3 py-2"
            style={{
              backgroundColor: "#038631ff",
              border: "none",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            <i className="bi bi-file-earmark-excel"></i>
            Download Excel
          </button>
        </div>

        {/* TABLE CARD */}
        <div className="card shadow-sm mt-4 border-0 rounded-4">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="text-muted mt-3">Loading recharge requests...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User ID</th>
                      <th>Recharge ID</th>
                      <th>Number</th>
                      <th>Provider</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.userId}</td>
                          <td>{r.id}</td>
                          <td>{r.number || "N/A"}</td>
                          <td>{r.plan?.rechargeProvider || "N/A"}</td>
                          <td>₹{r.plan?.price || "N/A"}</td>
                          <td>
                            <span
                              className={`badge ${
                                r.rechargeStatus === "Success"
                                  ? "bg-success"
                                  : r.rechargeStatus === "Failed"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {r.rechargeStatus || "Pending"}
                            </span>
                          </td>
                          <td>
                            {r.requestedDate?.toDate
                              ? r.requestedDate.toDate().toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No recharge requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeRequestList;
