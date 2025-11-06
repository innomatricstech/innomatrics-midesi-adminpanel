import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

const ViewProductModal = ({ product, onClose }) => {

    // Helper function to parse the text and format Q/A pairs (Case-Insensitive for Q/A and accepts : or .)
    const formatAdditionalInfo = (infoText) => {
        if (!infoText || !infoText.trim()) {
            return [{ type: 'text', content: 'No additional information.' }];
        }

        const lines = infoText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let output = [];
        let qCount = 0;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            // Get the first two characters (e.g., "Q:", "A.", "q:", "a.") and convert to uppercase
            const upperCasePrefix = trimmedLine.substring(0, 2).toUpperCase(); 
            
            // Check for Q: or Q. (case-insensitive)
            if (upperCasePrefix === 'Q:' || upperCasePrefix === 'Q.') {
                qCount++;
                // Extract content after the two-character prefix (e.g., skip "Q:")
                output.push({ 
                    type: 'q', 
                    content: trimmedLine.substring(2).trim(),
                    index: qCount 
                });
            
            // Check for A: or A. (case-insensitive)
            } else if (upperCasePrefix === 'A:' || upperCasePrefix === 'A.') {
                // Extract content after the two-character prefix (e.g., skip "A:")
                output.push({ 
                    type: 'a', 
                    content: trimmedLine.substring(2).trim()
                });
            } else {
                // Treat any other line as generic text
                output.push({ type: 'text', content: line });
            }
        });
        return output;
    };

    // Determine the COD status display
    const isCODEnabled = String(product.cashOnDelivery).toLowerCase() === 'yes';

    // Determine the image to display (using a default placeholder if image is missing)
    const productImage = product.image && typeof product.image === 'string' && product.image.startsWith('http') 
        ? product.image 
        : null;

    return (
        <div className="modal show d-block" tabIndex="-1  " style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content shadow-lg rounded-4 border-0">
                    <div className="modal-header bg-light border-0">
                        <h5 className="modal-title fw-bold text-primary">Product Details: {product.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body pt-0">
                        {/* --- Key Product Summary --- */}
                        <div className="p-4 mb-4 bg-light rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="d-flex align-items-center">
                                {/* 🎯 MODIFIED: Display Image or Placeholder */}
                                {productImage ? (
                                    <img 
                                        src={productImage} 
                                        alt={product.name} 
                                        className="me-3 p-1 bg-white rounded-circle shadow-sm"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #ccc' }}
                                    />
                                ) : (
                                    <span className="me-3 p-3 bg-white rounded-circle shadow-sm text-center fs-3"
                                          style={{ width: '80px', height: '80px', lineHeight: '50px' }}>
                                        📦
                                    </span>
                                )}
                                {/* 🎯 END MODIFIED */}
                                <div>
                                    <p className="mb-0 text-muted small">Product ID: {product.id}</p>
                                    <h4 className="fw-bolder mb-0 d-flex align-items-center">
                                        {product.name}
                                        {product.isBestSelling && (
                                            <span className="badge bg-danger ms-3 d-flex align-items-center" style={{ fontSize: '0.9em' }}>
                                                ❤️ Best Seller
                                            </span>
                                        )}
                                    </h4>
                                </div>
                            </div>
                            <div className="text-end">
                                <h3 className="fw-bold mb-1 text-success">{product.price}</h3>
                            </div>
                        </div>

                        {/* --- Product Specifications --- */}
                        <h6 className="fw-bold text-secondary mb-3">Product Specifications & Logistics</h6>
                        <div className="row g-3 mb-4">
                            
                            {/* Financial/Shipping Data */}
                            <div className="col-md-6">
                                <div className="card h-100 p-0 shadow-sm border-0">
                                    <div className="card-header bg-primary text-white fw-bold">Pricing & Logistics</div>
                                    <ul className="list-group list-group-flush small">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Original Price
                                            <span className="fw-bold text-dark">{product.price}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Offer Price
                                            <span className="fw-bold text-dark">₹{product.offerPriceRaw ? product.offerPriceRaw.toFixed(2) : '0.00'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Sale Discount
                                            <span className="fw-bold text-success fs-5">{product.sale || 0}%</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Tax Amount
                                            <span className="fw-bold text-dark">{product.taxAmount || 0}%</span>
                                        </li>
                                        {/* 🎯 MODIFIED: COD Badge Logic */}
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            COD Available
                                            <span className={`fw-bold badge ${isCODEnabled ? 'bg-success' : 'bg-secondary'} text-white`}>
                                                {product.cashOnDelivery || 'No'}
                                            </span>
                                        </li>
                                        {/* 🎯 END MODIFIED */}
                                    </ul>
                                </div>
                            </div>

                            {/* Quantity & Storage */}
                            <div className="col-md-6">
                                <div className="card h-100 p-0 shadow-sm border-0">
                                    <div className="card-header bg-info text-white fw-bold">Inventory & Details</div>
                                    <ul className="list-group list-group-flush small">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Category
                                            <span className="fw-bold text-dark" title={`ID: ${product.categoryId}`}>{product.categoryName || 'N/A'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Brand
                                            <span className="fw-bold text-dark" title={`ID: ${product.brandId}`}>{product.brandName || 'N/A'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Net Volume/Quantity
                                            <span className="fw-bold text-dark">{product.quantity || 'N/A'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Stock
                                            <span className="fw-bold text-dark">{product.stock} (Count: {product.stockCount || 0})</span> 
                                        </li>
                                        {/* ✅ KEPT: Seller ID Display */}
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Seller ID
                                            <span className="fw-bold text-dark">{product.sellerId || 'N/A'}</span>
                                        </li>
                                        {/* END KEPT */}
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Storage Conditions
                                            <span className="fw-bold text-dark">{product.storage || 'N/A'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Dosage/How To Use
                                            <span className="fw-bold text-dark">{product.dosage || 'N/A'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* --- Description & Composition --- */}
                        <div className="row g-4">
                            <div className="col-md-12">
                                <h6 className="fw-bold text-secondary mb-2">Manufacturing & Marketing</h6>
                                <div className="p-3 bg-white rounded-3 border">
                                    <p className="mb-2"><strong>Manufactured By:</strong> {product.manufacturedBy || 'N/A'}</p>
                                    <p className="mb-0"><strong>Marketed By:</strong> {product.marketedBy || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <h6 className="fw-bold text-secondary mt-4 mb-2">Description</h6>
                                <p className="text-dark bg-white p-4 rounded-3 border">{product.description || 'No description provided.'}</p>
                                
                                <h6 className="fw-bold text-secondary mt-4 mb-2">Composition Snippet</h6>
                                <p className="text-dark bg-white p-3 rounded-3 border">{product.composition || 'No composition information.'}</p>
                            </div>
                            <div className="col-md-12">
                                <h6 className="fw-bold text-secondary mt-4 mb-2">Additional Information (Q&A / Details)</h6>
                                {/* RENDERED WITH CUSTOM Q&A LOGIC */}
                                <div className="text-dark bg-white p-3 rounded-3 border">
                                    {formatAdditionalInfo(product.additionalInformation).map((item, index) => {
                                        if (item.type === 'q') {
                                            // Renders the Question with numbering (1., 2., 3., etc.)
                                            return (
                                                <p key={index} className="mb-1 fw-bold text-primary">
                                                    {item.index}. {item.content}
                                                </p>
                                            );
                                        }
                                        if (item.type === 'a') {
                                            // Renders the Answer, indented using ms-4 (margin-start: 4)
                                            return (
                                                <p key={index} className="ms-4 mb-2 text-dark small">
                                                    <span className="me-2 text-success">→</span>
                                                    {item.content}
                                                </p>
                                            );
                                        }
                                        // Renders fallback text for empty or non-Q/A content
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
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProductModal;