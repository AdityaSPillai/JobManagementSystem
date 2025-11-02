import React from 'react';
import axios from "../utils/axios.js"
import { useState,useEffect } from 'react';
import useAuth from '../context/context';

function OverviewTab() {

   const [empCount,setEmpCount]=useState(0)
  const[machineCount,setMchineCount]=useState(0)
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
  
  
  useEffect(()=>{
    if (userInfo?.shopId) {
    getEmployeeeCount();
    getMachinesCount();
  }
  },[userInfo?.shopId])



  return (
    <>
      <h3 className="section-title">System Overview</h3>
      <div className="overview-grid">
        <div className="overview-card blue-card">
          <h4>📊 Job Statistics</h4>
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
          <h4>👥 Workforce</h4>
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
          <h4>🔧 Equipment Status</h4>
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
          <h4>💰 Revenue Summary</h4>
          <div className="stat-row">
            <span>Completed Jobs:</span>
            <span className="stat-number green-text">$160.00</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number blue-text">$310.00</span>
          </div>
          <div className="stat-row">
            <span>Projected Total:</span>
            <span className="stat-number orange-text">$470.00</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default OverviewTab;