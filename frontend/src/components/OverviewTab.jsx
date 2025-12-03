import React from 'react';
import axios from "../utils/axios.js"
import { useState,useEffect } from 'react';
import useAuth from '../context/context';

function OverviewTab() {

   const [empCount,setEmpCount]=useState(0)
    const[machineCount,setMchineCount]=useState(0)
    const[jobCount,setJobCount]=useState(0)
    const{userInfo}=useAuth()


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
 const getJobCount=async()=>{
    try {
      const res= await axios.get(`/shop/getAllJobs/${userInfo.shopId}`)
      console.log(res.data.allJobs.length)
      setJobCount(res.data.allJobs.length)
      
    } catch (error) {
      console.log(error)
    }
  }
  
  
  useEffect(()=>{
    if (userInfo?.shopId) {
    getEmployeeeCount();
    getMachinesCount();
    getJobCount();
  }
  },[userInfo?.shopId])



  return (
    <>
      <h3 className="section-title">System Overview</h3>
      <div className="overview-grid">
        <div className="overview-card blue-card">
          <h4 className="stat-header-h4"><img src="/graph.png" alt="Graph Icon" className="sidebar-icon"/> Job Statistics</h4>
          <div className="stat-row">
            <span>Total Jobs</span>
            <span className="stat-number">3</span>
          </div>
          <div className="stat-row">
            <span>Completed:</span>
            <span className="stat-number">1</span>
          </div>
          <div className="stat-row">
            <span>In Progress:</span>
            <span className="stat-number">1</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number">0</span>
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
            <span className="stat-number blue-text">5</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number orange-text">3</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default OverviewTab;