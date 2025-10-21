import React from "react";

const FixedHeader = () => {
  return (
    <header className="bg-white border-bottom shadow-sm sticky-top">
      <div className="d-flex justify-content-between align-items-center p-3">
        {/* Search Bar */}
        <div className="position-relative me-auto" style={{ maxWidth: "600px", width: "100%" }}>
          <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted">🔍</span>
          <input
            type="search"
            className="form-control ps-5 border rounded-3"
            placeholder="Search here..."
          />
        </div>

        {/* Right Icons and User Profile */}
        <div className="d-flex align-items-center">
          <div className="vr me-3"></div>
          <div className="d-flex align-items-center">
            <div className="text-end me-2">
              <p className="mb-0 fw-semibold small">Mi Desi</p>
              <p className="mb-0 text-muted small">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;
