import React, { useState, useEffect, useCallback } from "react";
import FixedHeader from "../FixedHeader";
import {
  db,
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "../../firebase";

import ViewOrderModal from "./ViewOrderPage";
import "bootstrap/dist/css/bootstrap.min.css";

/* -------------------------- CONSTANTS -------------------------- */
const CUSTOMER_COLLECTION_NAME = "customers";
const ORDER_SUBCOLLECTION_NAME = "orders";
const PRODUCT_COLLECTION_NAME = "products";

/* -------------------------- BADGE COLORS -------------------------- */
const statusClass = (status) => {
  switch (status) {
    case "Pending":
      return "bg-warning text-dark";
    case "Shipped":
      return "bg-info text-dark";
    case "Delivered":
      return "bg-success text-white";
    case "Canceled":
      return "bg-danger text-white";
    default:
      return "bg-secondary text-white";
  }
};

/* -------------------------- DELETE MODAL -------------------------- */
const ConfirmDeleteModal = ({ order, onClose, onConfirm }) => {
  if (!order) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-danger">Delete Order</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body text-center">
            Are you sure you want to delete:
            <br />
            <span className="fw-bold">{order.id}</span>?
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =============================================================
   ORDER PAGE
============================================================= */
const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [viewOrder, setViewOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);

  /* -------------------------- FETCH ORDERS -------------------------- */
  const getOrders = useCallback(async () => {
    setLoading(true);

    try {
      console.log("Fetching orders...");
      const customersSnapshot = await getDocs(
        collection(db, CUSTOMER_COLLECTION_NAME)
      );

      console.log("Customers found:", customersSnapshot.docs.length);

      const orderLists = customersSnapshot.docs.map(async (customerDoc) => {
        const customerId = customerDoc.id;
        const customer = customerDoc.data();

        const ordersRef = collection(
          db,
          CUSTOMER_COLLECTION_NAME,
          customerId,
          ORDER_SUBCOLLECTION_NAME
        );

        const orderSnap = await getDocs(ordersRef);

        return orderSnap.docs.map((o) => {
          const data = o.data();

          return {
            ...data,
            id: data.orderId || o.id,
            docId: o.id,
            customerId,
            customer: customer.name || "N/A",
            date:
              data.createdAt?.toDate().toLocaleDateString() ||
              data.date ||
              "N/A",
            total: (data.totalAmount || data.total || 0).toFixed(2),
            items: data.products?.length || 0,
            status: data.status || "Pending",
          };
        });
      });

      const all = await Promise.all(orderLists);
      const flattenedOrders = all.flat();
      console.log("All orders fetched:", flattenedOrders.length);
      setOrders(flattenedOrders);
    } catch (e) {
      console.error("Fetch Orders Error:", e);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  /* -------------------------- DEBUG ORDER DATA -------------------------- */
  const debugOrderData = (order) => {
    console.log("🔍 Order Debug Info:", {
      orderId: order.id,
      docId: order.docId,
      customerId: order.customerId,
      hasProducts: !!order.products,
      productsLength: order.products?.length,
      products: order.products,
      fullOrder: order
    });
  };

  /* -------------------------- EXTRACT PRODUCT DATA -------------------------- */
  const extractProductData = (item) => {
    // Handle nested product structure: {product: {…}, quantity: 6}
    if (item.product && typeof item.product === 'object') {
      const product = item.product;
      
      const productId = product.id || product.productId || product.docId;
      const productName = product.name || product.productName || product.title || "Unknown Product";
      const quantity = item.quantity || item.qty || 1;
      
      return {
        productId: productId,
        quantity: quantity,
        productName: productName
      };
    }
    // Handle standard structure: {productId: "123", quantity: 2}
    else if (item.productId) {
      return {
        productId: item.productId,
        quantity: item.quantity || item.qty || 1,
        productName: item.productName || item.name || "Unknown Product"
      };
    }
    // Handle alternative ID field: {id: "123", quantity: 2}
    else if (item.id) {
      return {
        productId: item.id,
        quantity: item.quantity || item.qty || 1,
        productName: item.productName || item.name || "Unknown Product"
      };
    }
    
    console.warn("❌ Unknown product structure:", item);
    return null;
  };

  /* -------------------------- RESTOCK PRODUCT -------------------------- */
  const handleRestockProduct = async (productId, productName, additionalStock = 10) => {
    try {
      console.log(`🔄 Restocking product: ${productName}`);
      const productRef = doc(db, PRODUCT_COLLECTION_NAME, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        alert("Product not found in database");
        return false;
      }

      const productData = productSnap.data();
      const currentStock = Number(productData.stockCount) || 0;
      const newStock = currentStock + additionalStock;

      await updateDoc(productRef, {
        stockCount: newStock
      });

      console.log(`✅ Restocked: ${productName} - ${currentStock} -> ${newStock}`);
      alert(`✅ Successfully restocked ${productName}\nNew stock: ${newStock} units`);
      return true;
    } catch (error) {
      console.error("Restock error:", error);
      alert(`❌ Failed to restock: ${error.message}`);
      return false;
    }
  };

  /* -------------------------- ACCEPT ORDER (Pending → Shipped) -------------------------- */
  const handleAcceptOrder = async (order) => {
    try {
      console.log("🚀 Starting order acceptance for:", order.id);
      debugOrderData(order);

      // Validate order data
      if (!order || !order.customerId || !order.docId) {
        alert("❌ Invalid order data");
        return;
      }

      const outOfStockItems = [];
      const successfullyUpdatedItems = [];

      // Check if products array exists and has items
      if (order.products && order.products.length > 0) {
        console.log("📦 Processing stock deduction for", order.products.length, "products");
        
        // First, validate all products and extract product data
        const productItems = [];
        
        for (const item of order.products) {
          console.log("🛒 Processing order item:", item);
          const productData = extractProductData(item);
          
          if (!productData) {
            console.error("❌ Could not extract product data from:", item);
            alert(`Invalid product data in order. Please check product structure.`);
            return;
          }

          if (!productData.productId) {
            console.error("❌ Missing productId in:", productData);
            alert(`Missing product ID in order items.`);
            return;
          }

          productData.quantity = Number(productData.quantity) || 1;
          productItems.push(productData);
        }

        console.log("✅ Extracted product data:", productItems);

        // Check stock and collect out-of-stock items
        for (const productItem of productItems) {
          console.log(`🔍 Checking product: ${productItem.productId}, Quantity: ${productItem.quantity}`);
          const productRef = doc(db, PRODUCT_COLLECTION_NAME, productItem.productId);
          const productSnap = await getDoc(productRef);

          if (!productSnap.exists()) {
            console.error(`❌ Product ${productItem.productId} not found in database`);
            outOfStockItems.push({
              name: productItem.productName,
              required: productItem.quantity,
              available: 0,
              reason: "Product not found"
            });
            continue;
          }

          const productData = productSnap.data();
          const stock = Number(productData.stockCount) || 0;
          const quantity = productItem.quantity;

          console.log(`📊 Product ${productItem.productId} - Stock: ${stock}, Required: ${quantity}`);

          if (stock < quantity) {
            outOfStockItems.push({
              name: productItem.productName,
              required: quantity,
              available: stock,
              reason: "Insufficient stock"
            });
          } else {
            successfullyUpdatedItems.push(productItem);
          }
        }

        // If there are out-of-stock items, show warning but continue
        if (outOfStockItems.length > 0) {
          const outOfStockMessage = outOfStockItems.map(item => 
            `• ${item.name}: Required ${item.required}, Available ${item.available}`
          ).join('\n');
          
          const userChoice = window.confirm(
            `⚠️ Some items have insufficient stock:\n\n${outOfStockMessage}\n\nDo you want to proceed with accepting the order anyway? Stock will not be deducted for out-of-stock items.`
          );
          
          if (!userChoice) {
            alert("Order acceptance cancelled.");
            return;
          }
        }

        // Deduct stock only for items with sufficient stock
        console.log("✅ Proceeding with stock deduction for items with sufficient stock");
        for (const productItem of successfullyUpdatedItems) {
          const productRef = doc(db, PRODUCT_COLLECTION_NAME, productItem.productId);
          const productSnap = await getDoc(productRef);
          const productData = productSnap.data();
          const stock = Number(productData.stockCount) || 0;
          const quantity = productItem.quantity;

          console.log(`➖ Deducting stock: ${productItem.productId} - ${stock} -> ${stock - quantity}`);
          
          await updateDoc(productRef, {
            stockCount: stock - quantity,
          });
          
          console.log(`✅ Stock deducted: ${productItem.productName} - ${quantity} units`);
        }

        if (outOfStockItems.length > 0) {
          console.log("⚠️ Skipped stock deduction for out-of-stock items:", outOfStockItems);
        }
      } else {
        console.log("ℹ️ No products found in order, skipping stock deduction");
      }

      // Update order status
      console.log("📝 Updating order status to Shipped...");
      const orderRef = doc(
        db,
        CUSTOMER_COLLECTION_NAME,
        order.customerId,
        ORDER_SUBCOLLECTION_NAME,
        order.docId
      );

      await updateDoc(orderRef, {
        status: "Shipped",
        orderStatus: "Shipped",
        shippedAt: new Date()
      });

      console.log("✅ Order status updated successfully");

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.docId === order.docId ? { ...o, status: "Shipped" } : o
        )
      );

      // Show success message immediately
      if (outOfStockItems.length > 0) {
        alert(`✅ Order accepted and marked as Shipped!\n\n⚠️ Note: ${outOfStockItems.length} item(s) had insufficient stock and were not deducted from inventory.`);
      } else {
        alert("✅ Order accepted and marked as Shipped!");
      }

      console.log("🎉 Order accepted successfully!");

    } catch (error) {
      console.error("❌ Order acceptance error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // More specific error messages
      if (error.code === 'permission-denied') {
        alert("❌ Permission denied. Check your Firebase rules.");
      } else if (error.code === 'not-found') {
        alert("❌ Order or product not found in database.");
      } else if (error.code === 'unavailable') {
        alert("❌ Network error. Please check your internet connection.");
      } else {
        alert(`❌ Failed to accept order: ${error.message}`);
      }
    }
  };

  /* -------------------------- ACCEPT ORDER WITH RESTOCK OPTION -------------------------- */
  const handleAcceptOrderWithRestock = async (order) => {
    try {
      console.log("🚀 Starting order acceptance with restock option for:", order.id);

      // Validate order data
      if (!order || !order.customerId || !order.docId) {
        alert("❌ Invalid order data");
        return;
      }

      let outOfStockItems = [];

      // Check stock first
      if (order.products && order.products.length > 0) {
        const productItems = [];
        
        for (const item of order.products) {
          const productData = extractProductData(item);
          if (productData && productData.productId) {
            productData.quantity = Number(productData.quantity) || 1;
            productItems.push(productData);
          }
        }

        // Check for out-of-stock items
        for (const productItem of productItems) {
          const productRef = doc(db, PRODUCT_COLLECTION_NAME, productItem.productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            const stock = Number(productData.stockCount) || 0;
            const quantity = productItem.quantity;

            if (stock < quantity) {
              outOfStockItems.push({
                ...productItem,
                available: stock
              });
            }
          }
        }

        // If out-of-stock items found, offer to restock
        if (outOfStockItems.length > 0) {
          const outOfStockMessage = outOfStockItems.map(item => 
            `• ${item.productName}: Required ${item.quantity}, Available ${item.available}`
          ).join('\n');
          
          const userChoice = window.confirm(
            `⚠️ Insufficient stock for ${outOfStockItems.length} item(s):\n\n${outOfStockMessage}\n\nDo you want to automatically restock these items and then accept the order?`
          );
          
          if (userChoice) {
            // Restock all out-of-stock items
            for (const item of outOfStockItems) {
              const neededStock = item.quantity - item.available;
              const restockAmount = Math.max(neededStock + 5, 10); // Restock needed amount + buffer
              await handleRestockProduct(item.productId, item.productName, restockAmount);
            }
            
            // Clear out-of-stock items after restocking
            outOfStockItems = [];
          } else {
            alert("Order acceptance cancelled. Please restock manually or use partial acceptance.");
            return;
          }
        }
      }

      // Now proceed with normal order acceptance
      await handleAcceptOrder(order);
      
    } catch (error) {
      console.error("Order acceptance with restock error:", error);
      alert(`❌ Failed to accept order: ${error.message}`);
    }
  };

  /* -------------------------- CHANGE STATUS -------------------------- */
  const handleStatusChange = async (docId, customerId, newStatus) => {
    try {
      console.log(`🔄 Changing status for order ${docId} to ${newStatus}`);
      
      const orderRef = doc(
        db,
        CUSTOMER_COLLECTION_NAME,
        customerId,
        ORDER_SUBCOLLECTION_NAME,
        docId
      );

      await updateDoc(orderRef, {
        status: newStatus,
        orderStatus: newStatus,
      });

      console.log("✅ Status updated successfully");

      setOrders((prev) =>
        prev.map((o) => {
          if (o.docId === docId) {
            return { ...o, status: newStatus };
          }
          return o;
        })
      );

      // Show success message
      alert(`✅ Order status updated to ${newStatus}`);

    } catch (error) {
      console.error("❌ Status update error:", error);
      alert(`❌ Status update failed: ${error.message}`);
    }
  };

  /* -------------------------- DELETE ORDER -------------------------- */
  const handleDeleteOrder = async () => {
    if (!deleteOrder) return;

    try {
      console.log("🗑️ Deleting order:", deleteOrder.id);
      
      await deleteDoc(
        doc(
          db,
          CUSTOMER_COLLECTION_NAME,
          deleteOrder.customerId,
          ORDER_SUBCOLLECTION_NAME,
          deleteOrder.docId
        )
      );

      setOrders((prev) =>
        prev.filter((o) => o.docId !== deleteOrder.docId)
      );

      setDeleteOrder(null);
      alert("✅ Order deleted successfully.");
    } catch (e) {
      console.error("❌ Delete error:", e);
      alert(`❌ Delete failed: ${e.message}`);
    }
  };

  /* -------------------------- SEARCH FILTER -------------------------- */
  const filteredOrders = orders.filter((o) =>
    (o.id + o.customer + o.status)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* -------------------------- LOADING -------------------------- */
  if (loading) {
    return (
      <div className="text-center p-5 fw-bold fs-4 text-primary">
        <div className="spinner-border text-primary me-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        Loading Orders...
      </div>
    );
  }

  /* =============================================================
     RENDER UI
  ============================================================= */
  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader onSearchChange={setSearchTerm} />

      <div className="container-fluid p-4" style={{ paddingTop: 90 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0">Order Management</h2>
        </div>

        {/* Order Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Orders</h5>
                <h2 className="fw-bold">{orders.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <h5 className="card-title">Pending</h5>
                <h2 className="fw-bold">{orders.filter(o => o.status === "Pending").length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-dark">
              <div className="card-body">
                <h5 className="card-title">Shipped</h5>
                <h2 className="fw-bold">{orders.filter(o => o.status === "Shipped").length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Delivered</h5>
                <h2 className="fw-bold">{orders.filter(o => o.status === "Delivered").length}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-lg rounded-4">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Orders List ({filteredOrders.length} orders)</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.docId}>
                    <td className="fw-bold text-primary">{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>
                      <span className="badge bg-secondary">{order.items} items</span>
                    </td>
                    <td className="fw-bold">₹{order.total}</td>

                    <td>
                      <span
                        className={`badge ${statusClass(order.status)} px-3 py-2`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="text-center">
                      {/* ✅ ACCEPT BUTTON ONLY WHEN PENDING */}
                      {order.status === "Pending" && (
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleAcceptOrderWithRestock(order)}
                          title="Accept Order (Auto-restock if needed)"
                        >
                          ✅ Accept
                        </button>
                      )}

                      {/* ✅ STATUS DROPDOWN (ALWAYS) */}
                      <select
                        className="form-select form-select-sm d-inline-block me-2"
                        style={{ width: "150px" }}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.docId,
                            order.customerId,
                            e.target.value
                          )
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Canceled">Canceled</option>
                      </select>

                      {/* View */}
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => setViewOrder({
                          customerId: order.customerId,
                          docId: order.docId
                        })}
                        title="View Details"
                      >
                        👁️
                      </button>

                      {/* Delete */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setDeleteOrder(order)}
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <div className="py-5">
                        <span className="fs-1">📦</span>
                        <p className="mt-2">No orders found</p>
                        {searchTerm && (
                          <small>Try adjusting your search term</small>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ VIEW ORDER MODAL */}
        {viewOrder && (
          <ViewOrderModal
            order={viewOrder}
            onClose={() => setViewOrder(null)}
            onStatusChange={handleStatusChange}
            onAcceptOrder={handleAcceptOrder}
          />
        )}

        {/* ✅ DELETE MODAL */}
        {deleteOrder && (
          <ConfirmDeleteModal
            order={deleteOrder}
            onClose={() => setDeleteOrder(null)}
            onConfirm={handleDeleteOrder}
          />
        )}
      </div>
    </div>
  );
};

export default OrderPage;