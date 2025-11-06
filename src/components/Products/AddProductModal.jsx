import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
// 1. Import necessary Firestore and Storage components
import { 
    db, 
    collection, 
    getDocs, 
    storage, // 🎯 ADDED: Firebase Storage object
} from "../../firebase"; // ⚠️ Adjust the path to your firebase config file

// 🎯 ADDED: Import Storage functions
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 

// --------------------------------------------------------
// Custom hook to fetch categories from Firestore
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
// Custom hook to fetch brands from Firestore
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

const AddProductModal = ({ onClose, onAdd, sellerId }) => {
    const { categories, loading: loadingCategories } = useCategoryFetcher();
    const { brands, loading: loadingBrands } = useBrandFetcher(); 

    // 🎯 NEW STATE: To switch between file upload (true) and URL input (false)
    const [useFileUploadMode, setUseFileUploadMode] = useState(true); 

    // State for image file and upload status
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false); 

    // State initialized with all fields 
    const [newProduct, setNewProduct] = useState({
        // 1. Core Fields
        image: "", // This will hold the final uploaded URL or the manually entered URL
        name: "",
        price: "", 
        quantity: "", 
        stockCount: 0, 
        isBestSelling: false, 
        categoryId: "",    
        categoryName: "",  
        categoryImageURL: "", 
        
        // Brand Fields
        brandId: "",       
        brandName: "",  
        brandImageURL: "", 

        // 2. Pricing & Logistics
        offerPriceRaw: 0, 
        sellerId: sellerId || "", 
        taxAmount: 0, 
        storage: "",
        cashOnDelivery: "Yes", 
        dosage: "", 

        // 3. Detail Descriptions
        manufacturedBy: "",
        marketedBy: "",
        description: "",
        composition: "",
        additionalInformation: "",
    });

    // 🎯 UseEffect to clean up local file URL (needed for preview)
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
            setNewProduct(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // Handle Category Selection
        if (name === 'categoryId') {
            const selectedCategory = categories.find(cat => cat.id === value);
            
            setNewProduct(prev => ({
                ...prev,
                categoryId: value, 
                categoryName: selectedCategory ? selectedCategory.name : "", 
                categoryImageURL: selectedCategory ? selectedCategory.imageURL : "", 
            }));
            return;
        }
        
        // Handle Brand Selection
        if (name === 'brandId') {
            const selectedBrand = brands.find(brand => brand.id === value);
            
            setNewProduct(prev => ({
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
        setNewProduct(prev => ({
            ...prev,
            [name]: parsedValue,
        }));
    };

   const handleSubmit = async (e) => { 
    e.preventDefault();
    
    if (!newProduct.categoryId) {
        alert("Please select a Category.");
        return;
    }
    if (!newProduct.brandId) { 
        alert("Please select a Brand.");
        return;
    }
    
    let imageUrl = newProduct.image; 

    if (useFileUploadMode) {
        if (imageFile) {
            try {
                setIsUploading(true);

                const imgRef = ref(storage, `products/${imageFile.name}-${Date.now()}`);
                await uploadBytes(imgRef, imageFile);
                imageUrl = await getDownloadURL(imgRef);

            } catch (error) {
                console.error("Error uploading product image:", error);
                alert("Failed to upload product image. Please check console.");
                setIsUploading(false);
                return; 
            }
        } else {
            imageUrl = ""; 
        }
    } else {
        if (!newProduct.image) {
            alert("Please provide a valid Image URL or switch to File Upload mode.");
            return;
        }
        imageUrl = newProduct.image;
    }
    
    setIsUploading(false);

    // ✅ Add productId field (Firestore will fill this later)
    const finalProductData = {
        ...newProduct,
        image: imageUrl,
        productId: "",   
    };

    onAdd(finalProductData);
};

    // Determine which URL to use for the live preview
    const previewSource = useFileUploadMode && imageFile 
        ? URL.createObjectURL(imageFile) // Local URL for selected file
        : newProduct.image; // URL from text input or previously uploaded

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl"> 
                <div className="modal-content shadow-lg rounded-4">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Add New Product</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            
                            {/* --- Core Information & Pricing --- */}
                            <h6 className="text-primary mb-3">Core Information & Pricing</h6>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input type="text" className="form-control" name="name" value={newProduct.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Price (₹ - Original)</label>
                                    <input type="text" className="form-control" name="price" value={newProduct.price} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Offer Price (Raw ₹)</label>
                                    <input type="number" step="0.01" className="form-control" name="offerPriceRaw" value={newProduct.offerPriceRaw} onChange={handleChange} required />
                                </div>

                                {/* CATEGORY DROPDOWN */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Select Category</label> 
                                    <select 
                                        className="form-select" 
                                        name="categoryId" 
                                        value={newProduct.categoryId} 
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
                                    <small className="text-muted d-block mt-1">
                                        Selected Category: <span className='fw-bold text-dark me-2'>{newProduct.categoryName || 'N/A'}</span>
                                    </small>
                                </div>
                                
                                {/* BRAND DROPDOWN */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Select Brand</label> 
                                    <select 
                                        className="form-select" 
                                        name="brandId" 
                                        value={newProduct.brandId} 
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
                                    <small className="text-muted d-block mt-1">
                                        Selected Brand: <span className='fw-bold text-dark me-2'>{newProduct.brandName || 'N/A'}</span>
                                    </small>
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
                                                    setNewProduct(prev => ({...prev, image: ""})); // Clear URL when switching mode
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
                                                onChange={(e) => setImageFile(e.target.files[0])} 
                                                required={!newProduct.image} // Require file if no URL is present
                                            />
                                            {imageFile ? (
                                                <small className="text-success mt-1 d-block">
                                                    File ready: <span className='fw-bold'>{imageFile.name}</span>
                                                </small>
                                            ) : (
                                                <small className="text-muted mt-1 d-block">Select a file to upload.</small>
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
                                                value={newProduct.image} 
                                                onChange={handleChange} 
                                                required={!imageFile} // Require URL if no file is selected
                                            />
                                            <small className="text-muted mt-1 d-block">Manually paste the image link here.</small>
                                        </div>
                                    )}

                                    {/* 🎯 NEW: Image Preview Section */}
                                    {previewSource && (
                                        <div className="mt-3 border p-2 rounded text-center bg-light">
                                            <label className="form-label small text-primary fw-bold">Image Preview</label>
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


                                {/* ... (The rest of the form fields remain the same) ... */}

                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Quantity/Volume</label>
                                    <input type="text" className="form-control" name="quantity" value={newProduct.quantity} onChange={handleChange} required />
                                </div>
                                
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Stock Count (Numerical/Raw)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="stockCount" 
                                        value={newProduct.stockCount} 
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
                                            checked={newProduct.isBestSelling}
                                            onChange={handleChange} 
                                        />
                                        <label className="form-check-label" htmlFor="isBestSellingSwitch">Mark as Best Selling</label>
                                    </div>
                                </div>
                            </div>
                            
                            <h6 className="mt-2 text-primary">Logistics & Tax Information</h6>
                            <hr className="my-2"/>
                            
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Seller/Admin ID</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="sellerId" 
                                        value={newProduct.sellerId} 
                                        onChange={handleChange} 
                                        disabled 
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Tax Amount (%)</label>
                                    <input type="number" step="0.01" className="form-control" name="taxAmount" value={newProduct.taxAmount} onChange={handleChange} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Storage Conditions</label>
                                    <input type="text" className="form-control" name="storage" value={newProduct.storage} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">COD Available (Text)</label>
                                    <input type="text" className="form-control" name="cashOnDelivery" value={newProduct.cashOnDelivery} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Dosage/How To Use</label>
                                    <input type="text" className="form-control" name="dosage" value={newProduct.dosage} onChange={handleChange} />
                                </div>
                            </div>

                            <h6 className="mt-2 text-primary">Detail Descriptions</h6>
                            <hr className="my-2"/>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Manufactured By</label>
                                    <input type="text" className="form-control" name="manufacturedBy" value={newProduct.manufacturedBy} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Marketed By</label>
                                    <input type="text" className="form-control" name="marketedBy" value={newProduct.marketedBy} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows="3" name="description" value={newProduct.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Composition Snippet</label>
                                <textarea className="form-control" rows="3" name="composition" value={newProduct.composition} onChange={handleChange}></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Additional Information (Enter each step/point on a new line)</label>
                                <textarea className="form-control" rows="4" name="additionalInformation" value={newProduct.additionalInformation} onChange={handleChange}></textarea>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary rounded-pill" onClick={onClose}>Cancel</button>
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