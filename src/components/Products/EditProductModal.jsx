import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

import { 
    db, 
    collection, 
    getDocs, 
    storage, // 🎯 NEEDED: Firebase Storage object
} from "../../firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 

// --------------------------------------------------------
// Custom hook to fetch categories from Firestore (Reused from AddProductModal)
// --------------------------------------------------------
const useCategoryFetcher = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const categoryCollectionRef = collection(db, "category");
                const snapshot = await getDocs(categoryCollectionRef);

                const categoryList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().categoryName || "Unnamed Category", 
                    imageURL: doc.data().categoryImage || "", 
                }));
                
                setCategories(categoryList);
            } catch (error) {
                console.error("Error fetching categories from Firestore:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading };
};

// --------------------------------------------------------
// Custom hook to fetch brands from Firestore (Reused from AddProductModal)
// --------------------------------------------------------
const useBrandFetcher = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            try {
                const brandCollectionRef = collection(db, "brands");
                const snapshot = await getDocs(brandCollectionRef);

                const brandList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().brandName || "Unnamed Brand", 
                    imageURL: doc.data().brandImage || "", 
                }));
                
                setBrands(brandList);
            } catch (error) {
                console.error("Error fetching brands from Firestore:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return { brands, loading };
};

const EditProductModal = ({ product, onClose, onSave }) => {
    const { categories, loading: loadingCategories } = useCategoryFetcher();
    const { brands, loading: loadingBrands } = useBrandFetcher(); 

    // 🎯 INITIAL STATE: Use existing product data
    const [editedProduct, setEditedProduct] = useState({
        id: product.id,
        image: product.image && product.image.startsWith('http') ? product.image : "", // Use existing URL or start empty
        name: product.name || "",
        price: product.price ? product.price.replace('₹', '') : "", // Remove currency symbol for editing
        quantity: product.quantity || "", 
        stockCount: product.stockCount || 0, 
        isBestSelling: product.isBestSelling || false, 
        categoryId: product.categoryId || "",    
        categoryName: product.categoryName || "",  
        categoryImageURL: product.categoryImageURL || "", 
        brandId: product.brandId || "",       
        brandName: product.brandName || "",  
        brandImageURL: product.brandImageURL || "", 
        offerPriceRaw: product.offerPriceRaw || 0, 
        sellerId: product.sellerId || "", 
        taxAmount: product.taxAmount || 0, 
        storage: product.storage || "",
        cashOnDelivery: product.cashOnDelivery || "Yes", 
        dosage: product.dosage || "", 
        manufacturedBy: product.manufacturedBy || "",
        marketedBy: product.marketedBy || "",
        description: product.description || "",
        composition: product.composition || "",
        additionalInformation: product.additionalInformation || "",
    });

    // 🎯 DUAL MODE STATE: Check if existing image is a URL, if so, start in URL mode (false)
    const [useFileUploadMode, setUseFileUploadMode] = useState(!editedProduct.image); 

    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false); 

    // UseEffect to clean up local file URL (needed for preview)
    useEffect(() => {
        // Cleanup function for file object URLs
        return () => {
            if (imageFile) {
                URL.revokeObjectURL(imageFile);
            }
        };
    }, [imageFile]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setEditedProduct(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // Handle Category Selection (name="categoryId")
        if (name === 'categoryId') {
            const selectedCategory = categories.find(cat => cat.id === value);
            
            setEditedProduct(prev => ({
                ...prev,
                categoryId: value, 
                categoryName: selectedCategory ? selectedCategory.name : "", 
                categoryImageURL: selectedCategory ? selectedCategory.imageURL : "", 
            }));
            return;
        }
        
        // Handle Brand Selection (name="brandId")
        if (name === 'brandId') {
            const selectedBrand = brands.find(brand => brand.id === value);
            
            setEditedProduct(prev => ({
                ...prev,
                brandId: value, 
                brandName: selectedBrand ? selectedBrand.name : "",
                brandImageURL: selectedBrand ? selectedBrand.imageURL : "", 
            }));
            return;
        }
        
        // Safely parse numbers for fields that require it
        const parsedValue = (
            name === 'offerPriceRaw' || 
            name === 'stockCount' || 
            name === 'taxAmount'
        ) 
            ? parseFloat(value || 0)
            : value;
        
        // Update the main state field
        setEditedProduct(prev => ({
            ...prev,
            [name]: parsedValue,
        }));
    };

    const handleSave = async (e) => { 
        e.preventDefault();
        
        if (!editedProduct.categoryId) {
            alert("Please select a Category.");
            return;
        }
        
        let imageUrl = editedProduct.image; 

        // 🎯 MODIFIED LOGIC: Handle File Upload OR URL Input
        if (useFileUploadMode && imageFile) {
            // --- File Upload Logic: New file selected ---
            try {
                setIsUploading(true);
                const imgRef = ref(storage, `products/${imageFile.name}-${Date.now()}`);
                await uploadBytes(imgRef, imageFile);
                imageUrl = await getDownloadURL(imgRef); // Get the public URL

            } catch (error) {
                console.error("Error uploading product image:", error);
                alert("Failed to upload product image. Please check console.");
                setIsUploading(false);
                return; 
            }
        } else if (useFileUploadMode && !imageFile && !editedProduct.image) {
            // File upload mode selected, but no file chosen and no existing image.
            imageUrl = "";
        } else if (!useFileUploadMode && !editedProduct.image) {
             // URL mode selected and URL input is empty.
             alert("Please provide a valid Image URL or select a file.");
             return;
        }
        
        // At this point, imageUrl is: 
        // 1. New URL from upload.
        // 2. Updated URL from text input.
        // 3. Original URL (if no upload was done and no manual URL change was made).
        
        setIsUploading(false); // Reset uploading status
        
        const finalProductData = {
            ...editedProduct,
            image: imageUrl, // Final URL (from upload, text input, or original)
        };

        onSave(finalProductData); 
    };

    // Determine which URL to use for the live preview
    const previewSource = useFileUploadMode && imageFile 
        ? URL.createObjectURL(imageFile) 
        : editedProduct.image; 

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl"> 
                <div className="modal-content shadow-lg rounded-4">
                    <form onSubmit={handleSave}>
                        <div className="modal-header bg-info text-white">
                            <h5 className="modal-title">Edit Product: {editedProduct.name}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            
                            {/* --- Core Information & Pricing --- */}
                            <h6 className="text-info mb-3">Core Information & Pricing</h6>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input type="text" className="form-control" name="name" value={editedProduct.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Price (Raw)</label>
                                    <input type="text" className="form-control" name="price" value={editedProduct.price} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Offer Price (Raw ₹)</label>
                                    <input type="number" step="0.01" className="form-control" name="offerPriceRaw" value={editedProduct.offerPriceRaw} onChange={handleChange} required />
                                </div>

                                {/* CATEGORY DROPDOWN */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Select Category</label> 
                                    <select 
                                        className="form-select" 
                                        name="categoryId" 
                                        value={editedProduct.categoryId} 
                                        onChange={handleChange} 
                                        required
                                        disabled={loadingCategories}
                                    >
                                        <option value="" disabled>
                                            {loadingCategories ? "Loading Categories..." : "--- Select Category ---"}
                                        </option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* BRAND DROPDOWN */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Select Brand</label> 
                                    <select 
                                        className="form-select" 
                                        name="brandId" 
                                        value={editedProduct.brandId} 
                                        onChange={handleChange} 
                                        required
                                        disabled={loadingBrands}
                                    >
                                        <option value="" disabled>
                                            {loadingBrands ? "Loading Brands..." : "--- Select Brand ---"}
                                        </option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 🎯 MODIFIED: Image Input Section with Toggle and Preview */}
                                <div className="col-md-4 mb-3">
                                    {/* Toggle Switch */}
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label">Product Image Source</label> 
                                        <div className="form-check form-switch">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id="imageModeSwitch" 
                                                checked={useFileUploadMode}
                                                onChange={() => {
                                                    setUseFileUploadMode(prev => !prev);
                                                    setImageFile(null); // Clear file when switching mode
                                                    // Note: We keep the existing URL in state until explicitly changed or overridden by upload
                                                }}
                                            />
                                            <label className="form-check-label small" htmlFor="imageModeSwitch">
                                                {useFileUploadMode ? "File Upload" : "Image URL"}
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* Conditional Input Field */}
                                    {useFileUploadMode ? (
                                        // --- File Upload Input ---
                                        <div className="border p-2 rounded">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="form-control" 
                                                onChange={(e) => {
                                                    setImageFile(e.target.files[0]);
                                                    // When a file is selected, clear the manual URL to ensure upload is prioritized
                                                    setEditedProduct(prev => ({...prev, image: ""})); 
                                                }} 
                                            />
                                            {(imageFile || editedProduct.image) ? (
                                                <small className="text-success mt-1 d-block">
                                                    {imageFile ? `New file ready: ${imageFile.name}` : `Current URL is stored.`}
                                                </small>
                                            ) : (
                                                <small className="text-muted mt-1 d-block">Select a file to upload or enter a URL.</small>
                                            )}
                                        </div>
                                    ) : (
                                        // --- URL Text Input ---
                                        <div className="border p-2 rounded">
                                            <input 
                                                type="url" 
                                                className="form-control" 
                                                placeholder="Paste Image URL (e.g., https://...)"
                                                name="image" 
                                                value={editedProduct.image} 
                                                onChange={handleChange} 
                                            />
                                            <small className="text-muted mt-1 d-block">Manually paste the image link here.</small>
                                        </div>
                                    )}

                                    {/* 🎯 NEW: Image Preview Section */}
                                    {previewSource && (
                                        <div className="mt-3 border p-2 rounded text-center bg-light">
                                            <label className="form-label small text-info fw-bold">Image Preview</label>
                                            <img 
                                                src={previewSource} 
                                                alt="Product Preview" 
                                                className="img-fluid rounded" 
                                                style={{ maxHeight: '120px', objectFit: 'contain' }} 
                                                onError={(e) => { 
                                                    e.target.style.display = 'none'; 
                                                    e.target.previousSibling.innerHTML = 'Image Preview (Failed to load)'; 
                                                }}
                                                onLoad={(e) => { 
                                                    e.target.style.display = 'block'; 
                                                    e.target.previousSibling.innerHTML = 'Image Preview'; 
                                                }}
                                            />
                                        </div>
                                    )}

                                </div>
                                {/* END Image Input Section */}
                                
                                {/* Remaining fields */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Quantity/Volume</label>
                                    <input type="text" className="form-control" name="quantity" value={editedProduct.quantity} onChange={handleChange} required />
                                </div>
                                
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Stock Count (Numerical/Raw)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="stockCount" 
                                        value={editedProduct.stockCount} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                {/* Is Best Selling Checkbox */}
                                <div className="col-md-4 mb-3">
                                    <div className="form-check form-switch mt-4">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            role="switch"
                                            id="isBestSellingSwitch" 
                                            name="isBestSelling" 
                                            checked={editedProduct.isBestSelling}
                                            onChange={handleChange} 
                                        />
                                        <label className="form-check-label" htmlFor="isBestSellingSwitch">Mark as Best Selling</label>
                                    </div>
                                </div>
                            </div>
                            
                            <h6 className="mt-2 text-info">Logistics & Tax Information</h6>
                            <hr className="my-2"/>
                            
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Seller/Admin ID</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="sellerId" 
                                        value={editedProduct.sellerId} 
                                        onChange={handleChange} 
                                        disabled 
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Tax Amount (%)</label>
                                    <input type="number" step="0.01" className="form-control" name="taxAmount" value={editedProduct.taxAmount} onChange={handleChange} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Storage Conditions</label>
                                    <input type="text" className="form-control" name="storage" value={editedProduct.storage} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">COD Available (Text)</label>
                                    <input type="text" className="form-control" name="cashOnDelivery" value={editedProduct.cashOnDelivery} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Dosage/How To Use</label>
                                    <input type="text" className="form-control" name="dosage" value={editedProduct.dosage} onChange={handleChange} />
                                </div>
                            </div>

                            <h6 className="mt-2 text-info">Detail Descriptions</h6>
                            <hr className="my-2"/>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Manufactured By</label>
                                    <input type="text" className="form-control" name="manufacturedBy" value={editedProduct.manufacturedBy} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Marketed By</label>
                                    <input type="text" className="form-control" name="marketedBy" value={editedProduct.marketedBy} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows="3" name="description" value={editedProduct.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Composition Snippet</label>
                                <textarea className="form-control" rows="3" name="composition" value={editedProduct.composition} onChange={handleChange}></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Additional Information (Enter each step/point on a new line)</label>
                                <textarea className="form-control" rows="4" name="additionalInformation" value={editedProduct.additionalInformation} onChange={handleChange}></textarea>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary rounded-pill" onClick={onClose}>Cancel</button>
                            <button 
                                type="submit" 
                                className="btn btn-info rounded-pill text-white"
                                disabled={isUploading} 
                            >
                                {isUploading ? "Uploading..." : "Save Changes"} 
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;