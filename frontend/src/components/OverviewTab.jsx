import React from 'react';
import axios from "../utils/axios.js"
import { useState,useEffect } from 'react';
import useAuth from '../context/context';

function OverviewTab() {
  const [empCount,setEmpCount]=useState(0)
  const[machineCount,setMchineCount]=useState(0)
  const[jobCount,setJobCount]=useState(0)
  const{userInfo}=useAuth()
  const [completedJobs, setCompletedJobs] = useState(0);
  const [pendingJobs, setPendingJobs] = useState(0);
  const [inProgressJobs, setInProgressJobs] = useState(0);
  const [rejectedJobs, setRejectedJobs] = useState(0);

  const getEmployeeeCount=async()=>{
    try {
      const allEmp= await axios.get(`/shop/getAllEmployees/${userInfo.shopId}`)
      console.log(allEmp.data.users.length)
      setEmpCount(allEmp.data.users.length)
      
    } catch (error) {
      console.log(error)
    }
  }


  const getMachinesCount=async()=>{
    try {
      const allMachines= await axios.get(`/shop/getAllMachines/${userInfo.shopId}`)
      console.log(allMachines.data.machines.length)
      setMchineCount(allMachines.data.machines.length)
      
    } catch (error) {
      console.log(error)
    }
  }
  const getJobCount = async () => {
    try {
      const res = await axios.get(`/shop/getAllJobs/${userInfo.shopId}`);
      const res1 = await axios.get(`/reject/getAll/${userInfo.shopId}`);
      const jobs = res.data.allJobs || [];
      const jobs1 = res1.data.rejectedJobs || [];

      setJobCount(jobs.length);

      // Count by job status
      const completed = jobs.filter(job => job.status === "completed").length;
      const pending = jobs.filter(job => job.status != "completed").length;
      const inProgress = jobs.filter(job => job.status === "in-progress").length;
      const rejectedJobs = jobs1.length;

      setCompletedJobs(completed);
      setPendingJobs(pending);
      setInProgressJobs(inProgress);
      setRejectedJobs(rejectedJobs);

    } catch (error) {
      console.log(error);
    }
  };
  
  
  useEffect(()=>{
    if (userInfo?.shopId) {
    getEmployeeeCount();
    getMachinesCount();
    getJobCount();
  }
  },[userInfo?.shopId])



  return (
    <>
      <div className="dashboard-banner">
        <div className="banner-top-row">
          <div className="banner-content">
            <h2>Owner Dashboard</h2>
            <p>Manage jobs, assign employees, and track progress</p>
          </div>
          {!userInfo?.shopId &&<button className="btn-create-shop" onClick={() => setIsShopModalOpen(true)}>
            + Create New Shop
          </button> }
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-label">All Employees</span>
            <span className="stat-value">{empCount}</span>
            <span className="stat-icon"><img src="/employee.png" alt="Employee Icon" className="stat-icon"/></span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available Machines</span>
            <span className="stat-value">{machineCount}</span>
            <span className="stat-icon"><img src="/machinecategory.png" alt="Machine Icon" className="stat-icon" /></span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Jobs</span>
            <span className="stat-value">{jobCount}</span>
            <span className="stat-icon"><img src="/graph.png" alt="Graph Icon" className="stat-icon" /></span>
          </div>
        </div>
      </div>
      <h3 className="section-title">System Overview</h3>
      <div className="overview-grid">
        <div className="overview-card blue-card">
          <h4 className="stat-header-h4"><img src="/graph.png" alt="Graph Icon" className="sidebar-icon"/> Job Statistics</h4>
          <div className="stat-row">
            <span>Total Jobs</span>
            <span className="stat-number">{jobCount}</span>
          </div>
          <div className="stat-row">
            <span>Completed:</span>
            <span className="stat-number">{completedJobs}</span>
          </div>
          <div className="stat-row">
            <span>In Progress:</span>
            <span className="stat-number">{inProgressJobs}</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number">{pendingJobs}</span>
          </div>
        </div>

        <div className="overview-card green-card">
          <h4 className="stat-header-h4"><img src="/employee.png" alt="Employee Icon" className="sidebar-icon"/> Workforce</h4>
          <div className="stat-row">
            <span>Total Employees:</span>
            <span className="stat-number">{empCount}</span>
          </div>
          <div className="stat-row">
            <span>Active:</span>
            <span className="stat-number">{empCount}</span>
          </div>
          <div className="stat-row">
            <span>Inactive:</span>
            <span className="stat-number">0</span>
          </div>
        </div>

        <div className="overview-card purple-card">
          <h4 className="stat-header-h4"><img src="/machine.png" alt="Machine Icon" className="sidebar-icon"/> Equipment Status</h4>
          <div className="stat-row">
            <span>Total Machines:</span>
            <span className="stat-number">{machineCount}</span>
          </div>
          <div className="stat-row">
            <span>Available:</span>
            <span className="stat-number">{machineCount}</span>
          </div>
          <div className="stat-row">
            <span>In Use:</span>
            <span className="stat-number">0</span>
          </div>
          <div className="stat-row">
            <span>Maintenance:</span>
            <span className="stat-number">0</span>
          </div>
        </div>

        <div className="overview-card peach-card">
          <h4 className="stat-header-h4"><img src="/job.png" alt="Job Icon" className="sidebar-icon"/> Job Types</h4>
          <div className="stat-row">
            <span>Total Job Types Created:</span>
            <span className="stat-number green-text">{jobCount}</span>
          </div>
          <div className="stat-row">
            <span>Completed:</span>
            <span className="stat-number blue-text">{completedJobs}</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number orange-text">{pendingJobs}</span>
          </div>
          <div className="stat-row">
            <span>Rejected:</span>
            <span className="stat-number orange-text">{rejectedJobs}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default OverviewTab;