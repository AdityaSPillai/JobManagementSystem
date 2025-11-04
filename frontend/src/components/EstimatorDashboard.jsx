import { useState, useEffect } from 'react';
import Header from './Header';
import playIcon from '../assets/play.svg';
import pauseIcon from '../assets/pause.svg';
import useAuth from '../context/context.js';
import tickIcon from '../assets/tick.svg';
import axios from '../utils/axios.js'

// --- NEW ICON IMPORTS ---
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
// --- END NEW ICON IMPORTS ---

import '../styles/EstimatorDashboard.css';

function EstimatorDashboard({ onLoginClick }) {
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]);
  const { userInfo, isAuthenticated, logout } = useAuth();
  const[employees,setEmployees]=useState([]);
  const shopId = userInfo?.shopId;

  // Employee list
  // const employees = [
  //   { id: 'EMP001', name: 'John Doe' },
  //   { id: 'EMP002', name: 'Jane Smith' },
  //   { id: 'EMP003', name: 'Mike Johnson' },
  //   { id: 'EMP004', name: 'Sarah Williams' },
  //   { id: 'EMP005', name: 'David Brown' }
  // ];

  const getAllServices = async () => {
    if (!shopId) return console.log("No shopId found");
    try {
      const res = await axios.get(`/shop/allServices/${userInfo?.shopId}`);
      if (res.data?.shop?.services?.length > 0) {
        setServices(res.data.shop.services);
      } else {
        console.log("No services found for this shop");
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const getAllMachines = async () => {
    try {
      const res = await axios.get(`/shop/getAllMachines/${userInfo.shopId}`);
      if (res.data?.machines?.length > 0) {
        setMachines(res.data.machines);
      } else {
        console.log("No machines found for this shop");
        setMachines([]);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };


const getAllWorlers=async()=>{
  try {
    const res= await axios.get(`/shop/getAllWorkers/${userInfo?.shopId}`);
    if(res.data?.users?.length>0){
      setEmployees(res.data.users)
    }
    
  } catch (error) {
      console.error("Error fetching Workers:", error);
    }
  };




  useEffect(() => {
    if (!userInfo) return;
    if (!userInfo.shopId) {
      console.log("⚠️ User info loaded but no shopId found");
      return;
    }

    getAllServices();
    getAllMachines();
    getAllJobs();
    getAllWorlers();
  }, [userInfo]);


  // Jobs array
  const [jobs, setJobs] = useState([])

  // Form state following nested structure pattern
  const [formData, setFormData] = useState({
    templateId: '68f50077a6d75c0ab83cd019',
    isVerifiedByUser: true,
    workVerified:null,
    shopId: userInfo?.shopId || '',
    formData: {
      customer_name: '',
      vehicle_number: '',
      engine_number: '',
      vehicle_model: '',
      contact_number: '',
    },
    jobItems: [
      {
        itemData: {
          job_type: '',
          description: '',
          priority: '',
        },
        estimatedPrice: 0,
        machine: {
          machineRequired: {
            _id:null,
            name:''
          },
          startTime: null,
          endTime: null,
          actualDuration: null,
        },
        worker: {
          workerAssigned: null,
          startTime: null,
          endTime: null,
          actualDuration: null,
        },
        material: {
          materialsRequired: [],
          estimatedPrice: 0,
        },
        estimatedPrice:null,
        id:null
      },
    ],
    machines: [],
    consumables: []
  });

  useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    }
    console.log('selected job =',jobs[2]?.items[0]?.jobType)
    

  }, [jobs, selectedJob]);



const getAllJobs = async () => {
  try {
    const res = await axios.get(`/shop/getAllJobs/${userInfo?.shopId}`);
    if (res.data?.allJobs?.length > 0) {
      const transformedJobs = res.data.allJobs.map(job => ({
        id: job._id,
        jobCardNumber: job.jobCardNumber,
        customer_name: job.formData?.customer_name || '',
        vehicle_number: job.formData?.vehicle_number || '',
        engine_number: job.formData?.engine_number || '',
        vehicle_model: job.formData?.vehicle_model || '',
        contact_number: job.formData?.contact_number || '',
        date: new Date(job.createdAt || Date.now()).toLocaleString('en-US', {
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit'
        }),
        status: job.status || 'Not Assigned',
        totalEstimatedAmount: job.totalEstimatedAmount || 0,
        // Transform job items with all their related data
        items: job.jobItems?.map(item => ({
          itemId: item._id,
          jobType: item.itemData?.job_type || '',
          description: item.itemData?.description || '',
          priority: item.itemData?.priority || '',
          estimatedPrice: item.estimatedPrice || 0,
          itemStatus: item.itemStatus || 'stopped',
          // Machine details
          machine: {
            machineRequired: item.machine?.machineRequired?.name || item.machine?.machineRequired || null,
            machineId: item.machine?.machineRequired?._id || null,
            startTime: item.machine?.startTime || null,
            endTime: item.machine?.endTime || null,
            actualDuration: item.machine?.actualDuration || null
          },
          // Worker details
          worker: {
            workerAssigned: item.worker?.workerAssigned || null,
            startTime: item.worker?.startTime || null,
            endTime: item.worker?.endTime || null,
            actualDuration: item.worker?.actualDuration || null
          },
          // Material/Consumables details
          materials: {
            materialsRequired: item.material?.materialsRequired || [],
            estimatedPrice: item.material?.estimatedPrice || 0
          }
        })) || []
      }));

      // Use transformedJobs here
      setJobs(transformedJobs); // or whatever you need to do with it
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
};













  // Handle employee selection
const handleEmployeeSelect = async (jobId, itemIndex, employeeId) => {
  console.log("Assigning worker:", employeeId, jobId, itemIndex);
  
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  
  const itemId = job.items[itemIndex].itemId;
  console.log( "Assigning worker:", employeeId,jobId,itemId);
  
  // Check if any task is running
  const hasRunningTask = job.items.some(item => item.itemStatus === 'running');
  if (hasRunningTask) {
    alert('Cannot change assigned employee while a job task is running.');
    return;
  }

  try {

    if(!employeeId||!jobId||!itemId)
    {
      console.log(" all ids not recieved")
    }
    // Call your API
    const response = await axios.put(
      `/jobs/assign-worker/${employeeId}/${jobId}/${itemId}`
    );
    
    if (response.data.success) {
      // Update local state
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          const newItems = [...job.items];
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            worker: {
              ...newItems[itemIndex].worker,
              workerAssigned: employeeId
            }
          };
          
          const employee = employees.find(e => e._id === employeeId);
          return {
            ...job,
            items: newItems,
            assignedEmployee: employee,
            status: employee ? 'Assigned' : 'Not Assigned'
          };
        }
        return job;
      }));
      
      alert('Worker assigned successfully!');
    }
  } catch (error) {
    console.error('Error assigning worker:', error,error.message);
    alert('Failed to assign worker. Please try again.');
  }
};

  // --- SIMPLIFIED BUTTON HANDLERS ---
// --- SIMPLIFIED BUTTON HANDLERS ---
const handleStartItemTimer = async (jobId, itemIndex, workerID) => {
  console.log(`API CALL: Start timer for job ${jobId}, User ${workerID}`);

  try {
    const response = await axios.put(`/jobs/start-worker-timer/${jobId}/${workerID}`);
    
    if (!response.data.success) {
      console.log('Error occurred');
      alert('Failed to start timer');
      return;
    }
    
    console.log('Started successfully');
    
    // Update local state
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        newItems[itemIndex].itemStatus = 'running';
        
        // Check if any task is running to update job status
        const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
        
        return { 
          ...job, 
          items: newItems, 
          status: hasRunningTask ? 'In Progress' : job.status 
        };
      }
      return job;
    }));
    
  } catch (error) {
    console.log('Error starting timer:', error);
    alert('Failed to start timer');
  }
};

const handlePauseItemTimer = async (jobId, itemIndex, workerID) => {
  console.log(`API CALL: Pause timer for job ${jobId}, item ${itemIndex}`);
  
  try {
    const response = await axios.put(`/jobs/pause-worker-timer/${jobId}/${workerID}`);
    
    if (!response.data.success) {
      console.log('Error occurred');
      alert('Failed to pause timer');
      return;
    }
    
    console.log('Paused successfully');
    
    // Update local state
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        newItems[itemIndex].itemStatus = 'paused';
        
        const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
        
        return { 
          ...job, 
          items: newItems, 
          status: hasRunningTask ? 'In Progress' : 'Assigned' 
        };
      }
      return job;
    }));
    
  } catch (error) {
    console.log('Error pausing timer:', error);
    alert('Failed to pause timer');
  }
};

const handleEndItemTimer = async (jobId, itemIndex, workerID) => {
  console.log(`API CALL: End timer for job ${jobId}, User ${workerID}`);

  try {
    const response = await axios.put(`/jobs/end-worker-timer/${jobId}/${workerID}`);
    
    if (!response.data.success) {
      console.log('Error occurred');
      alert('Failed to end timer');
      return;
    }
    
    console.log('Ended successfully');
    
    // Update local state
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        newItems[itemIndex].itemStatus = 'completed';
        
        // Check if all tasks are completed
        const allCompleted = newItems.every(item => item.itemStatus === 'completed');
        const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
        
        return { 
          ...job, 
          items: newItems, 
          status: allCompleted ? 'Completed' : (hasRunningTask ? 'In Progress' : 'Assigned') 
        };
      }
      return job;
    }));
    
  } catch (error) {
    console.log('Error ending timer:', error);
    alert('Failed to end timer');
  }
};

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job =>
  job.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  job.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  job.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase())
);


  // Generate new job ID
  const generateJobId = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const jobNumber = String(jobs.length + 1).padStart(4, '0');
    return `JOB-${dateStr}-${jobNumber}`;
  };


  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      }
    }));
  };

  const updateJobItemField = (itemIndex, key, value, subObject = null) => {
    setFormData(prev => {
      const newJobItems = [...prev.jobItems];
      let itemToUpdate = { ...newJobItems[itemIndex] };

      if (subObject) {
        itemToUpdate = {
          ...itemToUpdate,
          [subObject]: {
            ...itemToUpdate[subObject],
            [key]: value
          }
        };
      } else {
        itemToUpdate = {
          ...itemToUpdate,
          [key]: key === 'estimatedPrice' ? parseFloat(value) || 0 : value
        };
      }

      newJobItems[itemIndex] = itemToUpdate;
      return { ...prev, jobItems: newJobItems };
    });
  };

  // Job Item handler - routes to appropriate nested object
  const handleJobItemChange = (index, field, value) => {
    if (field === 'job_type' || field === 'description' || field === 'priority') {
      updateJobItemField(index, field, value, 'itemData');
    } else if (field === 'estimatedPrice') {
      updateJobItemField(index, field, value);
    }
  };

  // Add new job item with full nested structure
  const addJobItem = () => {
    setFormData(prev => ({
      ...prev,
      jobItems: [
        ...prev.jobItems,
        {
          itemData: {
            job_type: '',
            description: '',
            priority: '',
          },
          estimatedPrice: 0,
          machine: {
            machineRequired: null,
            startTime: null,
            endTime: null,
            actualDuration: null,
          },
          worker: {
            workerAssigned: null,
            startTime: null,
            endTime: null,
            actualDuration: null,
          },
          material: {
            materialsRequired: [],
            estimatedPrice: 0,
          },
        },
      ]
    }));
  };



  // Remove job item
  const removeJobItem = (index) => {
    if (formData.jobItems.length > 1) {
      const newItems = formData.jobItems.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, jobItems: newItems }));
    }
  };





const handleMachineRequiredChange = (itemIndex, machineId) => {
  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    newJobItems[itemIndex] = {
      ...newJobItems[itemIndex],
      machine: {
        ...newJobItems[itemIndex].machine,
        machineRequired: machineId || null
      }
    };
    return { ...prev, jobItems: newJobItems };
  });
};

// ADD THIS NEW HANDLER for materials
const handleMaterialsChange = (itemIndex, materials, estimatedPrice) => {
  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    newJobItems[itemIndex] = {
      ...newJobItems[itemIndex],
      material: {
        materialsRequired: materials,
        estimatedPrice: parseFloat(estimatedPrice) || 0
      }
    };
    return { ...prev, jobItems: newJobItems };
  });
};

// ADD THIS NEW HANDLER for adding a material to a specific job item
const handleAddMaterialToJobItem = (itemIndex, materialName) => {
  if (!materialName.trim()) return;
  
  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    const currentMaterials = newJobItems[itemIndex].material.materialsRequired || [];
    
    newJobItems[itemIndex] = {
      ...newJobItems[itemIndex],
      material: {
        ...newJobItems[itemIndex].material,
        materialsRequired: [...currentMaterials, materialName.trim()]
      }
    };
    return { ...prev, jobItems: newJobItems };
  });
};

// ADD THIS NEW HANDLER for removing a material from a specific job item
const handleRemoveMaterialFromJobItem = (itemIndex, materialIndex) => {
  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    const currentMaterials = [...newJobItems[itemIndex].material.materialsRequired];
    currentMaterials.splice(materialIndex, 1);
    
    newJobItems[itemIndex] = {
      ...newJobItems[itemIndex],
      material: {
        ...newJobItems[itemIndex].material,
        materialsRequired: currentMaterials
      }
    };
    return { ...prev, jobItems: newJobItems };
  });
};












  // Machine Handlers (flat structure maintained)
  const handleMachineChange = (index, field, value) => {
    const newMachines = [...formData.machines];
    newMachines[index][field] = field === 'estimatedPrice' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, machines: newMachines }));
  };

  const addMachine = () => {
    setFormData(prev => ({
      ...prev,
      machines: [...prev.machines, { machineType: '', description: '', estimatedPrice: 0 }]
    }));
  };

  const removeMachine = (index) => {
    const newMachines = formData.machines.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, machines: newMachines }));
  };

  // Consumable Handlers (flat structure maintained)
  const handleConsumableChange = (index, field, value) => {
    const newConsumables = [...formData.consumables];
    newConsumables[index][field] = (field === 'quantity' || field === 'perPiecePrice') ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, consumables: newConsumables }));
  };

  const addConsumable = () => {
    setFormData(prev => ({
      ...prev,
      consumables: [...prev.consumables, { name: '', quantity: 1, perPiecePrice: 0 }]
    }));
  };

  const removeConsumable = (index) => {
    const newConsumables = formData.consumables.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, consumables: newConsumables }));
  };

  // Calculate total estimated price (using nested jobItems structure)
  const calculateFormTotal = () => {
    const itemsTotal = formData.jobItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const machinesTotal = formData.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const consumablesTotal = formData.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0);
    const materialsTotal = formData.jobItems.reduce((sum, item) => sum + (item.material.estimatedPrice || 0), 0); 

    return itemsTotal + machinesTotal + consumablesTotal+materialsTotal;
  };

  // Calculate total for a displayed job
 const calculateJobTotal = (job) => {
  if (!job || !job.items) return 0;
  
  // Sum up all item prices
  const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  
  // Sum up all materials prices from items
  const materialsTotal = job.items.reduce((sum, item) => 
    sum + (item.materials?.estimatedPrice || 0), 0
  );
  
  return itemsTotal + materialsTotal;
};

  // UPDATED: Save job with nested structure
const handleSaveJob = async () => {
  const { formData: customerData, jobItems } = formData;

  // Validation
  if (!customerData.customer_name || !customerData.vehicle_number || !customerData.contact_number) {
    alert('Please fill in required fields: Customer Name, Vehicle Number, and Contact Number');
    return;
  }

  const hasInvalidItems = jobItems.some(item => 
    !item.itemData.description || item.estimatedPrice <= 0
  );
  if (hasInvalidItems) {
    alert('Please fill in all job item descriptions and a valid estimated price');
    return;
  }

  // Transform to backend structure
  const backendPayload = {
    templateId: formData.templateId,
    isVerifiedByUser: formData.isVerifiedByUser,
    shopId: userInfo?.shopId,
    formData: {
      customer_name: customerData.customer_name,
      vehicle_number: customerData.vehicle_number,
      engine_number: customerData.engine_number || '',
      vehicle_model: customerData.vehicle_model || '',
      contact_number: customerData.contact_number
    },
    jobItems: jobItems.map(item => ({
      itemData: {
        job_type: item.itemData.job_type || '',
        description: item.itemData.description,
        priority: item.itemData.priority || 'Medium'
      },
      estimatedPrice: item.estimatedPrice,
      machine: {
        machineRequired: item.machine.machineRequired || null,
        startTime: item.machine.startTime || null,
        endTime: item.machine.endTime || null,
        actualDuration: item.machine.actualDuration || null
      },
      worker: {
        workerAssigned: item.worker.workerAssigned || null,
        startTime: item.worker.startTime || null,
        endTime: item.worker.endTime || null,
        actualDuration: item.worker.actualDuration || null
      },
      material: {
        materialsRequired: item.material.materialsRequired || [],
        estimatedPrice: item.material.estimatedPrice || 0
      }
    }))
  };

  console.log('Backend Payload:', JSON.stringify(backendPayload, null, 2));

  try {
    // Make API call
    const response = await axios.post('/jobs/new-job', backendPayload);
    
    if (response.data) {


      const newJob = {
        id: response.data.jobId || generateJobId(),
        customer_name: customerData.customer_name,
        vehicle_number: customerData.vehicle_number,
        engine_number: customerData.engine_number,
        vehicle_model: customerData.vehicle_model,
        contact_number: customerData.contact_number,
        date: new Date().toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', 
          hour: '2-digit', minute: '2-digit'
        }),
        status: 'Not Assigned',
        assignedEmployee: null,
        items: jobItems.map(item => ({
          jobType: item.itemData.job_type || '',
          description: item.itemData.description,
          estimatedPrice: item.estimatedPrice,
          itemStatus: 'stopped'
        })),
        machines: [], // Legacy support if needed
        consumables: [] // Legacy support if needed
      };

      await getAllJobs();
      setJobs(prev => [newJob, ...prev]);
      
      // Reset form
      setFormData({
        templateId: '68f50077a6d75c0ab83cd019',
        isVerifiedByUser: true,
        shopId: userInfo?.shopId || '',
        formData: {
          customer_name: '',
          vehicle_number: '',
          engine_number: '',
          vehicle_model: '',
          contact_number: '',
        },
        jobItems: [
          {
            itemData: {
              job_type: '',
              description: '',
              priority: '',
            },
            estimatedPrice: 0,
            machine: {
              machineRequired: null,
              startTime: null,
              endTime: null,
              actualDuration: null,
            },
            worker: {
              workerAssigned: null,
              startTime: null,
              endTime: null,
              actualDuration: null,
            },
            material: {
              materialsRequired: [],
              estimatedPrice: 0,
            },
          },
        ]
      });

      setShowCreateJob(false);
      alert('Job card created successfully!');
    }
  } catch (error) {
    console.error('Error creating job:', error);
    alert('Failed to create job card. Please try again.');
  }
};

  // UPDATED: Handle job type selection with nested structure
const handleJobTypeSelect = (index, serviceId) => {
  const selectedService = services.find(service => service._id === serviceId);

  setFormData(prev => {
    const updatedJobItems = [...prev.jobItems];

    updatedJobItems[index] = {
      ...updatedJobItems[index],
      itemData: {
        ...updatedJobItems[index].itemData,
        job_type: selectedService?.name || '', // ✅ Store NAME for display
        job_type_id: serviceId, // ✅ Store ID for backend reference
        description: selectedService?.description || ''
      },
      estimatedPrice: selectedService?.price || 0
    };

    return { ...prev, jobItems: updatedJobItems };
  });
};


  return (
    <div className="estimator-dashboard">
      <Header 
        userRole={isAuthenticated ? userInfo?.role : 'Estimator'}
        onLogin={onLoginClick}
        onLogout={logout}
        showLogin={!isAuthenticated}
      />
      <div className="dashboard-content">
        <div className="dashboard-title-section">
          <div className="dashboard-wrapper">
            <div className="dashboard-title">
              <h2>Estimator Dashboard</h2>
              <p>Create job cards and track order history</p>
            </div>
            <div className="action-buttons">
              <button className="btn-action" onClick={() => {
                setShowOrderHistory(!showOrderHistory);
                setShowCreateJob(false);
                setShowJobDetails(false);
              }}>
                <img src={clipboardIcon} alt="History" className="btn-icon-left" /> View Order History
              </button>
              <button className="btn-action-primary" onClick={() => {
                setShowCreateJob(!showCreateJob);
                setShowOrderHistory(false);
                setShowJobDetails(false);
              }}>
                + Add Job Card
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="job-list-section">
            <div className="section-header">
              <h3><img src={clipboardIcon} alt="Jobs" className="inline-icon" /> Job Cards</h3>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by job number, customer or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {filteredJobs.length === 0 ? (
              <div className="no-jobs-found">
                <p>No jobs found matching your search</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="job-card"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowJobDetails(true);
                    setShowCreateJob(false);
                    setShowOrderHistory(false);
                  }}
                >
                  <div className="job-header">
                    <span className="job-number">{job.id}</span>
                    <span className={`status-badge ${
                      job.status === 'In Progress' ? 'status-progress' : 
                      job.status === 'Completed' ? 'status-completed' :
                      job.status === 'Assigned' ? 'status-assigned-active' :
                      'status-assigned'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="job-owner">{job.customer_name}</p>
                  <div className="job-details">
                    <span><img src={userIcon} alt="Vehicle" className="inline-icon" /> {job.vehicle_number}</span>
                    <span><img src={calendarIcon} alt="Date" className="inline-icon" /> {job.date}</span>
                  </div>
                  {job.assignedEmployee && (
                    <p className="job-employee"><img src={workerIcon} alt="Worker" className="inline-icon" /> {job.assignedEmployee.name}</p>
                  )}
                  <p className="job-items">{job.items.length} tasks</p>
                </div>
              ))
            )}
          </div>

          <div className="details-section">
            {!showJobDetails && !showCreateJob && !showOrderHistory && (
              <div className="no-selection">
                <div className="no-selection-icon">
                  <img src={clipboardIcon} alt="No selection" />
                </div>
                <p>No Selection</p>
                <p className="no-selection-hint">Click on a job card from the list to view its details here</p>
              </div>
            )}

            {showJobDetails && selectedJob && (
              <div className="job-details-view">
                <div className="form-header">
                  <h3><img src={clipboardIcon} alt="Details" className="inline-icon" /> Job Details</h3>
                  <button className="close-btn" onClick={() => {
                    setShowJobDetails(false);
                    setSelectedJob(null);
                  }}>✕</button>
                </div>
                <div className="job-detail-content">
                  {/* --- CUSTOMER INFO --- */}
                  <div className="job-info-grid">
                    <div><strong>Job Number:</strong> <span>{selectedJob.id}</span></div>
                    <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div>
                    <div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div>
                    <div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div>
                    <div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div>
                    <div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div>
                    <div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                    <div>
                      <strong>Status:</strong>
                      <span className={`status-badge ${
                        selectedJob.status === 'In Progress' ? 'status-progress' : 
                        selectedJob.status === 'Completed' ? 'status-completed' :
                        selectedJob.status === 'Assigned' ? 'status-assigned-active' :
                        'status-assigned'
                      }`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    
                  </div>
                  
                  {/* --- JOB TASKS --- */}
                  <div className="job-items-container">
                    <strong className="job-items-title">Job Tasks:</strong>
                   {selectedJob.items.map((item, index) => (
                      
                      <div key={index}> 
                        <div className="job-detail-item">
                          <div className="item-header-row">
                            <div className="item-info">
                              <div className="item-title">
                                <strong>Job #{index + 1}</strong>
                                {item.jobType && <span className="item-type">({item.jobType})</span>}
                              </div>
                              <div className="item-description">{item.description}</div>
                              <div className="item-price">${item.estimatedPrice.toFixed(2)}</div>
                            </div>
                            {item.worker.workerAssigned && (
                              <div className="item-timer-section">
                                <div className="item-timer-controls">
                                  {(item.itemStatus === 'stopped' || item.itemStatus === 'paused') && (
                                    <button 
                                      title={item.itemStatus === 'paused' ? 'Resume' : 'Start'} 
                                      className="btn-timer-small btn-start" 
                                      onClick={() => handleStartItemTimer(selectedJob.id, index, item.worker.workerAssigned)}
                                    >
                                      <img src={playIcon} alt={item.itemStatus === 'paused' ? 'Resume' : 'Start'} className="btn-icon" />
                                    </button>
                                  )}
                                  {item.itemStatus === 'running' && (
                                    <button 
                                      title="Pause" 
                                      className="btn-timer-small btn-pause" 
                                      onClick={() => handlePauseItemTimer(selectedJob.id, index, item.worker.workerAssigned)}
                                    >
                                      <img src={pauseIcon} alt="Pause" className="btn-icon" />
                                    </button>
                                  )}
                                  {item.itemStatus !== 'completed' && (
                                    <button 
                                      title="End" 
                                      className="btn-timer-small btn-end" 
                                      onClick={() => handleEndItemTimer(selectedJob.id, index, item.worker.workerAssigned)}
                                    >
                                      <img src={tickIcon} alt="End" className="btn-icon" />
                                    </button>
                                  )}
                                  {item.itemStatus === 'completed' && (
                                    <div className="completed-badge-small">
                                      <img src={tickIcon} alt="Completed" className="btn-icon" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="full-width">
                            <strong>Assign Employee for this task:</strong>
                            <select 
                              className="employee-select"
                              value={item.worker.workerAssigned || ''}
                              onChange={(e) => {
                                const selectedEmployeeId = e.target.value;
                                if (selectedEmployeeId) {
                                  handleEmployeeSelect(selectedJob.id, index, selectedEmployeeId);
                                }
                              }}
                              disabled={selectedJob.status === 'Completed' || item.itemStatus === 'running'}
                            >
                              <option value="">Select Employee</option>
                              {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                  {emp.name} ({emp._id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Machine section */}
                        {item.machine.machineRequired && (
                          <div className="job-items-container">
                            <strong className="job-items-title">Machine Used:</strong>
                            <div className="full-width">
                              <p className='machiene-name'><strong>Machine:</strong> {item.machine.machineRequired}</p>
                            </div>
                          </div>
                        )}

                        {/* Materials section */}
                        {item.materials.materialsRequired.length > 0 && (
                          <div className="job-items-container">
                            <strong className="job-items-title">Consumables Used:</strong>
                            <div className="full-width">
                              <strong>Materials:</strong> {item.materials.materialsRequired.join(', ')}
                              <span> (₹{item.materials.estimatedPrice})</span>
                            </div>
                          </div>
                        )}
                      </div> 
                    ))}
                  </div>


                


                    


                  {/* --- TOTAL --- */}
                  <div className="job-detail-total">
                    <strong className="total-label">Total Estimated Amount:</strong>
                    <strong className="total-amount">
                      ${calculateJobTotal(selectedJob).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* --- CREATE JOB FORM --- */}
            {showCreateJob && (
              <div className="create-job-form">
                <div className="form-header">
                  <h3>📝 Create New Job Card</h3>
                  <button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button>
                </div>
                <p className="form-subtitle">Fill in the details to create a new job order</p>

                {/* --- Customer Fields --- */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input type="text" placeholder="Enter customer's full name" value={formData.formData.customer_name} onChange={(e) => handleFormChange('customer_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input type="tel" placeholder="555-123-4567" value={formData.formData.contact_number} onChange={(e) => handleFormChange('contact_number', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Number *</label>
                    <input type="text" placeholder="ABC-123" value={formData.formData.vehicle_number} onChange={(e) => handleFormChange('vehicle_number', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Model</label>
                    <input type="text" placeholder="e.g., Toyota Camry 2018" value={formData.formData.vehicle_model} onChange={(e) => handleFormChange('vehicle_model', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Engine Number</label>
                  <input type="text" placeholder="Enter engine identification number" value={formData.formData.engine_number} onChange={(e) => handleFormChange('engine_number', e.target.value)} />
                </div>
      <div className="job-items-section">
  <div className="section-title">
    <h4>Job Tasks</h4>
    <button className="btn-add-job" onClick={addJobItem}>+ Add Task</button>
  </div>
  {formData.jobItems.map((item, index) => (
    <div key={index} className="job-item-card">
      <hr className="item-divider" />
      <div className="job-item-header">
        <h5>Task #{index + 1}</h5>
        <button 
          className="btn-remove" 
          onClick={() => removeJobItem(index)} 
          disabled={formData.jobItems.length === 1}
          type="button"
        >
          🗑
        </button>
      </div>

      {/* Job Type and Description */}
      <div className="form-row">
       <div className="form-group">
        <label>Job Type *</label>
          <select 
            value={item.itemData.job_type_id || ''} 
            onChange={(e) => handleJobTypeSelect(index, e.target.value)}
          >
            <option value="">--Select job--</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} 
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Estimated Price (₹) *</label>
          <input 
            type="number" 
            placeholder="0" 
            value={item.estimatedPrice || ''} 
            onChange={(e) => handleJobItemChange(index, 'estimatedPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row1">
        <div className="form-group">
          <label>Description *</label>
          <input 
            type="text" 
            placeholder="Describe this job" 
            value={item.itemData.description} 
            onChange={(e) => handleJobItemChange(index, 'description', e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select 
            value={item.itemData.priority || ''} 
            onChange={(e) => handleJobItemChange(index, 'priority', e.target.value)}
          >
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>


      {/* Machine Required */}
      <div className="form-group">
        <label>Machine Required (Optional)</label>
        <select 
          value={item.machine.machineRequired || ''} 
          onChange={(e) => handleMachineRequiredChange(index, e.target.value)}
        >
          <option value="">--No Machine Required--</option>
          {machines.map((machine) => (
            <option key={machine._id} value={machine._id}>
              {machine.name}
            </option>
          ))}
        </select>
      </div>

      {/* Materials Required */}
      <div className='form-row1'>
        <div className="form-group">
          <label>Materials Required (Optional)</label>
          <div className="materials-list">
            {item.material.materialsRequired.map((material, matIndex) => (
              <div key={matIndex} className="material-tag">
                <span className='meterial-name' >{material}</span>
                <button 
                  type="button"
                  onClick={() => handleRemoveMaterialFromJobItem(index, matIndex)}
                  className="material-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="material-input-row">
            <input 
              type="text" 
              placeholder="Enter material name and press Enter"
              id={`material-input-${index}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMaterialToJobItem(index, e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>

        {/* Material Estimated Price */}
        <div className="form-group">
          <label>Material Estimated Price (₹)</label>
          <input 
            type="number" 
            placeholder="0" 
            value={item.material.estimatedPrice || ''} 
            onChange={(e) => handleMaterialsChange(
              index, 
              item.material.materialsRequired, 
              e.target.value
            )}
          />
        </div>
      </div>
    </div>
  ))}
</div>


                {/* --- Form Footer --- */}
                <div className="form-footer">
                  <div className="total-amount">
                    <span>Total Estimated Amount:</span>
                    <span className="amount">${calculateFormTotal().toFixed(2)}</span>
                  </div>
                  <button className="btn-save-job" onClick={handleSaveJob}>Save Job Card</button>
                </div>
              </div>
            )}

            {showOrderHistory && (
              <div className="order-history-view">
                <div className="form-header">
                  <h3><img src={clipboardIcon} alt="History" className="inline-icon" /> Order History</h3>
                  <button className="close-btn" onClick={() => setShowOrderHistory(false)}>✕</button>
                </div>
                <div className="order-history-content">
                  <p>Order history feature coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstimatorDashboard;