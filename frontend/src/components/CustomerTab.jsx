import React, { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.js";
import "../styles/CustomerTab.css";

function CustomerTab() {
  const { userInfo } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ Fetch all customers
  const getAllCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/shop/allClients/${userInfo.shopId}`);
      if (res.data.success) {
        const list = res.data.clients || [];
        setCustomers(list);
        setFilteredCustomers(list);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) getAllCustomers();
  }, [userInfo?.shopId]);

  // ✅ Handle search & filter
  useEffect(() => {
    let results = customers;

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      results = results.filter(
        (c) =>
          c.customer_name?.toLowerCase().includes(lower) ||
          c.contact_number?.toString().includes(lower) ||
          c.vehicle_number?.toLowerCase().includes(lower) ||
          c.vehicle_model?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== "All") {
      results = results.filter((c) => c.status === statusFilter);
    }

    setFilteredCustomers(results);
  }, [searchTerm, statusFilter, customers]);

  return (
    <div>
      {/* ✅ Header with title, search & filter */}
      <div className="tab-header">
        <h3 className="section-title">Customer Management</h3>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="radio-inputs filter-customer-dropdown">
                {[
                    { value: "All", label: "All" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "pending", label: "Pending" },
                    { value: "completed", label: "Completed" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                ].map((option) => (
                    <label className="radio" key={option.value}>
                    <input
                        type="radio"
                        name="statusFilter"
                        value={option.value}
                        checked={statusFilter === option.value}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <span className="name">{option.label}</span>
                    </label>
                ))}
                <input
                type="text"
                className="search-input-customer"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                }}
                />
            </div>
        </div>
      </div>

      {/* ✅ Loading or empty message */}
      {loading ? (
        <p>Loading customers...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="error-text">No customers found.</p>
      ) : (
        <div className="data-grid">
          {filteredCustomers.map((cust) => (
            <div key={cust._id} className="data-card-customer">
              <div className="data-card-header">
                <h4>{cust.customer_name || "Unnamed Customer"}</h4>
                <span
                    className={`data-card-status ${
                        cust.status
                        ? `status-${cust.status.toLowerCase()}`
                        : "status-inactive"
                    }`}
                    >
                    {cust.status || "Inactive"}
                </span>
              </div>

              <div className="data-card-body">
                <p>
                  <strong>Contact:</strong> {cust.contact_number || "N/A"}
                </p>
                <p>
                  <strong>Vehicle No:</strong> {cust.vehicle_number || "N/A"}
                </p>
                <p>
                  <strong>Vehicle Model:</strong> {cust.vehicle_model || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerTab;
