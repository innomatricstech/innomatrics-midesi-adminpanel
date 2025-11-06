import React, { useState, useEffect } from "react";
import FixedHeader from "../FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    db,
    collection,
    getDocs
} from "../../firebase";

import ViewCustomerModal from './ViewCustomerModal';

const COLLECTION_NAME = "customers";

const CustomerDetails = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewCustomer, setViewCustomer] = useState(null);
    // KEEP: State must remain here to control and filter the data
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchAllCustomers = async () => {
            setLoading(true);
            try {
                const customersCollectionRef = collection(db, COLLECTION_NAME);
                const customerSnapshot = await getDocs(customersCollectionRef);

                const customersList = customerSnapshot.docs.map(doc => {
                    const data = doc.data();

                    return {
                        id: doc.id,
                        // --- Core Fields for List View ---
                        name: data.name || "N/A",
                        email: data.email || "N/A",
                        phone: data.phone || "N/A",
                        totalOrders: data.orders?.length || 0,
                        totalSpent: data.totalSpent?.toFixed(2) || "0.00",
                        
                        // --- All fields saved for the Modal/Download ---
                        uid: data.uid || "N/A",
                        customerReferalCode: data.customerReferalCode || "N/A",
                        fcmToken: data.fcmToken || "N/A",
                        imageUrl: data.imageUrl || null,
                        usedReferralCode: data.usedReferralCode || "N/A",
                        // Format timestamps to readable date strings for the file
                        lastOrderDate: data.lastOrderDate?.toDate
                            ? data.lastOrderDate.toDate().toLocaleDateString()
                            : "N/A",
                        orders: data.orders || [],
                        notifications: data.notifications || [],
                    };
                });

                setCustomers(customersList);

            } catch (error) {
                console.error("Error fetching all customer records from Firestore:", error);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllCustomers();
    }, []);

    // KEEP: Filter logic must remain here to use the 'customers' state
    const filteredCustomers = customers.filter(customer => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (
            customer.name.toLowerCase().includes(lowerCaseSearch) ||
            customer.email.toLowerCase().includes(lowerCaseSearch) ||
            customer.id.toLowerCase().includes(lowerCaseSearch)
        );
    });

    // 🆕 Excel Download Function
    const handleDownloadExcel = () => {
        // 1. Define the headers and keys for the CSV
        // Use all available fields for a complete data dump
        const headers = [
            "Customer ID",
            "Name",
            "Email",
            "Phone",
            "Total Orders",
            "Total Spent ($)",
            "Last Order Date",
            "UID",
            "Referral Code (Customer)",
            "Used Referral Code",
            "FCM Token",
        ];
        const keys = [
            "id",
            "name",
            "email",
            "phone",
            "totalOrders",
            "totalSpent",
            "lastOrderDate",
            "uid",
            "customerReferalCode",
            "usedReferralCode",
            "fcmToken",
        ];

        // 2. Map data to rows (CSV format)
        const csvRows = [];
        csvRows.push(headers.join(",")); // Add header row

        filteredCustomers.forEach((customer) => {
            const row = keys.map((key) => {
                const value = customer[key] || "";
                
                // Simple escape for potential commas/quotes in data fields
                // Wrap value in double quotes if it contains a comma, quote, or newline
                let escapedValue = String(value);
                if (escapedValue.includes(",") || escapedValue.includes('"') || escapedValue.includes('\n')) {
                    // Escape double quotes by doubling them, then wrap the whole value in quotes
                    escapedValue = `"${escapedValue.replace(/"/g, '""')}"`;
                }
                
                return escapedValue;
            });
            csvRows.push(row.join(","));
        });

        // 3. Create the final CSV string
        const csvString = csvRows.join("\n");

        // 4. Trigger the download
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "customer_details.csv"); // File name
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-primary">Loading Customers...</p>
            </div>
        );
    }

    return (
        <div className="customer-page-container">
            {/* --- PASS SEARCH PROPS TO FIXEDHEADER --- */}
            <FixedHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm} // Pass the setter function
            />
            {/* -------------------------------------- */}

            <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-primary mb-0">
                        Customer Management ( **{customers.length} total** )
                    </h2>
                    {/* 🆕 Download Button */}
                    <button
                        className="btn btn-outline-success shadow-sm rounded-pill px-4"
                        onClick={handleDownloadExcel}
                        disabled={filteredCustomers.length === 0}
                    >
                        ⬇️ Download Excel 
                    </button>
                </div>


                <div className="card shadow-lg border-0 rounded-4">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Use filteredCustomers for rendering */}
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted p-4">
                                            {searchTerm ? `No results found for "${searchTerm}".` : "No customers found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="align-middle hover-shadow">
                                            <td className="text-muted">{customer.id.substring(0, 8)}...</td>
                                            <td className="fw-semibold">{customer.name}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.phone}</td>
                                            <td>{customer.totalOrders}</td>
                                            <td>${customer.totalSpent}</td>

                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary shadow-sm"
                                                    onClick={() => setViewCustomer(customer)}
                                                    title="View Full Details"
                                                >
                                                    View 👁️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {viewCustomer && (
                <ViewCustomerModal
                    customer={viewCustomer}
                    onClose={() => setViewCustomer(null)}
                />
            )}

            <style>{`
                .customer-page-container { min-height: 100vh; background: #f1f3f6; }
                .hover-shadow:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.12); transition: all 0.3s ease-in-out; }
            `}</style>
        </div>
    );
};

export default CustomerDetails;