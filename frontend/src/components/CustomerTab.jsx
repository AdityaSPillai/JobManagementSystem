import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import useAuth from "../context/context";
import "../styles/CustomerTab.css";

export default function CustomerTab() {
  const { userInfo } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [jobsModalOpen, setJobsModalOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);

  const CUSTOMER_FIELDS = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "address", label: "Address" },
    { name: "productId", label: "Product ID" },
    { name: "productModel", label: "Product Model" },
    { name: "productIdentification", label: "Serial Number" },
    { name: "trnNumber", label: "TRN Number" },
  ];

  const [form, setForm] = useState({
    name: "",
    customerIDNumber: "",
    email: "",
    phone: "",
    address: "",
    productId: "",
    productModel: "",
    productIdentification: "",
    trnNumber: "",
  });

  /* ================= FETCH ================= */

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`/customer/list/${userInfo.shopId}`);
      setCustomers(res.data.customers || []);
      setFiltered(res.data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const openCustomerJobs = async (customerIDNumber) => {
    try {
      const res = await axios.get(`/jobs/jobbycustomer/${customerIDNumber}`);
      setJobs(res.data.jobs || []);
      setJobsModalOpen(true);
    } catch (err) {
      alert("No jobs found for this customer");
    }
  };

  const [currency, setCurrency] = useState('$');

  const getCurrency = async () => {
    try {
      const res = await axios.get(`/shop/getCurrency/${userInfo?.shopId}`);
      if (res.data?.currency) {
        setCurrency(res.data.currency);
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) fetchCustomers(); getCurrency();
  }, [userInfo]);

  /* ================= SEARCH ================= */

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

  /* ================= CRUD ================= */

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      customerIDNumber: "",
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

  const openEditModal = (c) => {
    setEditingId(c._id);
    setForm({ ...c });
    setModalOpen(true);
  };

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

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await axios.delete(`/customer/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="customer-tab">
      <div className="tab-header">
        <h3 className="section-title">Customer Management</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="customer-search"
          />
          <button className="btn-add-new" onClick={openAddModal}>
            + Add Customer
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Customer ID</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Product ID</th>
              <th>Model</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c._id}>
                <td className="table-primary-text">{c.name}</td>
                <td>{c.customerIDNumber}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.productId}</td>
                <td>{c.productModel}</td>

                <td>
                  <div className="table-actions">
                    {c.customerIDNumber && (
                      <button
                        className="table-cta"
                        onClick={() => openCustomerJobs(c.customerIDNumber)}
                      >
                        Open
                      </button>
                    )}
                    <button
                      className="table-cta"
                      onClick={() => openEditModal(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-cta table-cta-danger"
                      onClick={() => deleteCustomer(c._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="modal-form">
              <div className="form-grid cols-2">
                {CUSTOMER_FIELDS.map((f) => (
                  <div key={f.name} className="form-group">
                    <label>{f.label}</label>
                    <input
                      value={form[f.name] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [f.name]: e.target.value })
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

      {/* ================= JOB LIST MODAL ================= */}
      {jobsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>Customer Jobs</h3>
              <button onClick={() => setJobsModalOpen(false)}>✕</button>
            </div>

            {jobs.map((job) => (
              <div
                key={job._id}
                className="job-card clickable"
                onClick={() => {
                  setSelectedJob(job);
                  setJobDetailsOpen(true);
                }}
              >
                <p><strong>Job No:</strong> {job.jobCardNumber}</p>
                <p><strong>Status:</strong> {job.status}</p>
                <p><strong>Amount:</strong> {currency}{job.totalEstimatedAmount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= JOB DETAILS MODAL ================= */}
      {jobDetailsOpen && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>Job Card Details</h3>
              <button onClick={() => setJobDetailsOpen(false)}>✕</button>
            </div>

            <div className="job-info-grid">
              <p><strong>Job Number:</strong> {selectedJob.jobCardNumber}</p>
              <p><strong>Status:</strong> {selectedJob.status}</p>
              <p><strong>Customer:</strong> {selectedJob.formData?.customer_name}</p>
              <p><strong>Contact:</strong> {selectedJob.formData?.contact_number}</p>
              <p><strong>Product ID:</strong> {selectedJob.formData?.vehicle_number}</p>
              <p><strong>Model:</strong> {selectedJob.formData?.vehicle_model}</p>
              <p><strong>Serial No:</strong> {selectedJob.formData?.engine_number}</p>
            </div>

            <hr />

            <h4 className="modal-header-h4">Job Tasks</h4>
            {selectedJob.jobItems.map((item, i) => (
              <div key={i} className="job-detail-item">
                <p><strong>Task {i + 1}:</strong> {item.itemData?.description}</p>
                <p>Category: {item.category}</p>
                <p>Priority: {item.itemData?.priority}</p>
                <p>Estimated Price: {currency}{item.estimatedPrice}</p>
              </div>
            ))}

            <hr />
            <h4 className="modal-header-h4">Total Estimated Amount: {currency}{selectedJob.totalEstimatedAmount}</h4>
          </div>
        </div>
      )}
    </div>
  );
}
