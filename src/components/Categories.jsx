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

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  // 🔹 NEW: State for search term
  const [searchTerm, setSearchTerm] = useState("");
  // 🔹 NEW: State for filtered list
  const [filteredCategories, setFilteredCategories] = useState([]);

  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [viewCategory, setViewCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    categoryImage: "",
    backGroundImage: "",
    categoryImageFile: null,
    backGroundImageFile: null,
  });

  const categoriesCollectionRef = collection(db, "category");

  // ✅ Fetch all categories
  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(categoriesCollectionRef);
      const categoryList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      }));
      setCategories(categoryList);
      setFilteredCategories(categoryList); // Initialize the filtered list
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  // 🔹 NEW: Search filter effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = categories.filter(
        (cat) =>
          (cat.categoryName && cat.categoryName.toLowerCase().includes(lowercasedTerm)) ||
          (cat.docId && cat.docId.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);


  // ✅ Optimized Image Upload (with compression + progress)
  const uploadImage = async (file, onProgress) => {
    if (!file) return null;
    setUploading(true);

    try {
      console.log("📤 Uploading:", file.name);
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const fileRef = ref(storage, `categories/${Date.now()}_${compressedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progress: ${progressPercent.toFixed(0)}%`);
            if (onProgress) onProgress(Math.round(progressPercent));
          },
          (error) => {
            console.error("❌ Upload error:", error);
            setUploading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ Uploaded successfully! URL:", downloadURL);
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


  // ✅ Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.categoryName.trim()) return alert("Category name required");

    try {
      setUploading(true);
      let catImageURL = newCategory.categoryImage;
      let bgImageURL = newCategory.backGroundImage;

      if (newCategory.categoryImageFile)
        catImageURL = await uploadImage(newCategory.categoryImageFile, setProgress);
      if (newCategory.backGroundImageFile)
        bgImageURL = await uploadImage(newCategory.backGroundImageFile, setProgress);

      const docRef = await addDoc(categoriesCollectionRef, {
        categoryName: newCategory.categoryName,
        categoryImage: catImageURL,
        backGroundImage: bgImageURL,
        createdAt: serverTimestamp(),
      });

      // The added category might not have 'docId' (which is the Firestore ID) 
      // immediately after the local state update. A re-fetch is safer, 
      // but a manual update works for display purposes.
      const newCat = {
        ...newCategory,
        categoryImage: catImageURL,
        backGroundImage: bgImageURL,
        docId: docRef.id,
      };

      await updateDoc(docRef, { categoryId: docRef.id });

      // Update both lists to maintain search state integrity
      setCategories((prev) => [...prev, newCat]);
      if (!searchTerm) { // Only update filtered list if no search is active
         setFilteredCategories((prev) => [...prev, newCat]);
      } else {
         // Re-run search logic by simply updating categories state, which triggers the useEffect
      }

      setShowAddModal(false);
      setNewCategory({
        categoryName: "",
        categoryImage: "",
        backGroundImage: "",
        categoryImageFile: null,
        backGroundImageFile: null,
      });
    } catch (error) {
      console.error("❌ Error adding category:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ✅ Edit Category
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCategory) return;

    try {
      setUploading(true);
      const docRef = doc(db, "category", editCategory.docId);
      let catImageURL = editCategory.categoryImage;
      let bgImageURL = editCategory.backGroundImage;

      if (editCategory.newCategoryImageFile)
        catImageURL = await uploadImage(editCategory.newCategoryImageFile, setProgress);
      if (editCategory.newBackgroundFile)
        bgImageURL = await uploadImage(editCategory.newBackgroundFile, setProgress);

      const updatedData = {
        categoryName: editCategory.categoryName,
        categoryImage: catImageURL,
        backGroundImage: bgImageURL,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updatedData);

      // Manually update the categories array for immediate feedback
      setCategories((prev) =>
        prev.map((c) =>
          c.docId === editCategory.docId
            ? { ...c, ...updatedData, docId: editCategory.docId }
            : c
        )
      );
      setEditCategory(null);
    } catch (error) {
      console.error("❌ Error updating category:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ✅ Delete Category
  const handleDelete = async () => {
    try {
      const docRef = doc(db, "category", deleteCategory.docId);
      await deleteDoc(docRef);
      // Update both lists
      setCategories((prev) => prev.filter((c) => c.docId !== deleteCategory.docId));
      setFilteredCategories((prev) => prev.filter((c) => c.docId !== deleteCategory.docId));
      setDeleteCategory(null);
    } catch (error) {
      console.error("❌ Error deleting category:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* 🔹 UPDATED: Pass setSearchTerm to FixedHeader */}
      <FixedHeader onSearchChange={setSearchTerm} /> 
      
      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">Category Management</h2>
          <button
            className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add Category
          </button>
        </div>

        <div className="card border-0 shadow-lg rounded-4 mt-4">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
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
                ) : filteredCategories.length > 0 ? (
                  // 🔹 UPDATED: Use filteredCategories for rendering
                  filteredCategories.map((cat) => (
                    <tr key={cat.docId}>
                      <td className="text-muted small">{cat.docId.substring(0, 8)}...</td>
                      <td className="fw-bold">{cat.categoryName}</td>
                      <td>
                        {cat.categoryImage && (
                          <img
                            src={cat.categoryImage}
                            alt="Category"
                            className="rounded shadow-sm"
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                          />
                        )}
                      </td>
                      <td>
                        {cat.backGroundImage && (
                          <img
                            src={cat.backGroundImage}
                            alt="Background"
                            className="rounded shadow-sm"
                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                          />
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setViewCategory(cat)}
                        >
                          👁️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => setEditCategory(cat)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteCategory(cat)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-muted">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Progress Bar (Unchanged) */}
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

      {/* ✅ Add Modal (Unchanged) */}
      {showAddModal && (
        <ModalWrapper title="Add New Category" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit}>
            <CategoryForm category={newCategory} setCategory={setNewCategory} uploading={uploading} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Add Category"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ✅ Edit Modal (Unchanged) */}
      {editCategory && (
        <ModalWrapper title="Edit Category" onClose={() => setEditCategory(null)}>
          <form onSubmit={handleEditSubmit}>
            <CategoryForm category={editCategory} setCategory={setEditCategory} uploading={uploading} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={() => setEditCategory(null)}>
                Cancel
              </button>
              <button className="btn btn-success" type="submit" disabled={uploading}>
                {uploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* ✅ View Modal (Unchanged) */}
      {viewCategory && (
        <ModalWrapper title="Category Details" onClose={() => setViewCategory(null)}>
          <div className="text-center">
            <h4 className="fw-bold mb-3 text-primary">{viewCategory.categoryName}</h4>
            <div className="p-3 border rounded-3 bg-light mb-3">
              <small className="text-muted">ID:</small>
              <div className="fw-semibold text-primary">{viewCategory.docId}</div>
            </div>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {viewCategory.categoryImage && (
                <img
                  src={viewCategory.categoryImage}
                  alt="Category"
                  className="rounded shadow-sm"
                  style={{ maxHeight: "150px", cursor: "pointer" }}
                  onClick={() => window.open(viewCategory.categoryImage, "_blank")}
                />
              )}
              {viewCategory.backGroundImage && (
                <img
                  src={viewCategory.backGroundImage}
                  alt="Background"
                  className="rounded shadow-sm"
                  style={{ maxHeight: "150px", cursor: "pointer" }}
                  onClick={() => window.open(viewCategory.backGroundImage, "_blank")}
                />
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* ✅ Delete Modal (Unchanged) */}
      {deleteCategory && (
        <ModalWrapper title="Confirm Delete" onClose={() => setDeleteCategory(null)}>
          <div className="text-center">
            Are you sure you want to delete <strong>{deleteCategory.categoryName}</strong>?
          </div>
          <div className="text-center mt-3">
            <button className="btn btn-secondary me-2" onClick={() => setDeleteCategory(null)}>
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

// ✅ Category Form (Unchanged)
const CategoryForm = ({ category, setCategory, uploading }) => (
  <>
    <div className="mb-3">
      <label className="form-label">Category Name</label>
      <input
        type="text"
        className="form-control"
        value={category.categoryName}
        onChange={(e) => setCategory({ ...category, categoryName: e.target.value })}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Category Image</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={(e) =>
          setCategory({
            ...category,
            categoryImageFile: e.target.files[0],
            newCategoryImageFile: e.target.files[0],
          })
        }
      />
      <input
        type="url"
        placeholder="Or enter image URL"
        className="form-control"
        value={category.categoryImage || ""}
        onChange={(e) => setCategory({ ...category, categoryImage: e.target.value })}
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Background Image</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={(e) =>
          setCategory({
            ...category,
            backGroundImageFile: e.target.files[0],
            newBackgroundFile: e.target.files[0],
          })
        }
      />
      <input
        type="url"
        placeholder="Or enter background image URL"
        className="form-control"
        value={category.backGroundImage || ""}
        onChange={(e) => setCategory({ ...category, backGroundImage: e.target.value })}
      />
    </div>
    {uploading && <div className="text-info small">Uploading...</div>}
  </>
);

export default CategoryList;