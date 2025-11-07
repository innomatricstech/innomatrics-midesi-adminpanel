import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewProductModal = ({ product, onClose }) => {
  // ---------- Helpers ----------
  const formatAdditionalInfo = (infoText) => {
    if (!infoText || !infoText.trim())
      return [{ type: "text", content: "No additional information." }];
    const lines = infoText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const out = [];
    let q = 0;
    for (const line of lines) {
      const up = line.substring(0, 2).toUpperCase();
      if (up === "Q:" || up === "Q.") {
        q++;
        out.push({ type: "q", content: line.substring(2).trim(), index: q });
      } else if (up === "A:" || up === "A.") {
        out.push({ type: "a", content: line.substring(2).trim() });
      } else {
        out.push({ type: "text", content: line });
      }
    }
    return out;
  };

  const toINR = (val) => {
    if (val === null || val === undefined || val === "" || isNaN(val)) return "₹0.00";
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(Number(val));
    } catch {
      return `₹${Number(val).toFixed(2)}`;
    }
  };

  // Coerce price values (price might be string like "₹499")
  const parsePrice = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const s = String(v).replace(/[₹,\s]/g, "");
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const mrp = parsePrice(product.price); // original price (MRP)
  const offer = product.offerPriceRaw != null ? Number(product.offerPriceRaw) : null;

  // Prefer explicit offerPriceRaw; otherwise try sale% or fall back to mrp
  let offerPrice = offer;
  if (offerPrice == null) {
    if (product.sale != null && !isNaN(product.sale)) {
      offerPrice = mrp * (1 - Number(product.sale) / 100);
    } else {
      offerPrice = mrp;
    }
  }

  const savings = Math.max(0, mrp - offerPrice);
  const discountPct =
    mrp > 0 ? Math.round((savings / mrp) * 100) : (product.sale ? Number(product.sale) : 0);

  const codYes = String(product.cashOnDelivery).toLowerCase() === "yes";

  const images = Array.isArray(product.imageUrl)
    ? product.imageUrl
    : product.image
    ? [product.image]
    : [];
  const videos = Array.isArray(product.videoUrl) ? product.videoUrl : [];

  const primaryImage = (images[0] && images[0].startsWith("http") && images[0]) || null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 rounded-4 glass-card">
          {/* Header */}
          <div className="modal-header border-0 glass-header">
            <h5 className="modal-title fw-bold text-white">
              Product Details: <span className="text-gradient">{product.name}</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body pt-0">
            {/* Hero strip */}
            <div className="hero-strip d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="me-3 p-1 bg-white rounded-circle shadow-sm"
                    style={{ width: 80, height: 80, objectFit: "cover", border: "2px solid #cbd5e1" }}
                  />
                ) : (
                  <span
                    className="me-3 p-3 bg-white rounded-circle shadow-sm text-center fs-3"
                    style={{ width: 80, height: 80, lineHeight: "50px" }}
                  >
                    📦
                  </span>
                )}
                <div>
                  <p className="mb-0 text-muted small">Product ID: {product.id}</p>
                  <h4 className="fw-bolder mb-0 d-flex align-items-center text-drak">
                    {product.name}
                    {product.isBestSelling && (
                      <span className="badge best-chip ms-3 d-flex align-items-center">
                        ❤️ Best Seller
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              {/* Glass Price Card */}
              <div className="price-card text-end">
                <div className="offer fw-bold">{toINR(offerPrice)}</div>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <div className="original text-decoration-line-through">{toINR(mrp)}</div>
                  <span className="save-pill">
                    Save {toINR(savings)} ({discountPct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Spec & logistics */}
            <h6 className="fw-bold text-secondary mt-4 mb-3">Product Specifications & Logistics</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="card h-100 p-0 shadow-sm border-0">
                  <div className="card-header glass-subheader text-white">Pricing & Logistics</div>
                  <ul className="list-group list-group-flush small">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Original Price <span className="fw-bold text-muted text-decoration-line-through">{toINR(mrp)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Offer Price <span className="fw-bold text-dark">{toINR(offerPrice)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      You Save <span className="fw-bold text-success">{toINR(savings)} ({discountPct}%)</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Tax Amount <span className="fw-bold text-dark">{product.taxAmount || 0}%</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      COD Available{" "}
                      <span className={`fw-bold badge ${codYes ? "bg-success" : "bg-secondary"} text-white`}>
                        {codYes ? "Yes" : "No"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100 p-0 shadow-sm border-0">
                  <div className="card-header glass-subheader text-white">Inventory & Details</div>
                  <ul className="list-group list-group-flush small">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Category{" "}
                      <span className="fw-bold text-dark" title={`ID: ${product.categoryId}`}>
                        {product.categoryName || "N/A"}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Brand{" "}
                      <span className="fw-bold text-dark" title={`ID: ${product.brandId}`}>
                        {product.brandName || "N/A"}
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Net Volume/Quantity <span className="fw-bold text-dark">{product.quantity || "N/A"}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Stock{" "}
                      <span className="fw-bold text-dark">
                        {product.stock} (Count: {product.stockCount || 0})
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Seller ID <span className="fw-bold text-dark">{product.sellerId || "N/A"}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Storage Conditions <span className="fw-bold text-dark">{product.storage || "N/A"}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Dosage/How To Use <span className="fw-bold text-dark">{product.dosage || "N/A"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Images */}
            <h6 className="fw-bold text-secondary mb-2">Images</h6>
            {images.length === 0 ? (
              <div className="text-muted mb-3">No images provided.</div>
            ) : (
              <div className="d-flex flex-wrap gap-3 mb-4">
                {images.map((src, i) => (
                  <div key={i} className="img-card">
                    <img src={src} alt="" />
                  </div>
                ))}
              </div>
            )}

            {/* Videos */}
            <h6 className="fw-bold text-secondary mb-2">Videos</h6>
            {videos.length === 0 ? (
              <div className="text-muted">No videos provided.</div>
            ) : (
              <>
                {videos[0] && (
                  <div className="mb-3 video-wrap">
                    <video controls style={{ width: "100%", maxHeight: 360 }}>
                      <source src={videos[0]} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                <ul className="list-group">
                  {videos.map((v, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-truncate" style={{ maxWidth: 600 }}>
                        {v}
                      </span>
                      <a className="btn btn-sm btn-outline-primary" href={v} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Manufacturing / Marketing / Description / Composition / Additional */}
            <div className="row g-4 mt-4">
              <div className="col-md-12">
                <h6 className="fw-bold text-secondary mb-2">Manufacturing & Marketing</h6>
                <div className="p-3 rounded-3 border bg-white">
                  <p className="mb-2">
                    <strong>Manufactured By:</strong> {product.manufacturedBy || "N/A"}
                  </p>
                  <p className="mb-0">
                    <strong>Marketed By:</strong> {product.marketedBy || "N/A"}
                  </p>
                </div>
              </div>

              <div className="col-md-12">
                <h6 className="fw-bold text-secondary mt-4 mb-2">Description</h6>
                <p className="text-dark bg-white p-4 rounded-3 border">
                  {product.description || "No description provided."}
                </p>

                <h6 className="fw-bold text-secondary mt-4 mb-2">Composition</h6>
                <p className="text-dark bg-white p-3 rounded-3 border">
                  {product.composition || "No composition information."}
                </p>
              </div>

              <div className="col-md-12">
                <h6 className="fw-bold text-secondary mt-4 mb-2">Additional Information (Q&A / Details)</h6>
                <div className="text-dark bg-white p-3 rounded-3 border">
                  {formatAdditionalInfo(product.additionalInformation).map((item, index) => {
                    if (item.type === "q") {
                      return (
                        <p key={index} className="mb-1 fw-bold text-primary">
                          {item.index}. {item.content}
                        </p>
                      );
                    }
                    if (item.type === "a") {
                      return (
                        <p key={index} className="ms-4 mb-2 text-dark small">
                          <span className="me-2 text-success">→</span>
                          {item.content}
                        </p>
                      );
                    }
                    return (
                      <p key={index} className="mb-0 text-muted">
                        {item.content}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
  :root{
    --g1: #7C3AED; /* purple */
    --g2: #06B6D4; /* cyan */
  }

  /* Modal card - clean white */
  .glass-card{
    background: #ffffff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 35px rgba(0,0,0,0.08);
    color: #0f172a;
  }

  /* Header - soft gradient but light */
  .glass-header{
    background: linear-gradient(90deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15));
    border-bottom: 1px solid #e5e7eb !important;
    color: #0f172a !important;
  }

  .text-gradient{
    background: linear-gradient(90deg, var(--g1), var(--g2));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  /* Hero section */
  .hero-strip{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 16px 18px;
    border-radius: 16px;
    color: #0f172a;
  }

  .best-chip{
    background: linear-gradient(135deg, #ef4444, #f97316);
    color: white;
  }

  /* Price Card - CLEAN WHITE + Premium border */
  .price-card{
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 12px 18px;
    min-width: 260px;
    box-shadow: 0px 4px 14px rgba(0,0,0,0.06);
  }

  .price-card .offer{
    font-size: 1.7rem;
    font-weight: 800;
    color: #0f172a;
  }

  .price-card .original{
    color: #64748b;
    font-weight: 600;
    text-decoration: line-through;
  }

  .save-pill{
    background: #22c55e;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 4px 10px;
    border-radius: 999px;
  }

  /* Subsection header */
  .glass-subheader{
    background: #f1f5f9;
    color: #334155 !important;
    border-bottom: 1px solid #e5e7eb !important;
  }

  /* Image card */
  .img-card{
    width: 120px;
    height: 120px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .img-card:hover{
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.09);
  }
  .img-card img{
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Video block */
  .video-wrap{
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: #000;
  }
`}</style>

    </div>
  );
};

export default ViewProductModal;
