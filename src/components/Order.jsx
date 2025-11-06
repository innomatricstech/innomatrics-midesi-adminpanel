import React, { useState, useEffect } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";
// ✅ IMPORT FIREBASE FUNCTIONS
import { 
    db, 
    collection, 
    getDocs,
    doc,
    deleteDoc,
    // You may need updateDoc and addDoc for the other handlers, but we will focus on fetching/deleting for now
    updateDoc,
    addDoc
} from "../firebase"; 

// ✅ Define the collection and subcollection names
const CUSTOMER_COLLECTION_NAME = "customers";
const ORDER_SUBCOLLECTION_NAME = "orders";

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [viewOrder, setViewOrder] = useState(null);
    const [deleteOrder, setDeleteOrder] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newOrder, setNewOrder] = useState({
        customer: "",
        date: "",
        items: "",
        total: "",
        status: "Pending",
        // Note: For Add/Edit to work, you may need a Customer ID here
    });

    useEffect(() => {
        // ✅ UPDATED: Function to fetch orders from the 'orders' subcollection
        const getOrders = async () => {
            setLoading(true);
            try {
                // 1. Get all customer documents (Parent Collection)
                const customersSnapshot = await getDocs(collection(db, CUSTOMER_COLLECTION_NAME));
                
                // 2. Create an array of Promises to fetch the 'orders' subcollection for each customer
                const ordersPromises = customersSnapshot.docs.map(async (customerDoc) => {
                    const customerId = customerDoc.id;
                    const customerData = customerDoc.data();
                    
                    // Path to the subcollection: 'customers/{customerId}/orders'
                    const ordersCollectionRef = collection(db, CUSTOMER_COLLECTION_NAME, customerId, ORDER_SUBCOLLECTION_NAME);
                    const ordersSnapshot = await getDocs(ordersCollectionRef);
                    
                    // Map the orders data and include the customerId for CRUD operations
                    return ordersSnapshot.docs.map(orderDoc => {
                        const data = orderDoc.data();
                        
                        return {
                            docId: orderDoc.id, // Order Document ID (required for its own delete/update)
                            customerId: customerId, // Parent Customer ID (required for the path)
                            id: data.orderId || orderDoc.id, 
                            // Use customer name from the customer doc or fall back to order doc
                            customer: customerData.name || data.customerName || data.customer || "N/A", 
                            date: data.createdAt?.toDate().toLocaleDateString() || data.date || "N/A", 
                            total: data.totalAmount?.toFixed(2) || data.total || "0.00",
                            status: data.orderStatus || data.status || "Pending",
                            items: data.products?.length || data.items || 0,
                            ...data, 
                        };
                    });
                });

                // 3. Resolve all promises and flatten the array of orders
                const allOrdersArrays = await Promise.all(ordersPromises);
                const allOrders = allOrdersArrays.flat(); 
                
                setOrders(allOrders);
            } catch (error) {
                console.error("❌ Error fetching orders from Firestore subcollection:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        getOrders();
    }, []);

    // FILTER LOGIC (Unchanged, operates on the `orders` state)
    const filteredOrders = orders.filter((order) => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (
            order.id.toLowerCase().includes(lowerCaseSearch) ||
            order.customer.toLowerCase().includes(lowerCaseSearch) ||
            order.status.toLowerCase().includes(lowerCaseSearch)
        );
    });
    
    // ✅ UPDATED: Handle Delete using the subcollection path
    const handleDelete = async () => {
        // Ensure both the order ID (docId) and the parent customer ID are available
        if (!deleteOrder || !deleteOrder.docId || !deleteOrder.customerId) {
            alert("Error: Missing required IDs for deletion.");
            setDeleteOrder(null);
            return;
        }

        try {
            // Construct the full path: 'customers/{customerId}/orders/{orderId}'
            const orderDocRef = doc(db, 
                CUSTOMER_COLLECTION_NAME, 
                deleteOrder.customerId, 
                ORDER_SUBCOLLECTION_NAME, 
                deleteOrder.docId
            );
            await deleteDoc(orderDocRef);
            
            // Update local state after successful deletion
            setOrders(orders.filter((o) => o.docId !== deleteOrder.docId));
            setDeleteOrder(null);
        } catch (error) {
            console.error("❌ Error deleting order from Firestore:", error);
            alert("Failed to delete order. Check console for details.");
        }
    };
    
    // ⚠️ WARNING: The following functions (handleStatusChange, handleAddOrder, handleEditOrder) 
    // still only update the local state. For production, you must implement `updateDoc` and 
    // `addDoc` using the correct subcollection path (e.g., using `order.customerId` and `order.docId`).

    const handleStatusChange = async (docId, newStatus) => {
        const orderToUpdate = orders.find(o => o.docId === docId);
        if (!orderToUpdate || !orderToUpdate.customerId) return;

        try {
            const orderDocRef = doc(db, 
                CUSTOMER_COLLECTION_NAME, 
                orderToUpdate.customerId, 
                ORDER_SUBCOLLECTION_NAME, 
                docId
            );
            await updateDoc(orderDocRef, { status: newStatus });
            
            // Update local state on success
            setOrders(
                orders.map((order) => (order.docId === docId ? { ...order, status: newStatus } : order))
            );
        } catch (error) {
            console.error("❌ Error updating status:", error);
        }
    };

    const handleAddOrder = async () => {
        
        console.warn("⚠️ Cannot add order to subcollection without knowing the parent Customer ID.");

        const newId = `#ORD${(orders.length + 1).toString().padStart(3, "0")}`;
        setOrders([...orders, { ...newOrder, id: newId }]);
        setNewOrder({ customer: "", date: "", items: "", total: "", status: "Pending" });
        setShowAddModal(false);
    };

    const handleEditOrder = async () => {
        if (!editOrder || !editOrder.docId || !editOrder.customerId) {
             console.error("Error: Missing required IDs for edit.");
             setEditOrder(null);
             return;
        }

        try {
            const orderDocRef = doc(db, 
                CUSTOMER_COLLECTION_NAME, 
                editOrder.customerId, 
                ORDER_SUBCOLLECTION_NAME, 
                editOrder.docId
            );
            
            // Prepare data for update (only sending fields that could change)
            const updatedData = {
                customer: editOrder.customer,
                date: editOrder.date,
                items: editOrder.items,
                total: editOrder.total,
                status: editOrder.status,
            };

            await updateDoc(orderDocRef, updatedData);
            
            // Update local state on success
            setOrders(
                orders.map((o) => (o.docId === editOrder.docId ? editOrder : o))
            );
            setEditOrder(null);
        } catch (error) {
             console.error("❌ Error editing order:", error);
        }
    };

    // Display loading indicator
    if (loading) {
        return (
            <div className="text-center p-5" style={{ minHeight: "100vh", background: "#f1f3f6" }}>
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-primary">Loading Orders...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
            <FixedHeader 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
            />
            
            <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
                <h2 className="mb-4 fw-bold text-primary">Order Management</h2>

                {/* Toolbar */}
                <div className="d-flex justify-content-end align-items-center mb-3 flex-wrap gap-2">
                    <button
                        className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
                        onClick={() => setShowAddModal(true)}
                    >
                        <span className="me-2">+</span> Add New Order
                    </button>
                </div>

                {/* Orders Table */}
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="table-light">
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
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted p-4">
                                            {searchTerm ? `No orders found matching "${searchTerm}".` : "No orders found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.docId} className="align-middle hover-shadow">
                                            <td>{order.id}</td>
                                            <td>{order.customer}</td>
                                            <td>{order.date}</td>
                                            <td>{order.items}</td>
                                            <td className="fw-bold">₹{order.total}</td>
                                            <td>
                                                <select
                                                    className={`form-select form-select-sm ${
                                                        order.status === "Pending"
                                                          ? "bg-warning text-dark"
                                                          : order.status === "Completed"
                                                          ? "bg-success text-white"
                                                          : "bg-danger text-white"
                                                    }`}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.docId, e.target.value)}
                                                >
                                                    <option>Pending</option>
                                                    <option>Completed</option>
                                                    <option>Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1 shadow-sm"
                                                    onClick={() => setViewOrder(order)}
                                                    title="View Order"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-warning me-1 shadow-sm"
                                                    onClick={() => setEditOrder(order)}
                                                    title="Edit Order"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger shadow-sm"
                                                    onClick={() => setDeleteOrder(order)}
                                                    title="Delete Order"
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

                {/* Add Order Modal (Incomplete for Firebase subcollection) */}
                {showAddModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                        {/* ... modal content ... */}
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded-4">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Order</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input type="text" className="form-control" value={newOrder.customer} onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Date</label>
                                        <input type="date" className="form-control" value={newOrder.date} onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Items</label>
                                        <input type="number" className="form-control" value={newOrder.items} onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Total (₹)</label>
                                        <input type="text" className="form-control" value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}>
                                            <option>Pending</option>
                                            <option>Completed</option>
                                            <option>Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleAddOrder}>Add Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Order Modal */}
                {editOrder && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                        {/* ... modal content ... */}
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded-4">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Order {editOrder.id}</h5>
                                    <button type="button" className="btn-close" onClick={() => setEditOrder(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input type="text" className="form-control" value={editOrder.customer} onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Date</label>
                                        <input type="date" className="form-control" value={editOrder.date} onChange={(e) => setEditOrder({ ...editOrder, date: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Items</label>
                                        <input type="number" className="form-control" value={editOrder.items} onChange={(e) => setEditOrder({ ...editOrder, items: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Total (₹)</label>
                                        <input type="text" className="form-control" value={editOrder.total} onChange={(e) => setEditOrder({ ...editOrder, total: e.target.value })}/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={editOrder.status} onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}>
                                            <option>Pending</option>
                                            <option>Completed</option>
                                            <option>Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setEditOrder(null)}>Cancel</button>
                                    <button className="btn btn-warning" onClick={handleEditOrder}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Modal (Unchanged) */}
                {viewOrder && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                        {/* ... modal content ... */}
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded-4">
                                <div className="modal-header">
                                    <h5 className="modal-title">Order Details</h5>
                                    <button type="button" className="btn-close" onClick={() => setViewOrder(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>Order ID:</strong> {viewOrder.id}</p>
                                    <p><strong>Customer:</strong> {viewOrder.customer}</p>
                                    <p><strong>Date:</strong> {viewOrder.date}</p>
                                    <p><strong>Items:</strong> {viewOrder.items}</p>
                                    <p><strong>Total:</strong> ₹{viewOrder.total}</p>
                                    <p>
                                        <strong>Status:</strong>{" "}
                                        <span
                                            className={`badge ${
                                                viewOrder.status === "Pending"
                                                  ? "bg-warning text-dark"
                                                  : viewOrder.status === "Completed"
                                                  ? "bg-success"
                                                  : "bg-danger"
                                              } px-3 py-2 fw-semibold`}
                                        >
                                            {viewOrder.status}
                                        </span>
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setViewOrder(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {deleteOrder && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                        <div className="modal-dialog modal-sm modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded-4">
                                <div className="modal-header">
                                    <h5 className="modal-title">Delete Order</h5>
                                    <button type="button" className="btn-close" onClick={() => setDeleteOrder(null)}></button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to delete <strong>{deleteOrder.id}</strong>?
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setDeleteOrder(null)}>Cancel</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
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
            `}</style>
        </div>
    );
};

export default OrderPage;