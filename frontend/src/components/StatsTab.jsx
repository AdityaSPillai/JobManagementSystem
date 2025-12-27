import React, { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.jsx";

import {
  BarChart, Bar, PieChart, Pie, Tooltip, XAxis,
  YAxis, Legend, ResponsiveContainer, LineChart, Line,
  Cell
} from "recharts";

import "../styles/stats.css";

function StatsTab() {
  const { userInfo } = useAuth();
  const shopId = userInfo?.shopId;

  const [employees, setEmployees] = useState([]);
  const [machines, setMachines] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [machineCategories, setMachineCategories] = useState([]);
  const [consumables, setConsumables] = useState([]);

  const [loading, setLoading] = useState(true);

  // -------------------------
  // API FUNCTIONS
  // -------------------------
  const api = {
    employees: `/shop/getAllEmployees/${shopId}`,
    machines: `/shop/getAllMachines/${shopId}`,
    jobs: `/shop/getAllJobs/${shopId}`,
    customers: `/customer/list/${shopId}`,
    services: `/shop/allServices/${shopId}`,
    categories: `/shop/allCategories/${shopId}`,
    machineCategories: `/shop/allMachineCategory/${shopId}`,
    consumables: `/shop/allConsumables/${shopId}`,
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [
        empRes,
        machRes,
        jobRes,
        custRes,
        servRes,
        catRes,
        machCatRes,
        consumRes
      ] = await Promise.all([
        axios.get(api.employees),
        axios.get(api.machines),
        axios.get(api.jobs),
        axios.get(api.customers),
        axios.get(api.services),
        axios.get(api.categories),
        axios.get(api.machineCategories),
        axios.get(api.consumables),
      ]);

      setEmployees(empRes.data.users || []);
      setMachines(machRes.data.machines || []);
      setJobs(jobRes.data.allJobs || []);
      setCustomers(custRes.data.customers || custRes.data || []);
      setServices(servRes.data.services || []);
      setCategories(catRes.data.categories || []);
      setMachineCategories(machCatRes.data.machineCategory || []);
      setConsumables(consumRes.data.consumables || []);

    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchAllData();
  }, [shopId]);

  if (loading) return <p>Loading statistics...</p>;

  // -----------------------------------------------------
  // GRAPH DATA FORMATTING
  // -----------------------------------------------------

  const serviceNames = (services && services.length > 0)
    ? services.map(s => s.name)
    : Array.from(
      new Set(
        jobs.flatMap(job =>
          (job.jobItems || [])
            .map(item => item?.itemData?.job_type)
            .filter(name => typeof name === "string" && name.trim() !== "")
        )
      )
    );

  // 2) Build stats: how many job items per service name
  const jobsPerService = serviceNames.map(name => {
    let count = 0;

    jobs.forEach(job => {
      (job.jobItems || []).forEach(item => {
        const jt = item?.itemData?.job_type;
        if (
          typeof jt === "string" &&
          jt.trim().toLowerCase() === name.trim().toLowerCase()
        ) {
          count += 1;
        }
      });
    });

    return { name, value: count };
  });


  const employeesPerCategory = categories.map(c => ({
    name: c.name,
    value: employees.filter(e => e.specialization === c.name).length,
  }));

  const machinesPerCategory = machineCategories.map(m => ({
    name: m.name,
    value: machines.filter(mc => mc.type === m.name).length,
  }));

  console.log("Consumables:", consumables);

  const monthlyJobs = (() => {
    const map = {};
    jobs.forEach(job => {
      const d = new Date(job.createdAt);
      const key = `${d.getMonth() + 1}-${d.getFullYear()}`;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([month, count]) => ({
      month,
      count
    }));
  })();

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // -----------------------------------------------------
  // JSX
  // -----------------------------------------------------

  return (
    <div className="stats-wrapper">

      {/* SUMMARY CARDS */}
      <div className="stats-summary-row">
        <div className="summary-card">Employees: {employees.length}</div>
        <div className="summary-card">Machines: {machines.length}</div>
        <div className="summary-card">Jobs: {jobs.length}</div>
        <div className="summary-card">Customers: {customers.length}</div>
      </div>

      {/* JOBS PER SERVICE TYPE */}
      <div className="chart-card-wrapper">
        <div className="chart-card">
          <h3>Jobs Per Service Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobsPerService}>
              <XAxis dataKey="name" stroke="#111" />
              <YAxis stroke="#111" />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc" }} />
              <Bar dataKey="value">
                {jobsPerService.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* EMPLOYEES PER CATEGORY */}
        <div className="chart-card">
          <h3>Employees Per Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={employeesPerCategory}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label={({ name, value }) => `${name}: ${value}`}
                labelStyle={{ fill: "#111" }}
              >
                {employeesPerCategory.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* MACHINES PER CATEGORY */}
        <div className="chart-card">
          <h3>Machines Per Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={machinesPerCategory}>
              <XAxis dataKey="name" stroke="#111" />
              <YAxis stroke="#111" />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc" }} />
              <Bar dataKey="value">
                {machinesPerCategory.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MONTHLY JOB TREND */}
        <div className="chart-card">
          <h3>Monthly Jobs Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyJobs}>
              <XAxis dataKey="month" stroke="#111" />
              <YAxis stroke="#111" />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 5, stroke: "#1e3a8a", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CONSUMABLES TABLE */}
      <div className="table-card">
        <h3 className="heading3-consumables">Consumables</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit of Measure</th>
            </tr>
          </thead>
          <tbody>
            {consumables.length === 0 ? (
              <tr><td colSpan="3">No consumables found.</td></tr>
            ) : (
              consumables.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.quantity}</td>
                  <td>{c.unitOfMeasure}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default StatsTab;