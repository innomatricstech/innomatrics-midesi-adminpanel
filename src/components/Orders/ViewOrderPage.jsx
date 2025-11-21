// ViewOrderPage with working PDF download (html2canvas + jsPDF)
import React, { useEffect, useState } from "react";
import {jsPDF}  from "jspdf";
import html2canvas from "html2canvas";
import { db, doc, getDoc } from "../../firebase";

const ViewOrderPage = ({ order, onClose }) => {
  const [fullOrder, setFullOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!order) return;
    fetchOrder();
  }, [order]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const ref = doc(db, "customers", order.customerId, "orders", order.docId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFullOrder(snap.data());
      } else {
        alert("Order not found.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const input = document.getElementById("print-area");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Order-${order?.docId}.pdf`);
  };

  const renderObject = (obj, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());

      if (Array.isArray(value)) {
        return (
          <div key={key} className={`mb-4 ${depth > 0 ? "ms-3" : ""}`}>
            <h6 className="fw-bold text-primary mb-2 d-flex align-items-center">
              <span className="me-2">📋</span> {formattedKey}
            </h6>
            <div className="border rounded-3 overflow-hidden">
              {value.map((item, index) => (
                <div key={index} className="p-3 border-bottom bg-white">
                  {typeof item === "object" && item !== null
                    ? renderObject(item, depth + 1)
                    : <span className="text-muted">{String(item)}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (typeof value === "object" && value !== null) {
        return (
          <div key={key} className={`mb-4 ${depth > 0 ? "ms-3" : ""}`}>
            <h6 className="fw-bold text-secondary mb-2 d-flex align-items-center">
              <span className="me-2">🗂️</span> {formattedKey}
            </h6>
            <div className="bg-light p-3 rounded-3 border">
              {renderObject(value, depth + 1)}
            </div>
          </div>
        );
      }

      return (
        <div key={key} className="row mb-3 align-items-center">
          <div className="col-md-4">
            <strong className="text-dark">{formattedKey}:</strong>
          </div>
          <div className="col-md-8">
            <span
              className={`badge rounded-pill w-100 p-2 fs-6 ${
                typeof value === "boolean"
                  ? value ? "bg-success" : "bg-danger"
                  : "bg-light text-dark border"
              }`}
            >
              {typeof value === "boolean"
                ? value ? "✅ Yes" : "❌ No"
                : String(value)}
            </span>
          </div>
        </div>
      );
    });
  };

  const renderStructuredData = () => {
    if (!fullOrder) return null;

    const importantFields = ["orderId", "status", "total", "createdAt", "customer", "items"];

    return (
      <div className="row g-4">
        {importantFields.map(field => {
          if (!fullOrder[field]) return null;

          let displayValue = fullOrder[field];
          let icon = "📄";

          if (field === "status") {
            icon = "🟡";
            const colors = { pending: "warning", completed: "success", shipped: "info", cancelled: "danger" };
            displayValue = (
              <span className={`badge bg-${colors[displayValue] || "secondary"} fs-6`}>{displayValue}</span>
            );
          }

          if (field === "total") {
            icon = "💰";
            displayValue = `$${parseFloat(displayValue).toFixed(2)}`;
          }

          if (field === "createdAt") {
            icon = "📅";
            let ts = fullOrder[field];
            let dateObj = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
            displayValue = dateObj.toLocaleString("en-US", {
              year: "numeric", month: "long", day: "numeric",
              hour: "numeric", minute: "numeric", second: "numeric",
              hour12: true, timeZoneName: "short"
            });
          }

          return (
            <div key={field} className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 hover-card h-100">
                <div className="card-body d-flex align-items-center">
                  <span className="me-3 fs-3 opacity-75">{icon}</span>
                  <div>
                    <h6 className="text-muted text-uppercase small mb-1 fw-bold">
                      {field.replace(/([A-Z])/g, " $1")}
                    </h6>
                    <p className="fw-bold fs-5 mb-0">{displayValue}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!order) return null;

  return (
    <div className="modal show d-block fade-in" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-xxl">
        <div className="modal-content rounded-4 border-0 shadow-lg">

          <div className="modal-header bg-gradient-primary text-white rounded-top-4 py-3">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-10 rounded-circle p-2 me-3 shadow-sm">
                <span className="fs-3">📦</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0 fs-4">Order Details</h5>
                <small className="opacity-75">Order ID: {order.docId}</small>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body bg-light p-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <div id="print-area">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted fs-5">Loading order...</p>
                </div>
              ) : fullOrder ? (
                <>
                  <h4 className="fw-bold text-primary mb-4 d-flex align-items-center">
                    <span className="me-2">📊</span> Order Summary
                  </h4>
                  {renderStructuredData()}

                  <hr className="my-5" />

                  <h4 className="fw-bold text-secondary mb-4 d-flex align-items-center">
                    <span className="me-2">🔍</span> Full Details
                  </h4>
                  <div className="bg-white p-4 rounded-4 shadow-sm border">
                    {renderObject(fullOrder)}
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <span className="fs-1">😕</span>
                  <p className="mt-3 text-muted fs-5">No order data found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer bg-white rounded-bottom-4">
            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              ← Close
            </button>
            {fullOrder && (
              <button className="btn btn-primary rounded-pill px-4" onClick={handleDownload}>
                ⬇️ Download
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fade-in { animation: fadeIn 0.25s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-xxl { max-width: 1250px; }
        .bg-gradient-primary {
          background: linear-gradient(145deg, #6a72e4 0%, #7f49ad 100%);
        }
        .hover-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default ViewOrderPage;
