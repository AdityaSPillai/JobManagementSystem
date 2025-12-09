import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.jsx";
import "../styles/ConsoleTab.css";

export default function ConsoleTab() {
  const { userInfo } = useAuth();
  const [logs, setLogs] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const consoleRef = useRef(null);

  const fetchLogs = async () => {
    const res = await axios.get(`/shop/logs/${userInfo?.shopId}`);
    setLogs(res.data.logs || []);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="console-container">
      <h2 className="console-title">System Activity Log</h2>

      <div className="console-window" ref={consoleRef}>
        {logs.length === 0 ? (
          <div className="console-empty">No logs recorded.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="console-line">
              <span className="console-timestamp">
                [{formatDate(log.timestamp)}]
              </span>
              <span className="console-user">
                {log.name} <span className="console-role">({log.auth})</span>
              </span>
              <span className="console-action">→ {log.action}</span>
              <span
                className="console-data-link"
                onClick={() => setSelectedData(log.info)}
              >
                (Data)
              </span>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedData && (
        <div className="console-modal-overlay" onClick={() => setSelectedData(null)}>
          <div className="console-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Log Data</h3>
            <pre className="console-json">
              {JSON.stringify(selectedData, null, 2)}
            </pre>
            <button className="console-close-btn" onClick={() => setSelectedData(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}