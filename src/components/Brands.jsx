import React, { useState, useEffect } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";
import imageCompression from "browser-image-compression";
import {
  db,
  storage,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  // 🔹 NEW: State for search term
  const [searchTerm, setSearchTerm] = useState("");
  // 🔹 NEW: State for filtered list
  const [filteredBrands, setFilteredBrands] = useState([]);
  
  const [editBrand, setEditBrand] = useState(null);
  const [deleteBrand, setDeleteBrand] = useState(null);
  const [viewBrand, setViewBrand] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [newBrand, setNewBrand] = useState({
    brandName: "",
    brandImage: "",
    backGroundImage: "",
    brandImageFile: null,
    backGroundImageFile: null,
  });

  const brandCollectionRef = collection(db, "brands");

  // ✅ Fetch all brands
  const fetchBrands = async () => {
    try {
      const snapshot = await getDocs(brandCollectionRef);
      const brandList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      }));
      setBrands(brandList);
      setFilteredBrands(brandList); // Initialize filtered list with all brands
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // 🔹 NEW: Search filter effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = brands.filter(
        (brand) =>
          (brand.brandName && brand.brandName.toLowerCase().includes(lowercasedTerm)) ||
          (brand.docId && brand.docId.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredBrands(filtered);
    }
  }, [searchTerm, brands]);


  // ✅ Optimized Image Upload (with compression + progress)
  const uploadImage = async (file, onProgress) => {
    if (!file) return null;
    setUploading(true);

    try {
      // Compress before uploading
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const fileRef = ref(storage, `brands/${Date.now()}_${compressedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progressPercent));
          },
          reject,
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
            setUploading(false);
            setProgress(0);
          }
        );
      });
    } catch (error) {
      console.error("❌ Upload failed:", error);
      setUploading(false);
      return null;
    }
  };

  // ✅ Add Brand
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newBrand.brandName.trim()) return alert("Brand name required");

    try {
      setUploading(true);
      let brandImageURL = newBrand.brandImage;
      let bgImageURL = newBrand.backGroundImage;

      if (newBrand.brandImageFile)
        brandImageURL = await uploadImage(newBrand.brandImageFile, setProgress);
      if (newBrand.backGroundImageFile)
        bgImageURL = await uploadImage(newBrand.backGroundImageFile, setProgress);

      const docRef = await addDoc(brandCollectionRef, {
        brandName: newBrand.brandName,
        brandImage: brandImageURL,
        backGroundImage: bgImageURL,
        createdAt: serverTimestamp(),
      });

      await updateDoc(docRef, { brandId: docRef.id });

      // After adding, re-fetch to update all lists correctly or manually update state
      // We'll rely on fetchBrands which updates 'brands' state, which in turn triggers the useEffect for 'filteredBrands'
      fetchBrands(); 

      setShowAddModal(false);
      setNewBrand({
        brandName: "",
        brandImage: "",
        backGroundImage: "",
        brandImageFile: null,
        backGroundImageFile: null,
      });
    } catch (error) {
      console.error("❌ Error adding brand:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ✅ Edit Brand
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editBrand) return;

    try {
      setUploading(true);
      const docRef = doc(db, "brands", editBrand.docId);
      let brandImageURL = editBrand.brandImage;
      let bgImageURL = editBrand.backGroundImage;

      if (editBrand.newBrandImageFile)
        brandImageURL = await uploadImage(editBrand.newBrandImageFile, setProgress);
      if (editBrand.newBackgroundFile)
        bgImageURL = await uploadImage(editBrand.newBackgroundFile, setProgress);

      const updatedData = {
        brandName: editBrand.brandName,
        brandImage: brandImageURL,
        backGroundImage: bgImageURL,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, updatedData);

      // Manually update the brands array for immediate feedback
      setBrands((prev) =>
        prev.map((b) =>
          b.docId === editBrand.docId
            ? { ...b, ...updatedData, docId: editBrand.docId } // Preserve docId and use updatedData
            : b
        )
      );
      setEditBrand(null);
    } catch (error) {
      console.error("❌ Error updating brand:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ✅ Delete Brand
  const handleDelete = async () => {
    try {
      const docRef = doc(db, "brands", deleteBrand.docId);
      await deleteDoc(docRef);
      setBrands((prev) => prev.filter((b) => b.docId !== deleteBrand.docId));
      setDeleteBrand(null);
    } catch (error) {
      console.error("❌ Error deleting brand:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* 🔹 UPDATED: Pass setSearchTerm to FixedHeader */}
      <FixedHeader onSearchChange={setSearchTerm} /> 
      
      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">Brand Management</h2>
          <button
            className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add Brand
          </button>
        </div>

        <div className="card border-0 shadow-lg rounded-4 mt-4">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Brand ID</th>
                  <th>Brand Name</th>
                  <th>Image</th>
                  <th>Background</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredBrands.length > 0 ? ( 
                  // 🔹 UPDATED: Use filteredBrands for rendering
                  filteredBrands.map((brand) => ( 
                    <tr key={brand.docId}>
                      <td className="text-muted small">{brand.docId.substring(0, 8)}...</td>
                      <td className="fw-bold">{brand.brandName}</td>
                      <td>
                        {brand.brandImage && (
                          <img
                            src={brand.brandImage}
                            alt="Brand"
                            className="rounded shadow-sm"
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                          />
                        )}
                      </td>
                      <td>
                        {brand.backGroundImage && (
                          <img
                            src={brand.backGroundImage}
                            alt="BG"
                            className="rounded shadow-sm"
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                          />
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setViewBrand(brand)}
                        >
                          👁️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => setEditBrand(brand)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteBrand(brand)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-muted">
                      No brands found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Progress Bar */}
      {uploading && progress > 0 && progress < 100 && (
        <div className="fixed-bottom mb-3 w-50 mx-auto bg-light p-2 rounded shadow text-center">
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-success"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <small>{progress}% Uploading...</small>
        </div>
      )}

      {/* ✅ Modals */}
      {showAddModal && (
        <ModalWrapper title="Add New Brand" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit}>
            <BrandForm brand={newBrand} setBrand={setNewBrand} uploading={uploading} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Add Brand"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {editBrand && (
        <ModalWrapper title="Edit Brand" onClose={() => setEditBrand(null)}>
          <form onSubmit={handleEditSubmit}>
            <BrandForm brand={editBrand} setBrand={setEditBrand} uploading={uploading} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setEditBrand(null)}>
                Cancel
              </button>
              <button className="btn btn-success" type="submit" disabled={uploading}>
                {uploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {viewBrand && (
        <ModalWrapper title="Brand Details" onClose={() => setViewBrand(null)}>
          <div className="text-center">
            <div className="p-3 border rounded-3 bg-light mb-3">
              <small className="text-muted">Brand ID:</small>
              <div className="fw-semibold text-primary">{viewBrand.docId}</div>
            </div>
            <h4 className="fw-bold mb-3 text-primary">{viewBrand.brandName}</h4>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {viewBrand.brandImage && (
                <img
                  src={viewBrand.brandImage}
                  alt="Brand"
                  className="rounded shadow-sm"
                  style={{ maxHeight: "150px", cursor: "pointer" }}
                  onClick={() => window.open(viewBrand.brandImage, "_blank")}
                />
              )}
              {viewBrand.backGroundImage && (
                <img
                  src={viewBrand.backGroundImage}
                  alt="Background"
                  className="rounded shadow-sm"
                  style={{ maxHeight: "150px", cursor: "pointer" }}
                  onClick={() => window.open(viewBrand.backGroundImage, "_blank")}
                />
              )}
            </div>
            {/* Display Timestamps if available */}
            {(viewBrand.createdAt?.toDate || viewBrand.updatedAt?.toDate) && (
                <div className="mt-4 small text-muted">
                    {viewBrand.createdAt?.toDate && <p className="mb-0">Created: {viewBrand.createdAt.toDate().toLocaleString()}</p>}
                    {viewBrand.updatedAt?.toDate && <p className="mb-0">Updated: {viewBrand.updatedAt.toDate().toLocaleString()}</p>}
                </div>
            )}
          </div>
        </ModalWrapper>
      )}

      {deleteBrand && (
        <ModalWrapper title="Confirm Delete" onClose={() => setDeleteBrand(null)}>
          <div className="text-center">
            Are you sure you want to delete <strong>{deleteBrand.brandName}</strong>?
          </div>
          <div className="text-center mt-3">
            <button className="btn btn-secondary me-2" onClick={() => setDeleteBrand(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </ModalWrapper>
      )}

      <style>{`
        .btn-gradient-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
      `}</style>
    </div>
  );
};

// ✅ Modal Wrapper (Unchanged)
const ModalWrapper = ({ title, onClose, children }) => (
  <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content rounded-4 shadow-lg">
        <div className="modal-header">
          <h5 className="modal-title fw-bold">{title}</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  </div>
);

// ✅ Brand Form (Unchanged)
const BrandForm = ({ brand, setBrand, uploading }) => (
  <>
    <div className="mb-3">
      <label className="form-label">Brand Name</label>
      <input
        type="text"
        className="form-control"
        value={brand.brandName}
        onChange={(e) => setBrand({ ...brand, brandName: e.target.value })}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Brand Image</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={(e) => setBrand({ ...brand, brandImageFile: e.target.files[0], newBrandImageFile: e.target.files[0] })}
      />
      <input
        type="url"
        placeholder="Or enter image URL"
        className="form-control"
        value={brand.brandImage || ""}
        onChange={(e) => setBrand({ ...brand, brandImage: e.target.value })}
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Background Image</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={(e) => setBrand({ ...brand, backGroundImageFile: e.target.files[0], newBackgroundFile: e.target.files[0] })}
      />
      <input
        type="url"
        placeholder="Or enter background image URL"
        className="form-control"
        value={brand.backGroundImage || ""}
        onChange={(e) => setBrand({ ...brand, backGroundImage: e.target.value })}
      />
    </div>
    {uploading && <div className="text-info small">Uploading...</div>}
  </>
);

export default BrandList;