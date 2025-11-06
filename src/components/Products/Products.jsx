import React, { useState, useEffect } from "react";
import FixedHeader from "../FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  db 
} from "../../firebase"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";

import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ViewProductModal from './ViewProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';


const ProductList = () => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] = useState(null); 

  useEffect(() => {
    let unsubscribeAuth;
    try {
        const authInstance = getAuth();
        unsubscribeAuth = onAuthStateChanged(authInstance, (user) => {
            setCurrentAdminUser(user);
        });
    } catch (error) {
        console.error("Error setting up Firebase Auth listener:", error);
    }
    
    const fetchAllProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products"); 
        const productSnapshot = await getDocs(productsCollectionRef);

        const productsList = productSnapshot.docs.map(doc => {
          const data = doc.data();
          const priceValue = parseFloat(data.price) || 0;
          const offerPriceValue = parseFloat(data.offerPrice) || priceValue;

          // --- Image Handling Logic (Keep this robust logic) ---
          let primaryImage = data.image || "📦"; 
          if (Array.isArray(data.imageUrl) && data.imageUrl.length > 0) {
             primaryImage = data.imageUrl[0];
          } 
          if (typeof data.image === 'string' && data.image.startsWith('http')) {
              primaryImage = data.image;
          }
          // --- End Image Handling Logic ---

          const numericalStock = parseFloat(data.stock || data.productsCount || 0);
          const stockStatus = numericalStock > 0 ? "In stock" : "Out of stock";

          return {
            id: doc.id, 
            image: primaryImage, // The single image URL/path/emoji
            name: data.title || "Unknown Product", 
            price: `₹${priceValue.toFixed(2)}`,
            quantity: data.netVolume || "N/A", 
            sale: priceValue > 0 ? Math.round(((priceValue - offerPriceValue) / priceValue) * 100) : 0, 
            stock: stockStatus,
            
            description: data.description || '', 
            dosage: data.dosage || '',
            manufacturedBy: data.manufacturedBy || '',
            marketedBy: data.marketedBy || '',
            cashOnDelivery: data.cashOnDelivery || '',
            composition: data.composition || '', 
            additionalInformation: data.additionalInformation || '',
           
            categoryId: data.categoryId || "", 
            brandId: data.brandId || "", 
            
            categoryName: data.categoryName || 'N/A', 
            brandName: data.brandName || 'N/A', 

            offerPriceRaw: offerPriceValue,
            stockCount: numericalStock,
            sellerId: data.sellerId || data.sellerid || '',
            taxAmount: data.taxAmount || 0,
            storage: data.storage || '',
            isBestSelling: data.isBestSelling || false,
          };
        });
        
        setProducts(productsList);
        
      } catch (error) {
        console.error("Error fetching products from Firebase: ", error);
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
    
    return () => {
        if (unsubscribeAuth) unsubscribeAuth();
    };

  }, []); 
  

const handleAddProduct = async (newProductData) => {
  try {
    const rawPrice = parseFloat(
      newProductData.price.replace("₹", "").replace(",", "") || 0
    );

    const imageValue = newProductData.image;

    const imageUrlArray =
      typeof imageValue === "string" && imageValue.startsWith("http")
        ? [imageValue]
        : [];

    const firestoreData = {
      title: newProductData.name,
      price: rawPrice,
      netVolume: newProductData.quantity,
      stock: parseFloat(newProductData.stockCount || 0),

      image: imageValue,
      imageUrl: imageUrlArray,

      categoryId: newProductData.categoryId,
      brandId: newProductData.brandId,
      categoryName: newProductData.categoryName,
      brandName: newProductData.brandName,

      description: newProductData.description || "",
      dosage: newProductData.dosage || "",
      manufacturedBy: newProductData.manufacturedBy || "",
      marketedBy: newProductData.marketedBy || "",
      cashOnDelivery: newProductData.cashOnDelivery || "N/A",
      composition: newProductData.composition || "",
      additionalInformation: newProductData.additionalInformation || "",
      sellerId: newProductData.sellerId || "",
      taxAmount: newProductData.taxAmount || 0,
      storage: newProductData.storage || "",
      isBestSelling: newProductData.isBestSelling || false,
    };

    // ✅ 1) Add product → Firestore auto-generates ID
    const docRef = await addDoc(collection(db, "products"), firestoreData);

    // ✅ 2) Store that ID inside the document
    await updateDoc(docRef, {
      productId: docRef.id,
    });

    // ✅ 3) Add to UI list
    const addedProduct = {
      ...firestoreData,
      id: docRef.id,
      productId: docRef.id, // ✅ store for UI
      image: imageValue.startsWith("http") ? imageValue : "📦",
      price: `₹${rawPrice.toFixed(2)}`,
      offerPriceRaw: rawPrice,
      sale: 0,
      stock: firestoreData.stock > 0 ? "In stock" : "Out of stock",
      stockCount: firestoreData.stock,
      quantity: newProductData.quantity,
      name: newProductData.name,
    };

    setProducts((prev) => [...prev, addedProduct]);
    setShowAddModal(false);
  } catch (error) {
    console.error("Error adding product: ", error);
    alert("Failed to add product to Firebase. Check console.");
  }
};

  const handleEditProduct = async (updatedProductData) => {
    try {
      const productRef = doc(db, "products", updatedProductData.id);
      const rawOriginalPrice = parseFloat(updatedProductData.price.replace('₹', '').replace(',', '') || 0);

      // The imageValue is the final URL from EditProductModal
      const imageValue = updatedProductData.image; 
      const imageUrlArray = (typeof imageValue === 'string' && imageValue.startsWith('http')) 
          ? [imageValue] 
          : []; 

      const firestoreData = {
        title: updatedProductData.name,
        price: rawOriginalPrice,
        netVolume: updatedProductData.quantity,
        stock: parseFloat(updatedProductData.stockCount || 0),
        
        image: imageValue,           
        imageUrl: imageUrlArray,     
        
        categoryId: updatedProductData.categoryId,
        brandId: updatedProductData.brandId,
        categoryName: updatedProductData.categoryName, 
        brandName: updatedProductData.brandName,     
        
        dosage: updatedProductData.dosage,
        description: updatedProductData.description,
        composition: updatedProductData.composition,
        manufacturedBy: updatedProductData.manufacturedBy,
        marketedBy: updatedProductData.marketedBy,
        cashOnDelivery: updatedProductData.cashOnDelivery,
        additionalInformation: updatedProductData.additionalInformation,
        offerPrice: updatedProductData.offerPriceRaw,
        sellerId: updatedProductData.sellerId,
        taxAmount: parseFloat(updatedProductData.taxAmount || 0),
        storage: updatedProductData.storage,
        isBestSelling: updatedProductData.isBestSelling || false,
      };
      
      await updateDoc(productRef, firestoreData);
      
      const updatedProduct = {
          ...updatedProductData,
          image: typeof imageValue === 'string' && imageValue.startsWith('http') ? imageValue : "📦", // Display image
          price: `₹${rawOriginalPrice.toFixed(2)}`,
          sale: rawOriginalPrice > 0 ? Math.round(((rawOriginalPrice - firestoreData.offerPrice) / rawOriginalPrice) * 100) : 0,
          stock: firestoreData.stock > 0 ? "In stock" : "Out of stock", 
          stockCount: firestoreData.stock,
          categoryId: updatedProductData.categoryId,
          brandId: updatedProductData.brandId,
          categoryName: updatedProductData.categoryName,
          brandName: updatedProductData.brandName,
      }
      setProducts(products.map((p) => (p.id === updatedProductData.id ? updatedProduct : p)));
      setEditProduct(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Failed to update product in Firebase. Check console for details.");
      setEditProduct(null);
    }
  };


  const handleDelete = async (productId) => {
    // ... (existing logic)
    try {
      await deleteDoc(doc(db, "products", productId));
      
      setProducts(products.filter((p) => p.id !== productId));
      setDeleteProduct(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete product from Firebase. Check console for details.");
      setDeleteProduct(null);
    }
  };
  
  const displayedProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div style={{ minHeight: "100vh", background: "#f1f3f6", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="fw-bold text-primary">Loading Products...</h2>
        </div>
    );
  }
  
  const sellerId = currentAdminUser ? currentAdminUser.uid : '';

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader onSearchChange={setSearchTerm} />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Product Management</h2>

        <div className="d-flex justify-content-end align-items-center mb-3 flex-wrap gap-2">
          <button 
            className="btn bg-primary text-white shadow-sm rounded-pill px-4" 
            onClick={() => setShowAddModal(true)}
          >
            <span className="me-2">+</span> Add New Product
          </button>
        </div>

        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Product ID</th>
                  <th>Price</th>
                  <th>Quantity/Volume</th>
                  <th>Sale (%)</th>
                  <th>Stock</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center text-muted p-4">
                            {searchTerm ? `No products match "${searchTerm}".` : "No products found."}
                        </td>
                    </tr>
                ) : (
                    displayedProducts.map((product) => (
                      <tr key={product.id} className="align-middle hover-shadow">
                        <td>
                          <div className="d-flex align-items-center">
                            {/* 🎯 MODIFIED: Robust Image Rendering Logic */}
                            {product.image && typeof product.image === 'string' && product.image.startsWith('http') ? (
                                <img 
                                      src={product.image} 
                                      alt={product.name} 
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                      className="me-3 p-1 bg-light rounded-circle shadow-sm" 
                                      onError={(e) => { 
                                          e.target.onerror = null; 
                                          e.target.style.display = 'none'; 
                                          // Display the fallback emoji div if image fails to load
                                          const fallbackDiv = e.target.nextSibling;
                                          if (fallbackDiv) fallbackDiv.style.display = 'block';
                                      }} 
                                  />
                            ) : null}
                            {/* Fallback/Emoji display */}
                            <div 
                                style={{ display: (product.image && typeof product.image === 'string' && product.image.startsWith('http')) ? 'none' : 'block' }} // Hide if a valid URL is present
                                className="me-3 p-3 bg-light rounded-circle shadow-sm text-center fs-6"
                            >
                                {product.image || '📦'}
                            </div>
                            <span className="fw-semibold">{product.name}</span>
                          </div>
                        </td>
                        <td>{product.id}</td>
                        <td className="fw-bold">{product.price}</td>
                        <td>{product.quantity}</td>
                        <td>
                          <span className="badge bg-success text-white">{product.sale}%</span>
                        </td>
                        <td>
                          <span className={`badge ${product.stock === "Out of stock" ? "bg-danger" : "bg-success"} fw-semibold`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewProduct(product)} title="View Product">👁️</button>
                          <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditProduct(product)} title="Edit Product">✏️</button>
                          <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteProduct(product)} title="Delete Product">🗑️</button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
            <AddProductModal 
                onClose={() => setShowAddModal(false)} 
                onAdd={handleAddProduct} 
                sellerId={sellerId} 
            />
        )}
        {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onSave={handleEditProduct} />}
        {viewProduct && <ViewProductModal product={viewProduct} onClose={() => setViewProduct(null)} />}
        {deleteProduct && <DeleteConfirmationModal product={deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={() => handleDelete(deleteProduct.id)} />}

      </div>

      <style>{`
        /* ... CSS Styles ... */
        .btn-gradient-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
        }
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
        }
        .hover-shadow:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          transition: all 0.3s ease-in-out;
        }
        .modal.show {
          overflow-x: hidden;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default ProductList;