import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db, collection, getDocs, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ---------------------- FETCH CATEGORY -------------------------
const useCategoryFetcher = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const snap = await getDocs(collection(db, "category"));
        setCategories(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().categoryName || "Unnamed Category",
          }))
        );
      } catch (err) {
        console.error("Category fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return { categories, loading };
};

// ------------------------ FETCH BRANDS -------------------------
const useBrandFetcher = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const snap = await getDocs(collection(db, "brands"));
        setBrands(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().brandName || "Unnamed Brand",
          }))
        );
      } catch (err) {
        console.error("Brand fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return { brands, loading };
};

// ---------------------- MAIN EDIT MODAL ------------------------
const EditProductModal = ({ product, onClose, onSave }) => {
  const { categories, loading: loadingCategories } = useCategoryFetcher();
  const { brands, loading: loadingBrands } = useBrandFetcher();

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ Convert ProductList price → number
  const extractPrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return Number(price.toString().replace(/₹|,/g, "")) || 0;
  };

  // ✅ FORM INITIAL VALUES
  const [form, setForm] = useState({
    id: product.id,

    title: product.name || "",
    description: product.description || "",

    price: extractPrice(product.price),
    offerPrice: Number(product.offerPriceRaw || product.offerPrice || 0),

    // START: Added/Updated fields from AddProductModal.jsx
    netVolume: product.netVolume || product.quantity || "", // netVolume is preferred
    dosage: product.dosage || "",
    ingredients: product.ingredients || "",
    composition: product.composition || "",
    storage: product.storage || "",
    manufacturedBy: product.manufacturedBy || "",
    marketedBy: product.marketedBy || "",
    shelfLife: product.shelfLife || "",
    additionalInformation: product.additionalInformation || "",
    // END: Added/Updated fields

    stock: Number(product.stockCount ?? 0),
    taxAmount: Number(product.taxAmount || 0),
    cashOnDelivery: product.cashOnDelivery || "Yes", // Default to 'Yes'
    isBestSelling: Boolean(product.isBestSelling),
    rating: Number(product.rating || 0), // Rating field added

    categoryId: product.categoryId || "",
    brandId: product.brandId || "",
    categoryName: product.categoryName || "",
    brandName: product.brandName || "",

    sellerid: product.sellerId || "", // Storing as 'sellerid' to match firestore field
    
    imageUrl: Array.isArray(product.imageUrl) ? product.imageUrl : [],
    videoUrl: Array.isArray(product.videoUrl) ? product.videoUrl : [],
  });

  // ✅ FILE STATES
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoUrlsText, setVideoUrlsText] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      return setForm((p) => ({ ...p, [name]: checked }));
    }

    if (name === "categoryId") {
      const cat = categories.find((c) => c.id === value);
      return setForm((p) => ({
        ...p,
        categoryId: value,
        categoryName: cat ? cat.name : "",
      }));
    }

    if (name === "brandId") {
      const b = brands.find((c) => c.id === value);
      return setForm((p) => ({
        ...p,
        brandId: value,
        brandName: b ? b.name : "",
      }));
    }

    const numeric = ["price", "offerPrice", "taxAmount", "stock", "rating"]; // 'rating' added
    const newValue = numeric.includes(name)
      ? value === "" ? "" : Number(value)
      : value;

    setForm((p) => ({ ...p, [name]: newValue }));
  };

  // ✅ Split comma/newline URLs
  const splitUrls = (txt) =>
    txt.split(/\n|,/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

  // ✅ Upload files
  const uploadFiles = async (files, folder, accept = () => true) => {
    const urls = [];
    for (const file of files) {
      if (!accept(file)) continue;

      const path = `${folder}/${Date.now()}-${file.name}`;
      const r = ref(storage, path);

      await uploadBytes(r, file);
      const url = await getDownloadURL(r);

      urls.push(url);
    }
    return urls;
  };

  // ✅ Remove media
  const removeImageAt = (i) =>
    setForm((p) => ({
      ...p,
      imageUrl: p.imageUrl.filter((_, idx) => idx !== i),
    }));

  const removeVideoAt = (i) =>
    setForm((p) => ({
      ...p,
      videoUrl: p.videoUrl.filter((_, idx) => idx !== i),
    }));

  // ✅ SAVE EDIT
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.categoryId) return alert("Select category");
    if (!form.brandId) return alert("Select brand");

    setIsUploading(true);

    try {
      // ✅ New uploads
      const newImageUploads = await uploadFiles(
        imageFiles,
        "products/images",
        (f) => f.type.startsWith("image/")
      );

      const newVideoUploads = await uploadFiles(
        videoFiles,
        "products/videos",
        (f) => f.name.toLowerCase().endsWith(".mp4")
      );

      // ✅ pasted URLs
      const pastedImageUrls = splitUrls(imageUrlsText);
      const pastedVideoUrls = splitUrls(videoUrlsText);

      // ✅ final arrays
      const imageUrl = [...form.imageUrl, ...newImageUploads, ...pastedImageUrls];
      const videoUrl = [...form.videoUrl, ...newVideoUploads, ...pastedVideoUrls];

      const finalData = {
        id: form.id,
        title: form.title,
        description: form.description,

        price: Number(form.price),
        offerPrice: Number(form.offerPrice),

        // START: All fields included in finalData
        netVolume: form.netVolume,
        dosage: form.dosage,
        ingredients: form.ingredients,
        composition: form.composition,
        storage: form.storage,
        manufacturedBy: form.manufacturedBy,
        marketedBy: form.marketedBy,
        shelfLife: form.shelfLife,
        additionalInformation: form.additionalInformation,

        stock: Number(form.stock),
        taxAmount: Number(form.taxAmount),
        cashOnDelivery: form.cashOnDelivery,
        rating: Number(form.rating),
        isBestSelling: form.isBestSelling,
        // END: All fields included in finalData

        categoryId: form.categoryId,
        brandId: form.brandId,
        categoryName: form.categoryName,
        brandName: form.brandName,

        sellerid: form.sellerid, // Ensure this key is correct

        imageUrl,
        videoUrl,
      };

      await onSave(finalData);

      if (isMounted.current) onClose();
    } catch (err) {
      console.error("Edit save error:", err);
      alert("Failed to update product.");
    } finally {
      if (isMounted.current) setIsUploading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content shadow-lg rounded-4">
          <form onSubmit={handleSave}>
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">Edit Product</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* ------------ CORE ------------ */}
              <h6 className="text-info mb-3">Core</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="form-control" required />
                </div>

                {/* START: Seller ID Added */}
                <div className="col-md-6">
                  <label className="form-label">Seller ID</label>
                  <input name="sellerid" value={form.sellerid} className="form-control" readOnly disabled />
                </div>
                {/* END: Seller ID Added */}

                <div className="col-md-3">
                  <label className="form-label">Price</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} className="form-control" required />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Offer Price</label>
                  <input name="offerPrice" type="number" value={form.offerPrice} onChange={handleChange} className="form-control" />
                </div>

                <div className="col-md-12">
                  <label>Description</label>
                  <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="form-control" required />
                </div>
              </div>

              {/* ------------ CATEGORY ------------ */}
              <h6 className="text-info mt-4 mb-2">Categorization</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Category</label>
                  <select
                    name="categoryId"
                    className="form-select"
                    value={form.categoryId}
                    onChange={handleChange}
                    disabled={loadingCategories}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label>Brand</label>
                  <select
                    name="brandId"
                    className="form-select"
                    value={form.brandId}
                    onChange={handleChange}
                    disabled={loadingBrands}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ------------ INVENTORY ------------ */}
              <h6 className="text-info mt-4 mb-2">Inventory</h6>
              <div className="row g-3">

                <div className="col-md-3">
                  <label>Net Volume</label>
                  <input className="form-control" name="netVolume" value={form.netVolume} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Stock</label>
                  <input type="number" className="form-control" name="stock" value={form.stock} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Tax Amount (%)</label>
                  <input type="number" className="form-control" name="taxAmount" value={form.taxAmount} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Cash on Delivery</label>
                  <select className="form-select" name="cashOnDelivery" value={form.cashOnDelivery} onChange={handleChange}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label>Rating</label>
                  <input type="number" min="0" max="5" step="0.1" className="form-control" name="rating" value={form.rating} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Best Selling</label>
                  <div className="form-check form-switch mt-2">
                    <input type="checkbox" className="form-check-input" name="isBestSelling" checked={form.isBestSelling} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ------------ DETAILS (New Section) ------------ */}
              <h6 className="text-info mt-4 mb-2">Details</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Dosage</label>
                  <input className="form-control" name="dosage" value={form.dosage} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Ingredients</label>
                  <input className="form-control" name="ingredients" value={form.ingredients} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Composition</label>
                  <input className="form-control" name="composition" value={form.composition} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Storage</label>
                  <input className="form-control" name="storage" value={form.storage} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Manufactured By</label>
                  <input className="form-control" name="manufacturedBy" value={form.manufacturedBy} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Marketed By</label>
                  <input className="form-control" name="marketedBy" value={form.marketedBy} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Shelf Life</label>
                  <input className="form-control" name="shelfLife" value={form.shelfLife} onChange={handleChange} />
                </div>

                <div className="col-md-8">
                  <label className="form-label">Additional Info (Supports Q: A:)</label>
                  <textarea rows="3" className="form-control" name="additionalInformation" value={form.additionalInformation} onChange={handleChange} />
                </div>
              </div>


              {/* ------------ MEDIA ------------ */}
              <h6 className="text-info mt-4 mb-2">Current Images</h6>
              <div className="d-flex flex-wrap gap-2">
                {form.imageUrl.map((src, i) => (
                  <div key={i} className="position-relative">
                    <img src={src} className="rounded border" style={{ width: 72, height: 72, objectFit: "cover" }} />
                    <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" onClick={() => removeImageAt(i)}>✕</button>
                  </div>
                ))}
              </div>

              <h6 className="text-info mt-3 mb-2">Add More Images</h6>
              <input type="file" accept="image/*" multiple className="form-control" onChange={(e) => setImageFiles([...e.target.files])} />
              <textarea className="form-control mt-2" rows="2" placeholder="Paste image URLs" value={imageUrlsText} onChange={(e) => setImageUrlsText(e.target.value)} />

              {/* ------------ VIDEOS ------------ */}
              <h6 className="text-info mt-4 mb-2">Current Videos</h6>
              <ul className="list-group">
                {form.videoUrl.map((v, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between">
                    <span className="text-truncate" style={{ maxWidth: 460 }}>{v}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeVideoAt(i)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <h6 className="text-info mt-3 mb-2">Add More Videos</h6>
              <input type="file" accept="video/mp4" multiple className="form-control" onChange={(e) => setVideoFiles([...e.target.files])} />
              <textarea className="form-control mt-2" rows="2" placeholder="Paste video URLs" value={videoUrlsText} onChange={(e) => setVideoUrlsText(e.target.value)} />

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-pill" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-info text-white rounded-pill" disabled={isUploading}>
                {isUploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;