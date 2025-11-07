import React, { useEffect, useState } from "react";
import FixedHeader from "../FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  db,
} from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import ViewProductModal from "./ViewProductModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] = useState(null);

  // ✅ AUTH LISTENER
  useEffect(() => {
    let unsubAuth;
    try {
      const auth = getAuth();
      unsubAuth = onAuthStateChanged(auth, (user) => setCurrentAdminUser(user));
    } catch (e) {
      console.error("Auth listener error:", e);
    }

    // ✅ FETCH PRODUCTS
    const fetchAll = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const list = snap.docs.map((d) => {
          const data = d.data();

          const priceVal = Number(data.price || 0);
          const offerVal = Number(data.offerPrice ?? priceVal);

          const images = Array.isArray(data.imageUrl) ? data.imageUrl : [];
          const primaryImage =
            images[0] ||
            (data.image?.startsWith("http") ? data.image : "📦");

          const stockNum = Number(data.stock ?? data.productsCount ?? 0);

          return {
            id: d.id,
            productId: data.productId || d.id,

            // images
            image: primaryImage,
            imageUrl: images,
            videoUrl: Array.isArray(data.videoUrl) ? data.videoUrl : [],

            // info
            name: data.title || "Unknown Product",
            price: `₹${priceVal.toFixed(2)}`,
            offerPriceRaw: offerVal,
            sale:
              priceVal > 0
                ? Math.round(((priceVal - offerVal) / priceVal) * 100)
                : 0,

            quantity: data.netVolume || "N/A",

            stockCount: stockNum,
            stock: stockNum > 0 ? "In stock" : "Out of stock",

            description: data.description || "",
            dosage: data.dosage || "",
            ingredients: data.ingredients || "",
            manufacturedBy: data.manufacturedBy || "",
            marketedBy: data.marketedBy || "",
            cashOnDelivery: data.cashOnDelivery || "No",
            composition: data.composition || "",
            additionalInformation: data.additionalInformation || "",
            shelfLife: data.shelfLife || "",

            categoryId: data.categoryId || "",
            brandId: data.brandId || "",
            categoryName: data.categoryName || "N/A",
            brandName: data.brandName || "N/A",

            sellerId: data.sellerId || "",

            taxAmount: Number(data.taxAmount || 0),
            storage: data.storage || "",
            isBestSelling: Boolean(data.isBestSelling),
            rating: Number(data.rating || 0),
          };
        });

        setProducts(list);
      } catch (e) {
        console.error("Fetch products error:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    return () => unsubAuth && unsubAuth();
  }, []);

  // ✅ ADD PRODUCT
  const handleAddProduct = async (newProductData) => {
    try {
      const firestoreData = {
        ...newProductData,
        price: Number(newProductData.price),
        offerPrice: Number(newProductData.offerPrice || 0),
        stock: Number(newProductData.stock),
        rating: Number(newProductData.rating || 0),
        taxAmount: Number(newProductData.taxAmount || 0),
        sellerId: newProductData.sellerid, // NOTE: `sellerid` from AddProductModal is used
      };

      const docRef = await addDoc(collection(db, "products"), firestoreData);
      await updateDoc(docRef, { productId: docRef.id });

      const priceVal = firestoreData.price;
      const offerVal = firestoreData.offerPrice;

      const uiProduct = {
        id: docRef.id,
        productId: docRef.id,
        image: firestoreData.imageUrl?.[0] || "📦",
        imageUrl: firestoreData.imageUrl || [],
        videoUrl: firestoreData.videoUrl || [],

        name: firestoreData.title,
        price: `₹${priceVal.toFixed(2)}`,
        offerPriceRaw: offerVal,
        sale:
          priceVal > 0
            ? Math.round(((priceVal - offerVal) / priceVal) * 100)
            : 0,

        quantity: firestoreData.netVolume,
        stockCount: firestoreData.stock,
        stock: firestoreData.stock > 0 ? "In stock" : "Out of stock",

        description: firestoreData.description,
        dosage: firestoreData.dosage,
        ingredients: firestoreData.ingredients,
        manufacturedBy: firestoreData.manufacturedBy,
        marketedBy: firestoreData.marketedBy,
        cashOnDelivery: firestoreData.cashOnDelivery,
        composition: firestoreData.composition,
        additionalInformation: firestoreData.additionalInformation,
        shelfLife: firestoreData.shelfLife,

        categoryId: firestoreData.categoryId,
        brandId: firestoreData.brandId,
        categoryName: firestoreData.categoryName,
        brandName: firestoreData.brandName,

        sellerId: firestoreData.sellerId,
        taxAmount: firestoreData.taxAmount,
        storage: firestoreData.storage,
        isBestSelling: firestoreData.isBestSelling,
        rating: firestoreData.rating,
      };

      setProducts((prev) => [...prev, uiProduct]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product.");
    }
  };

  // ✅ ✅ ✅ EDIT PRODUCT (FIXED)
  const handleEditProduct = async (updatedProductData) => {
    try {
      const productRef = doc(db, "products", updatedProductData.id);

      const firestoreData = {
        title: updatedProductData.title,
        description: updatedProductData.description,
        price: Number(updatedProductData.price),
        netVolume: updatedProductData.netVolume || "",
        dosage: updatedProductData.dosage || "",
        ingredients: updatedProductData.ingredients || "",
        composition: updatedProductData.composition || "",
        storage: updatedProductData.storage || "",
        manufacturedBy: updatedProductData.manufacturedBy || "",
        marketedBy: updatedProductData.marketedBy || "",
        shelfLife: updatedProductData.shelfLife || "",
        additionalInformation: updatedProductData.additionalInformation || "",

        stock: Number(updatedProductData.stock || 0),
        taxAmount: Number(updatedProductData.taxAmount || 0),
        cashOnDelivery: updatedProductData.cashOnDelivery || "No",
        offerPrice: Number(updatedProductData.offerPrice || 0),
        isBestSelling: Boolean(updatedProductData.isBestSelling),
        rating: Number(updatedProductData.rating || 0),

        categoryId: updatedProductData.categoryId,
        brandId: updatedProductData.brandId,
        categoryName: updatedProductData.categoryName || "",
        brandName: updatedProductData.brandName || "",

        // FIX: The EditProductModal sends 'sellerid' (lowercase 'id').
        // We use 'sellerid' from the update payload and provide a fallback ("")
        // to prevent Firebase from failing on `undefined`.
        sellerId: updatedProductData.sellerid || updatedProductData.sellerId || "", 

        imageUrl: updatedProductData.imageUrl || [],
        videoUrl: updatedProductData.videoUrl || [],
      };

      await updateDoc(productRef, firestoreData);

      // ✅ Update UI immediately (FIXED)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updatedProductData.id
            ? {
                ...p,
                name: firestoreData.title,
                description: firestoreData.description,
                price: `₹${firestoreData.price.toFixed(2)}`,
                offerPriceRaw: firestoreData.offerPrice,
                sale:
                  firestoreData.price > 0
                    ? Math.round(
                        ((firestoreData.price - firestoreData.offerPrice) /
                          firestoreData.price) *
                          100
                      )
                    : 0,

                quantity: firestoreData.netVolume,
                stockCount: firestoreData.stock,
                stock:
                  firestoreData.stock > 0 ? "In stock" : "Out of stock",

                imageUrl: firestoreData.imageUrl,
                videoUrl: firestoreData.videoUrl,
                image: firestoreData.imageUrl?.[0] || "📦",

                categoryId: firestoreData.categoryId,
                brandId: firestoreData.brandId,
                categoryName: firestoreData.categoryName,
                brandName: firestoreData.brandName,

                sellerId: firestoreData.sellerId,
                taxAmount: firestoreData.taxAmount,
                storage: firestoreData.storage,
                dosage: firestoreData.dosage,
                ingredients: firestoreData.ingredients,
                composition: firestoreData.composition,
                manufacturedBy: firestoreData.manufacturedBy,
                marketedBy: firestoreData.marketedBy,
                additionalInformation:
                  firestoreData.additionalInformation,
                rating: firestoreData.rating,
                isBestSelling: firestoreData.isBestSelling,
              }
            : p
        )
      );

      setEditProduct(null);
    } catch (e) {
      console.error("Update error:", e);
      alert("Failed to update product.");
    }
  };

  // ✅ DELETE PRODUCT
  const handleDelete = async (productId) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteProduct(null);
    } catch (e) {
      console.error("Delete error:", e);
      alert("Failed to delete.");
    }
  };

  // ✅ SEARCH
  const displayedProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ LOADING SCREEN
  if (loading) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#f1f3f6" }}
        className="d-flex justify-content-center align-items-center"
      >
        <h2 className="fw-bold text-primary">Loading Products...</h2>
      </div>
    );
  }

  const sellerId = currentAdminUser?.uid || "";

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader onSearchChange={setSearchTerm} />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">Product Management</h2>

        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn bg-primary text-white shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
          >
            + Add New Product
          </button>
        </div>

        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>ID</th>
                  <th>Price</th>
                  <th>Qty/Vol</th>
                  <th>Sale</th>
                  <th>Stock</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted p-4">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((product) => (
                    <tr key={product.id} className="hover-shadow">
                      <td>
                        <div className="d-flex align-items-center">
                          {product.image?.startsWith("http") ? (
                            <img
                              src={product.image}
                              alt=""
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                              }}
                              className="me-3 rounded-circle shadow-sm"
                            />
                          ) : (
                            <div className="me-3 p-3 bg-light rounded-circle shadow-sm">
                              📦
                            </div>
                          )}

                          <span className="fw-semibold">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td>{product.id}</td>
                      <td>{product.price}</td>
                      <td>{product.quantity}</td>

                      <td>
                        <span className="badge bg-success">
                          {product.sale}%
                        </span>
                      </td>

                      <td>
                        {product.stockCount > 0 ? (
                          <span className="badge bg-success">
                            In stock ({product.stockCount})
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            Out of stock
                          </span>
                        )}
                      </td>

                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setViewProduct(product)}
                        >
                          👁️
                        </button>

                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => setEditProduct(product)}
                        >
                          ✏️
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteProduct(product)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ MODALS */}
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddProduct}
            sellerId={sellerId}
          />
        )}

        {editProduct && (
          <EditProductModal
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSave={handleEditProduct}
          />
        )}

        {viewProduct && (
          <ViewProductModal
            product={viewProduct}
            onClose={() => setViewProduct(null)}
          />
        )}

        {deleteProduct && (
          <DeleteConfirmationModal
            product={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            onConfirm={() => handleDelete(deleteProduct.id)}
          />
        )}
      </div>

      <style>{`
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