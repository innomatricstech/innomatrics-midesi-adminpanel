import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
<<<<<<< HEAD
import "../styles/fixedHeader.css";
=======
import "../styles/fixedheader.css";
>>>>>>> b8e4a49e780a85a513983a7f2d338e0398374cac
import { db, collection, getDocs } from "../firebase";

const FixedHeader = ({ onSearchChange }) => {
  const [adminData, setAdminData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "admins"));
        const admins = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("✅ Admins fetched:", admins);

        if (admins.length > 0) {
          setAdminData(admins[0]); // pick first admin for now
        } else {
          console.warn("⚠️ No admin documents found!");
        }
      } catch (error) {
        console.error("❌ Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const handleSearchInput = (event) => {
    if (onSearchChange) onSearchChange(event.target.value.toLowerCase());
  };

  const toggleDetails = () => setShowDetails((prev) => !prev);

  // 🧩 Use correct fallbacks
  const displayName = adminData?.name || "No Name";
  const displayEmail = adminData?.email || "No Email";
  const displayUid = adminData?.uid || adminData?.id || "No UID";
  const userPhoto =
    adminData?.photoURL && adminData.photoURL !== "null"
      ? adminData.photoURL
      : "https://static.vecteezy.com/system/resources/previews/024/183/502/non_2x/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg";

  return (
    <header className="fixed-header shadow-sm bg-white">
      <div className="container-fluid d-flex justify-content-between align-items-center py-2 px-3">
        {/* 🔍 Search Bar */}
        <div
          className="header-search position-relative flex-grow-1 mx-3"
          style={{ maxWidth: "600px" }}
        >
          <span
            className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted fs-5"
            style={{ pointerEvents: "none" }}
          >
            🔍
          </span>
          <input
            type="search"
            className="form-control ps-5 py-2 rounded-pill header-search-input"
            placeholder="Search anything..."
            onChange={handleSearchInput}
          />
        </div>

        {/* 👤 Profile Section */}
        <div className="position-relative">
          <img
            src={userPhoto}
            alt={displayName}
            className="rounded-circle border border-2 border-primary shadow-sm"
            width="42"
            height="42"
            style={{ objectFit: "cover", cursor: "pointer" }}
            onClick={toggleDetails}
          />

          {/* Dropdown Card */}
          {showDetails && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded-4 shadow-lg p-3"
              style={{
                width: "260px",
                zIndex: 1050,
                animation: "fadeIn 0.2s ease-in-out",
              }}
            >
              <div className="d-flex flex-column text-start">
                <p className="fw-semibold mb-1 text-capitalize">{displayName}</p>
                <p className="text-muted small mb-1">{displayEmail}</p>
                <p className="text-muted small mb-0 text-break" style={{ fontSize: "0.8rem" }}>
                  <strong>User ID:</strong> {displayUid}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default FixedHeader;
