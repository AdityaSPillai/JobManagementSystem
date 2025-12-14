import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import useAuth from "../context/context";

export default function CustomerTab() {
  const { userInfo } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const CUSTOMER_FIELDS = [
    { name: "name", placeholder: "Name" },
    { name: "email", placeholder: "Email" },
    { name: "phone", placeholder: "Phone" },
    { name: "address", placeholder: "Address" },
    { name: "productId", placeholder: "Product ID" },
    { name: "productModel", placeholder: "Product Model" },
    { name: "productIdentification", placeholder: "Product Identification" },
    { name: "trnNumber", placeholder: "TRN Number" },
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    productId: "",
    productModel: "",
    productIdentification: "",
    trnNumber: "",
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`/customer/list/${userInfo.shopId}`);
      const list = res.data.customers || [];
      setCustomers(list);
      setFiltered(list);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) fetchCustomers();
  }, [userInfo]);

  // Search filter
  useEffect(() => {
    if (!search.trim()) return setFiltered(customers);

    const s = search.toLowerCase();
    setFiltered(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          (c.productId || "").toLowerCase().includes(s)
      )
    );
  }, [search, customers]);

  // Add new customer modal
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      productId: "",
      productModel: "",
      productIdentification: "",
      trnNumber: "",
    });
    setModalOpen(true);
  };

  // Edit customer modal
  const openEditModal = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      productId: c.productId || "",
      productModel: c.productModel || "",
      productIdentification: c.productIdentification || "",
      trnNumber: c.trnNumber || "",
    });
    setModalOpen(true);
  };

  // Save customer
  const saveCustomer = async () => {
    try {
      if (editingId) {
        await axios.put(`/customer/${editingId}`, form);
      } else {
        await axios.post(`/customer/create`, {
          ...form,
          shopId: userInfo.shopId,
        });
      }

      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axios.delete(`/customer/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <div>

      {/* Header identical to EmployeesTab */}
      <div className="tab-header">
        <h3 className="section-title">Customer Management</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search customers..."
            className="customer-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />

          <button className="btn-add-new" onClick={openAddModal}>
            + Add New Customer
          </button>
        </div>
      </div>

      {/* CUSTOMER GRID - Uses data-grid & data-card styling */}
      <div className="data-grid1">
        {filtered.map((c) => (
          <div key={c._id} className="data-card">

            <div className="data-card-header">
              <h4>{c.name}</h4>
              <span className="data-card-role">Customer</span>
            </div>

            <div className="data-card-body">
              <p><strong>Email:</strong> {c.email}</p>
              <p><strong>Phone:</strong> {c.phone}</p>
              <p><strong>Address:</strong> {c.address}</p>

              <p><strong>TRN Number:</strong> {c.trnNumber}</p>
              <p><strong>Product ID:</strong> {c.productId}</p>
              <p><strong>Identification:</strong> {c.productIdentification}</p>
              <p><strong>Model:</strong> {c.productModel}</p>
            </div>

            <div className="data-card-footer">
              <button
                className="btn-card-action"
                onClick={() => openEditModal(c)}
              >
                Edit
              </button>

              <button
                className="btn-card-action btn-danger"
                onClick={() => deleteCustomer(c._id)}
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL (Same style as Employee modal) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">

            <div className="modal-header">
              <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-grid cols-2">
                {CUSTOMER_FIELDS.map(({ name, placeholder }) => (
                  <div className="form-group" key={name}>
                    <label>{placeholder}</label>
                    <input
                      type="text"
                      value={form[name]}
                      onChange={(e) =>
                        setForm({ ...form, [name]: e.target.value })
                      }
                    />
                  </div>
                ))}

              </div>

              <button className="btn-submit" onClick={saveCustomer}>
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}