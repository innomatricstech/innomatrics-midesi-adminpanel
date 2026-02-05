import React, { useEffect, useState, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { db } from "../../firebase";
import FixedHeader from "../FixedHeader";
import { useAuth } from "../Auth/authContext";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const EmployeeRechargeRequestList = () => {
  const { user } = useAuth();
  const partnerId = user?.uid;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= FETCH REQUESTS ================= */
  const fetchRechargeRequests = useCallback(async () => {
    if (!partnerId) return;

    setLoading(true);
    try {
      const customersSnap = await getDocs(collection(db, "customers"));

      const customerLookup = {};
      customersSnap.docs.forEach((d) => {
        customerLookup[d.id] = d.data().name || "Unnamed";
      });

      const allReqPromises = customersSnap.docs.map(async (customerDoc) => {
        const userId = customerDoc.id;
        const reqSnap = await getDocs(
          collection(db, `customers/${userId}/rechargeRequest`)
        );

        return reqSnap.docs.map((reqDoc) => {
          const data = reqDoc.data();
          return {
            id: reqDoc.id,
            userId,
            userName: customerLookup[userId],
            partnerId: data.partnerId || "",
            partnerName: data.partnerName || "",
            displayUtr: data.transactionId || data.utrId || "N/A",
            requestedDate: data.requestedDate,
            ...data,
          };
        });
      });

      const nested = await Promise.all(allReqPromises);
      setRequests(nested.flat());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchRechargeRequests();
  }, [fetchRechargeRequests]);

  /* ================= FILTERING ================= */
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const searchMatch =
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.displayUtr?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      if (!r.requestedDate?.toDate) return true;
      const date = r.requestedDate.toDate();

      if (fromDate && date < new Date(fromDate)) return false;
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }

      return true;
    });
  }, [requests, searchTerm, fromDate, toDate]);

  /* ================= STATUS UPDATE ================= */
  const handleStatusChange = async (userId, requestId, status) => {
    try {
      setUpdatingId(requestId);

      // ✅ FETCH REAL PARTNER NAME FROM partners COLLECTION
      const partnerSnap = await getDoc(doc(db, "partners", partnerId));
      const partnerName = partnerSnap.exists()
        ? partnerSnap.data().name
        : "Partner";

      await updateDoc(
        doc(db, `customers/${userId}/rechargeRequest`, requestId),
        {
          rechargeStatus: status,
          partnerId: partnerId,
          partnerName: partnerName,
        }
      );

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                rechargeStatus: status,
                partnerId: partnerId,
                partnerName: partnerName,
              }
            : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= EXCEL EXPORT ================= */
  const handleExportExcel = () => {
    const excelData = filteredRequests.map((r) => ({
      "Customer Name": r.userName,
      UTR: r.displayUtr,
      Mobile: r.number || "N/A",
      Amount: r.plan?.price || "N/A",
      Status: r.rechargeStatus || "Processing",
      Date: r.requestedDate?.toDate
        ? r.requestedDate.toDate().toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Recharges");
    XLSX.writeFile(workbook, "Employee_Recharge_Report.xlsx");
  };

  /* ================= UI ================= */
  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh" }}>
      <FixedHeader onSearchChange={setSearchTerm} />

      <div className="container mt-4">
        <div className="card shadow-sm rounded-4 p-3 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <h4 className="fw-bold text-primary mb-0">
                My Recharge Requests
              </h4>
            </div>

            <div className="col-md-4">
              <label className="small text-muted">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="small text-muted">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="col-md-12 text-end">
              <button
                className="btn btn-success rounded-pill px-4"
                onClick={handleExportExcel}
              >
                📥 Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow-sm rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr className="text-muted small">
                  <th>Customer</th>
                  <th>UTR</th>
                  <th>Mobile</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.userName}</td>
                      <td>{r.displayUtr}</td>
                      <td>{r.number || "N/A"}</td>
                      <td className="fw-bold text-success">
                        ₹{r.plan?.price}
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-semibold ${
                            r.rechargeStatus === "Success"
                              ? "text-success"
                              : "text-warning"
                          }`}
                          value={r.rechargeStatus || "Processing"}
                          onChange={(e) =>
                            handleStatusChange(
                              r.userId,
                              r.id,
                              e.target.value
                            )
                          }
                          disabled={updatingId === r.id}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Success">Success</option>
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

export default EmployeeRechargeRequestList;
