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
  // Removed serverTimestamp
} from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Fetch Brands Logic
  const fetchBrands = async () => {
    try {
      const snapshot = await getDocs(brandCollectionRef);
      const brandList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      }));
      setBrands(brandList);
      setFilteredBrands(brandList);
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Search/Filter Logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredBrands(
        brands.filter(
          (brand) =>
            brand.brandName?.toLowerCase().includes(term) ||
            brand.docId?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, brands]);

  // Image Upload Logic
  const uploadImage = async (file, onProgress) => {
    if (!file) return null;

    setUploading(true);

    try {
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
            const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(percent));
          },
          (error) => {
            console.error("❌ Upload error:", error);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      return null;
    }
  };

  // Add Brand Logic
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newBrand.brandName.trim()) return alert("Brand name required");

    try {
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
      // Removed any potential createdAt or updatedAt field here
      });

      await updateDoc(docRef, { brandId: docRef.id });

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
      alert("Failed to add brand");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Edit Brand Logic
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editBrand) return;

    try {
      let brandImageURL = editBrand.brandImage;
      let bgImageURL = editBrand.backGroundImage;

      if (editBrand.newBrandImageFile)
        brandImageURL = await uploadImage(editBrand.newBrandImageFile, setProgress);

      if (editBrand.newBackgroundFile)
        bgImageURL = await uploadImage(editBrand.newBackgroundFile, setProgress);

      const docRef = doc(db, "brands", editBrand.docId);

      const updatedData = {
        brandName: editBrand.brandName,
        brandImage: brandImageURL,
        backGroundImage: bgImageURL,
        // Removed any potential updatedAt field here
      };
      
      await updateDoc(docRef, updatedData);

      // Manual state update for immediate UI refresh
      setBrands((prev) =>
        prev.map((b) =>
          b.docId === editBrand.docId
            ? { ...b, ...updatedData, docId: editBrand.docId } 
            : b
        )
      );
      setEditBrand(null);

    } catch (error) {
      console.error("❌ Error updating brand:", error);
      alert("Failed to update brand");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Delete Brand Logic
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
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader onSearchChange={setSearchTerm} />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">Brand Management</h2>
          <button
            className="btn btn-gradient-primary shadow-lg rounded-pill px-4 py-2"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add New Brand
          </button>
        </div>

        {/* --- Main Data Card (Enhanced Styling) --- */}
        <div className="card border-0 shadow-lg rounded-4 mt-4">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-primary text-white">
                <tr>
                  <th className="py-3 ps-4">ID</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Image</th>
                  <th className="py-3">Background</th>
                  <th className="text-center py-3 pe-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                      Loading brands...
                    </td>
                  </tr>
                ) : filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <tr key={brand.docId}>
                      <td className="text-muted small ps-4">
                        <span className="badge bg-light text-secondary">{brand.docId.substring(0, 8)}...</span>
                      </td>
                      <td className="fw-bold text-dark">{brand.brandName}</td>

                      <td>
                        {brand.brandImage && (
                          <img
                            src={brand.brandImage}
                            alt="Brand"
                            className="rounded shadow-sm"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </td>

                      <td>
                        {brand.backGroundImage && (
                          <img
                            src={brand.backGroundImage}
                            alt="BG"
                            className="rounded shadow-sm"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </td>

                      <td className="text-center pe-4">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setViewBrand(brand)}
                          title="View Details"
                        >
                          👁️
                        </button>

                        <button
                          className="btn btn-sm btn-outline-info me-2"
                          onClick={() =>
                            setEditBrand({
                              ...brand,
                              newBrandImageFile: null,
                              newBackgroundFile: null,
                            })
                          }
                          title="Edit Brand"
                        >
                          ✏️
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteBrand(brand)}
                          title="Delete Brand"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted">
                      No brands found for the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Progress Bar --- */}
      {uploading && progress > 0 && progress < 100 && (
        <div className="fixed-bottom mb-3 w-50 mx-auto bg-white p-3 rounded-4 shadow-lg text-center border">
          <h6 className="mb-2 text-primary">Uploading...</h6>
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-success"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <small className="text-success fw-bold mt-1 d-block">{progress}%</small>
        </div>
      )}

      {/* --- Add Brand Modal --- */}
      {showAddModal && (
        <ModalWrapper title="Add New Brand" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit}>
            <BrandForm brand={newBrand} setBrand={setNewBrand} uploading={uploading} />
            <div className="text-end mt-4 pt-2 border-top">
              <button className="btn btn-outline-secondary me-2 rounded-pill" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-gradient-primary rounded-pill" type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Add Brand"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* --- Edit Brand Modal --- */}
      {editBrand && (
        <ModalWrapper title="Edit Brand" onClose={() => setEditBrand(null)}>
          <form onSubmit={handleEditSubmit}>
            <BrandForm brand={editBrand} setBrand={setEditBrand} uploading={uploading} />
            <div className="text-end mt-4 pt-2 border-top">
              <button className="btn btn-outline-secondary me-2 rounded-pill" type="button" onClick={() => setEditBrand(null)}>
                Cancel
              </button>
              <button className="btn btn-success rounded-pill" type="submit" disabled={uploading}>
                {uploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* --- View Brand Modal (ID and Style Update Applied Here) --- */}
      {viewBrand && (
        <ModalWrapper title="Brand Details" onClose={() => setViewBrand(null)}>
          <div className="text-center p-3">
            
            {/* ✅ ADDED: Prominent Brand ID Display */}
            <div className="p-3 border rounded-3 bg-light mb-4 shadow-sm">
              <h6 className="text-secondary mb-1">Brand ID</h6>
              <span className="fw-bold text-dark text-monospace small user-select-all">{viewBrand.docId}</span>
            </div>
            
            <h4 className="fw-bold mb-4 text-primary">{viewBrand.brandName}</h4>
            
            <div className="d-flex justify-content-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="mb-2 small text-muted">Brand Logo</p>
                {viewBrand.brandImage && (
                  <img
                    src={viewBrand.brandImage}
                    alt="Brand"
                    className="rounded shadow-lg border border-2 border-primary"
                    style={{ maxHeight: "150px", maxWidth: "150px", cursor: "pointer", objectFit: "cover" }}
                    onClick={() => window.open(viewBrand.brandImage, "_blank")}
                  />
                )}
              </div>

              <div className="text-center">
                <p className="mb-2 small text-muted">Background Image</p>
                {viewBrand.backGroundImage && (
                  <img
                    src={viewBrand.backGroundImage}
                    alt="Background"
                    className="rounded shadow-lg"
                    style={{ maxHeight: "150px", maxWidth: "150px", cursor: "pointer", objectFit: "cover" }}
                    onClick={() => window.open(viewBrand.backGroundImage, "_blank")}
                  />
                )}
              </div>
            </div>
            
          </div>
        </ModalWrapper>
      )}

      {/* --- Delete Brand Modal --- */}
      {deleteBrand && (
        <ModalWrapper title="Confirm Delete" onClose={() => setDeleteBrand(null)}>
          <div className="text-center p-3">
            <p className="lead">
                Are you sure you want to delete <strong className="text-danger">{deleteBrand.brandName}</strong>?
            </p>
            <small className="text-muted">This action is permanent and cannot be undone.</small>
          </div>
          <div className="text-center mt-4 pt-2 border-top">
            <button className="btn btn-secondary me-3 rounded-pill" type="button" onClick={() => setDeleteBrand(null)}>
              Cancel
            </button>
            <button className="btn btn-danger rounded-pill" onClick={handleDelete}>
              Delete Brand
            </button>
          </div>
        </ModalWrapper>
      )}

      <style>{`
        .btn-gradient-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border: none;
        }
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
        .table-primary {
            background-color: #4f46e5 !important;
            border-color: #4f46e5 !important;
        }
        .text-monospace {
            font-family: monospace;
        }
      `}</style>
    </div>
  );
};

// -------------------------------------------------------------
// Helper Components (KEEP THESE DEFINED HERE)
// -------------------------------------------------------------

// ✅ Modal Wrapper Component
const ModalWrapper = ({ title, onClose, children }) => (
  <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
    <div className="modal-dialog modal-dialog-centered modal-md">
      <div className="modal-content rounded-4 shadow-lg border-0">
        <div className="modal-header bg-light border-0 pt-4 pb-2">
          <h5 className="modal-title fw-bold text-dark">{title}</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className="modal-body p-4">{children}</div>
      </div>
    </div>
  </div>
);

// ✅ Brand Form
const BrandForm = ({ brand, setBrand, uploading }) => (
  <>
    <div className="mb-3">
      <label className="form-label fw-medium">Brand Name</label>
      <input
        type="text"
        className="form-control"
        value={brand.brandName}
        onChange={(e) => setBrand({ ...brand, brandName: e.target.value })}
        required
      />
    </div>

    <div className="mb-3 p-3 border rounded-3 bg-white shadow-sm">
      <label className="form-label fw-medium">Brand Image (Logo)</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={(e) =>
          setBrand({
            ...brand,
            brandImageFile: e.target.files[0],
            newBrandImageFile: e.target.files[0],
          })
        }
      />
      <small className="text-muted d-block mb-2">OR provide a URL:</small>
      <input
        type="url"
        placeholder="Enter image URL"
        className="form-control"
        value={brand.brandImage || ""}
        onChange={(e) => setBrand({ ...brand, brandImage: e.target.value })}
      />
    </div>

    <div className="mb-3 p-3 border rounded-3 bg-white shadow-sm">
      <label className="form-label fw-medium">Background Image</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={(e) =>
          setBrand({
            ...brand,
            backGroundImageFile: e.target.files[0],
            newBackgroundFile: e.target.files[0],
          })
        }
      />
      <small className="text-muted d-block mb-2">OR provide a URL:</small>
      <input
        type="url"
        placeholder="Enter background image URL"
        className="form-control"
        value={brand.backGroundImage || ""}
        onChange={(e) => setBrand({ ...brand, backGroundImage: e.target.value })}
      />
    </div>

    {uploading && <div className="alert alert-info py-2 px-3 small">Uploading in progress...</div>}
  </>
);

export default BrandList;