import React, { useState } from "react";
import { db, doc, updateDoc } from "../../firebase";

const EditBannerModal = ({ editBanner, setEditBanner }) => {
  const [productId, setProductId] = useState(editBanner.productId || "");

  const handleUpdate = async () => {
    if (!productId) return alert("Product ID is required!");
    try {
      await updateDoc(doc(db, "banners", editBanner.id), { productId });
      setEditBanner(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update banner.");
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ background: "#00000080" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header">
            <h5 className="modal-title">Edit Banner</h5>
            <button type="button" className="btn-close" onClick={() => setEditBanner(null)}></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              className="form-control"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setEditBanner(null)}>
              Cancel
            </button>
            <button className="btn btn-info" onClick={handleUpdate}>
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBannerModal;
