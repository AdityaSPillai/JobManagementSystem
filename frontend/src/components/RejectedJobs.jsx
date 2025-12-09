import React, { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.jsx";
import "../styles/ConsumablesTab.css";

function RejectedJobs() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const getAllRejectedJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/reject/getAll/${userInfo.shopId}`);
      if (res.data.success) {
        setRejectedJobs(res.data.rejectedJobs || []);
      } else {
        setRejectedJobs([]);
      }
    } catch (error) {
      console.error("Error fetching Rejected jobs:", error);
      setRejectedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRejectedJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job permanently?")) return;

    try {
      console.log(`${id}`)
      const res = await axios.delete(`/reject/deleteJob/${id}`);
      if (res.data.success) {
        alert("Job deleted successfully");
        getAllRejectedJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) getAllRejectedJobs();
  }, [userInfo?.shopId]);

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Rejected Jobs Management</h3>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading rejected jobs...</p>
        </div>
      ) : rejectedJobs.length === 0 ? (
        <p className="error-text">No Rejected Jobs found.</p>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Job Card No</th>
                <th>Rejected By</th>
                <th>Reason</th>
                <th>Rejected At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rejectedJobs.map((rej) => (
                <tr key={rej._id}>
                  <td className="table-content">{rej.fullJobData?.jobCardNumber}</td>
                  <td className="table-content">{rej.rejectedBy}</td>
                  <td className="table-content">{rej.rejectionReason}</td>
                  <td className="table-content">{new Date(rej.rejectedAt).toLocaleString()}</td>

                  {/* DELETE BUTTON */}
                  <td>
                    <button
                      style={{
                        background: "#007bff",
                        color: "white",
                        padding: "6px 10px",
                        marginRight: "8px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedJob(rej.fullJobData)}
                    >
                      Open
                    </button>

                    <button
                      style={{
                        background: "red",
                        color: "white",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => deleteRejectedJob(rej._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ VIEW JOB POPUP */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>Rejected Job Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedJob(null)}>✕</button>
            </div>

            <div className="job-info-grid">
              <div><strong>Job Card:</strong> {selectedJob.jobCardNumber}</div>
              <div><strong>Customer:</strong> {selectedJob.formData.customer_name}</div>
              <div><strong>Vehicle No:</strong> {selectedJob.formData.vehicle_number}</div>
              <div><strong>Engine No:</strong> {selectedJob.formData.engine_number}</div>
              <div><strong>Model:</strong> {selectedJob.formData.vehicle_model}</div>
              <div><strong>Contact:</strong> {selectedJob.formData.contact_number}</div>
              <div><strong>Status:</strong> {selectedJob.status}</div>
              <div><strong>Total Estimation:</strong> ${selectedJob.totalEstimatedAmount}</div>
            </div>

            <div className="job-items-container">
              <strong>Job Tasks</strong>

              {selectedJob.jobItems.map((item, index) => (
                <div key={item._id} className="job-detail-item">
                  <p><strong>Task {index + 1}:</strong> {item.itemData.job_type}</p>
                  <p>Description: {item.itemData.description}</p>
                  <p>Priority: {item.itemData.priority}</p>
                  <p>Category: {item.category}</p>
                  <p>Man Hours: {item.estimatedManHours}</p>
                  <p>Estimated Price: ${item.estimatedPrice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RejectedJobs;
