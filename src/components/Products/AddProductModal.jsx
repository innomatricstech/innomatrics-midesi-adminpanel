import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db, collection, getDocs, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ---------------------------- CATEGORY HOOK ---------------------------- */
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
      } catch (e) {
        console.error("Category fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return { categories, loading };
};

/* ---------------------------- BRAND HOOK ---------------------------- */
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
      } catch (e) {
        console.error("Brand fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return { brands, loading };
};

/* ---------------------------- MAIN COMPONENT ---------------------------- */

const AddProductModal = ({ onClose, onAdd, sellerId }) => {
  const { categories, loading: loadingCategories } = useCategoryFetcher();
  const { brands, loading: loadingBrands } = useBrandFetcher();

  /* ---------------------------- FORM STATE ---------------------------- */
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    offerPrice: 0,
    netVolume: "",
    dosage: "",
    ingredients: "",
    composition: "",
    storage: "",
    manufacturedBy: "",
    marketedBy: "",
    shelfLife: "",
    additionalInformation: "",
    stock: 0,
    taxAmount: 0,
    cashOnDelivery: "Yes",
    isBestSelling: false,
    rating: 0,
    categoryId: "",
    brandId: "",
    categoryName: "",
    brandName: "",
    sellerid: sellerId || "",
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
      return;
    }

    if (name === "categoryId") {
      const cat = categories.find((c) => c.id === value);
      setForm((p) => ({
        ...p,
        categoryId: value,
        categoryName: cat?.name || "",
      }));
      return;
    }

    if (name === "brandId") {
      const b = brands.find((c) => c.id === value);
      setForm((p) => ({
        ...p,
        brandId: value,
        brandName: b?.name || "",
      }));
      return;
    }

    const numeric = ["price", "offerPrice", "stock", "taxAmount", "rating"];
    setForm((p) => ({
      ...p,
      [name]: numeric.includes(name) ? Number(value) : value,
    }));
  };

  /* ---------------------------- IMAGE/VIDEO STATE ---------------------------- */

  const [useImageUpload, setUseImageUpload] = useState(true);
  const [useVideoUpload, setUseVideoUpload] = useState(true);

  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const [imageUrlsText, setImageUrlsText] = useState("");
  const [videoUrlsText, setVideoUrlsText] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const splitUrls = (text) =>
    text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

  const uploadFiles = async (files, folder, validate) => {
    const out = [];
    for (const file of files) {
      if (!validate(file)) continue;

      const path = `${folder}/${Date.now()}_${file.name}`;
      const r = ref(storage, path);

      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      out.push(url);
    }
    return out;
  };

  /* ---------------------------- FORM SUBMIT ---------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId) return alert("Select category.");
    if (!form.brandId) return alert("Select brand.");
    if (!form.title) return alert("Product title required.");
    if (!form.description) return alert("Product description required.");

    setIsUploading(true);

    try {
      const pastedImages = splitUrls(imageUrlsText);
      const uploadedImages = useImageUpload
        ? await uploadFiles(imageFiles, "products/images", (f) =>
            f.type.startsWith("image/")
          )
        : [];

      const pastedVideos = splitUrls(videoUrlsText);
      const uploadedVideos = useVideoUpload
        ? await uploadFiles(
            videoFiles,
            "products/videos",
            (f) =>
              f.type === "video/mp4" ||
              f.name.toLowerCase().endsWith(".mp4")
          )
        : [];

      const finalProduct = {
        ...form,
        imageUrl: [...uploadedImages, ...pastedImages],
        videoUrl: [...uploadedVideos, ...pastedVideos],
        price: Number(form.price),
        offerPrice: Number(form.offerPrice),
        stock: Number(form.stock),
        taxAmount: Number(form.taxAmount),
        rating: Number(form.rating),
      };

      await onAdd(finalProduct);
    } catch (err) {
      console.error("Add product error:", err);
      alert("Failed to add product.");
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------------------------- PREVIEWS ---------------------------- */
  const imagePreviews = [
    ...imageFiles.map((f) => URL.createObjectURL(f)),
    ...splitUrls(imageUrlsText),
  ];

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content rounded-4 shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* HEADER */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Add Product</h5>
              <button className="btn-close btn-close-white" onClick={onClose}></button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <h6 className="text-primary fw-bold">Basic Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Offer Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="offerPrice"
                    value={form.offerPrice}
                    onChange={handleChange}
                  />
                </div>
                
                {/* START: Seller ID Added */}
                <div className="col-md-6">
                  <label className="form-label">Seller ID</label>
                  <input
                    className="form-control"
                    name="sellerid"
                    value={form.sellerid}
                    readOnly
                    disabled
                  />
                </div>
                {/* END: Seller ID Added */}


                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* CATEGORY / BRAND */}
              <h6 className="text-primary mt-4 fw-bold">Category & Brand</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Brand</label>
                  <select
                    className="form-select"
                    name="brandId"
                    value={form.brandId}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INVENTORY */}
              <h6 className="text-primary mt-4 fw-bold">Inventory</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Net Volume</label>
                  <input
                    className="form-control"
                    name="netVolume"
                    value={form.netVolume}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Tax (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="taxAmount"
                    value={form.taxAmount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* DETAILS */}
              <h6 className="text-primary mt-4 fw-bold">Details</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Dosage</label>
                  <input
                    className="form-control"
                    name="dosage"
                    value={form.dosage}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Ingredients</label>
                  <input
                    className="form-control"
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Composition</label>
                  <input
                    className="form-control"
                    name="composition"
                    value={form.composition}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Storage</label>
                  <input
                    className="form-control"
                    name="storage"
                    value={form.storage}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Manufactured By</label>
                  <input
                    className="form-control"
                    name="manufacturedBy"
                    value={form.manufacturedBy}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Marketed By</label>
                  <input
                    className="form-control"
                    name="marketedBy"
                    value={form.marketedBy}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Shelf Life</label>
                  <input
                    className="form-control"
                    name="shelfLife"
                    value={form.shelfLife}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label">
                    Additional Info (Supports Q: A:)
                  </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    name="additionalInformation"
                    value={form.additionalInformation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* IMAGES */}
              <h6 className="text-primary mt-4 fw-bold">Images</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between">
                    <label className="form-label">Upload Images</label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={useImageUpload}
                      onChange={() => setUseImageUpload((p) => !p)}
                    />
                  </div>
                  <input
                    type="file"
                    className="form-control"
                    disabled={!useImageUpload}
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles([...e.target.files])}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Paste Image URLs</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={imageUrlsText}
                    onChange={(e) => setImageUrlsText(e.target.value)}
                  />
                </div>

                {imagePreviews.length > 0 && (
                  <div className="col-md-12 mt-2 d-flex flex-wrap gap-2">
                    {imagePreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                        }}
                        className="rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* VIDEOS */}
              <h6 className="text-primary mt-4 fw-bold">Videos (MP4)</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between">
                    <label className="form-label">Upload Videos</label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={useVideoUpload}
                      onChange={() => setUseVideoUpload((p) => !p)}
                    />
                  </div>
                  <input
                    type="file"
                    className="form-control"
                    disabled={!useVideoUpload}
                    accept="video/mp4"
                    multiple
                    onChange={(e) => setVideoFiles([...e.target.files])}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Paste Video URLs</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={videoUrlsText}
                    onChange={(e) => setVideoUrlsText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn btn-secondary rounded-pill" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;