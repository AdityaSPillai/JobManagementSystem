import { useState, useEffect } from 'react';
import Header from './Header';
import playIcon from '../assets/play.svg';
import useAuth from '../context/context.js';
import tickIcon from '../assets/tick.svg';
import crossIcon from '../assets/cross.svg';
import axios from '../utils/axios.js';
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
import '../styles/EstimatorDashboard.css';

function EstimatorDashboard({ onLoginClick }) {
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const {userInfo, isAuthenticated, logout } = useAuth();
  const[employees,setEmployees]=useState([]);
  const[categories,setCategories]=useState([]);

  const shopId = userInfo?.shopId;

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

  const getAllConsumables = async () => {
    try {
      const res = await axios.get(`/shop/allConsumables/${userInfo?.shopId}`);
      if (res.data?.consumables?.length > 0) {
        setConsumables(res.data.consumables);
      } else {
        console.log("No consumables found for this shop");
        setConsumables([]);
      }
    } catch (error) {
      console.error("Error fetching consumables:", error);
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

  const getAllCategory = async () => {
    if (!shopId) return console.log("No shopId found");
    try {
      const res = await axios.get(`/shop/allCategories/${userInfo?.shopId}`);
      if (res.data?.categories?.length > 0) {
        setCategories(res.data.categories);
      } else {
        console.log("No services found for this shop");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
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
    getAllCategory();
    getAllConsumables();
  }, [userInfo]);

  const [jobs, setJobs] = useState([])

  const [formData, setFormData] = useState({
    templateId: '68f50077a6d75c0ab83cd019',
    isVerifiedByUser: false,
    workVerified:null,
    notes:null,
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
        category:'',
        estimatedManHours:0,
        machineHours: 0,
        machineHourlyRate: 0,
        machineEstimatedCost: 0,
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
        consumable: [],
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
          status: (job.status || 'Not Assigned').toLowerCase(),
          notes: (job.notes || ''),
          totalEstimatedAmount: job.totalEstimatedAmount || 0,
          items: job.jobItems?.map(item => ({
            itemId: item._id,
            jobType: item.itemData?.job_type || '',
            description: item.itemData?.description || '',
            priority: item.itemData?.priority || '',
            estimatedPrice: item.estimatedPrice || 0,
            category:item.category,
            estimatedManHours:item.estimatedManHours,
            itemStatus: (item.itemStatus || 'stopped').toLowerCase(),
            machine: {
              machineRequired: item.machine?.machineRequired?.name || item.machine?.machineRequired || null,
              machineId: item.machine?.machineRequired?._id || null,
              startTime: item.machine?.startTime || null,
              endTime: item.machine?.endTime || null,
              actualDuration: item.machine?.actualDuration || null
            },
            worker: {
              workerAssigned: item.worker?.workerAssigned || null,
              startTime: item.worker?.startTime || null,
              endTime: item.worker?.endTime || null,
              actualDuration: item.worker?.actualDuration || null
            },
            consumable: Array.isArray(item.consumable)
              ? item.consumable
                  .filter(c => c.name && c.name.trim() !== "" && c.price > 0)
                  .map(c => ({
                    name: c.name.trim(),
                    price: c.price,
                    available: c.available,
                  }))
              : []
          })) || []
        }));
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleEmployeeSelect = async (jobId, itemIndex, employeeId) => {
    console.log("Assigning worker:", employeeId, jobId, itemIndex);
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const itemId = job.items[itemIndex].itemId;
    console.log( "Assigning worker:", employeeId,jobId,itemId);

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
      const response = await axios.put(
        `/jobs/assign-worker/${employeeId}/${jobId}/${itemId}`
      );
      
      if (response.data.success) {
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

      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          const newItems = [...job.items];
          newItems[itemIndex].itemStatus = 'running';

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

      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          const newItems = [...job.items];
          newItems[itemIndex].itemStatus = 'completed';

          const allCompleted = newItems.every(item => item.itemStatus === 'completed');
          const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
          
          return { 
            ...job, 
            items: newItems, 
            status: allCompleted ? 'completed' : (hasRunningTask ? 'in Progress' : 'assigned') 
          };
        }
        return job;
      }));
      
    } catch (error) {
      console.log('Error ending timer:', error);
      alert('Failed to end timer');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'waiting' && job.status === 'waiting') ||
      (statusFilter === 'completed' && (job.status === 'completed' || job.status === 'approved')) ||
      (statusFilter === 'assigned' && (job.status === 'in_progress' || job.status === 'In Progress' || job.status === 'Assigned')) ||
      (statusFilter === 'unassigned' && (job.status === 'pending' || job.status === 'rejected'));

    return matchesSearch && matchesFilter;
  });

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

  const handleJobItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedJobItems = [...prev.jobItems];
      const currentItem = updatedJobItems[index];
      let updatedItem = { ...currentItem };

      if (field === 'estimatedManHours') {
        const manHours = parseFloat(value) || 0;
        const hourlyRate = currentItem.hourlyRate || 0;

        updatedItem = {
          ...currentItem,
          estimatedManHours: manHours,
          estimatedPrice: manHours * hourlyRate
        };
      } 
      else if (field === 'job_type' || field === 'description' || field === 'priority') {
        updatedItem = {
          ...currentItem,
          itemData: {
            ...currentItem.itemData,
            [field]: value
          }
        };
      } 
      else {
        updatedItem = { ...currentItem, [field]: value };
      }

      updatedJobItems[index] = updatedItem;
      return { ...prev, jobItems: updatedJobItems };
    });
  };

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
          category:'',
          estimatedManHours:0,
          machineHours: 0,
          machineHourlyRate: 0,
          machineEstimatedCost: 0,
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
          consumable: [],
        },
      ]
    }));
  };

  const removeJobItem = (index) => {
    if (formData.jobItems.length > 1) {
      const newItems = formData.jobItems.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, jobItems: newItems }));
    }
  };

  const calculateFormTotal = () => {
    const itemsTotal = formData.jobItems.reduce(
      (sum, item) => sum + (item.estimatedPrice || 0),
      0
    );

    const machinesTotal = formData.jobItems.reduce(
      (sum, item) => sum + (item.machineEstimatedCost || 0),
      0
    );

    const consumablesTotal = formData.jobItems.reduce(
      (sum, item) =>
        sum +
        (Array.isArray(item.consumable)
          ? item.consumable.reduce((s, c) => s + (c.price || 0), 0)
          : 0),
      0
    );

    return itemsTotal + machinesTotal + consumablesTotal;
  };

  const calculateJobTotal = (job) => {
    if (!job || !job.items) return 0;

    const itemsTotal = job.items.reduce(
      (sum, item) => sum + (item.estimatedPrice || 0),
      0
    );

    const consumablesTotal = job.items.reduce(
      (sum, item) => sum + (Array.isArray(item.consumable) ? item.consumable.reduce((sum, c) => sum + (c.price || 0), 0) : 0),
      0
    );

    return itemsTotal + consumablesTotal;
  };

  const handleSaveJob = async () => {
    const { formData: customerData, jobItems } = formData;

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
        estimatedPrice: item.estimatedPrice + (item.machineEstimatedCost || 0),
        category:item.category,
        estimatedManHours:item.estimatedManHours,
        machine: {
          machineRequired:
            typeof item.machine.machineRequired === "string" && item.machine.machineRequired.trim() !== ""
              ? item.machine.machineRequired
              : null,
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
        consumable: Array.isArray(item.consumable)
          ? item.consumable
              .filter(c => c.name && c.name.trim() !== "" && c.price > 0)
              .map(c => ({
                name: c.name.trim(),
                price: c.price,
                available: c.available,
              }))
          : []
      }))
    };

    console.log('Backend Payload:', JSON.stringify(backendPayload, null, 2));

    try {
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
            category:item.category,
            estimatedManHours:item.estimatedManHours,
            itemStatus: 'stopped'
          })),
          machines: [],
          consumables: []
        };

        await getAllJobs();

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
              category:'',
              estimatedManHours:0,
              machineHours: 0,
              machineHourlyRate: 0,
              machineEstimatedCost: 0,
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
              consumable: []
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

  const handleJobTypeSelect = (index, serviceId) => {
    const selectedService = services.find(service => service._id === serviceId);
    setFormData(prev => {
      const updatedJobItems = [...prev.jobItems];

      updatedJobItems[index] = {
        ...updatedJobItems[index],
        itemData: {
          ...updatedJobItems[index].itemData,
          job_type: selectedService?.name || '',
          job_type_id: serviceId,
          description: selectedService?.description || ''
        },
        estimatedPrice: selectedService?.price || 0
      };

      return { ...prev, jobItems: updatedJobItems };
    });
  };

  const handleJobCategorySelect = (index, categoryName) => {
    const selectedCategory = categories.find(c => c.name === categoryName);
    setFormData(prev => {
      const updatedJobItems = [...prev.jobItems];
      const currentItem = updatedJobItems[index];
      const hourlyRate = selectedCategory?.hourlyRate || 0;
      
      updatedJobItems[index] = {
        ...currentItem,
        category: categoryName,
        hourlyRate: hourlyRate,
        // Recalculate price if man-hours already exist
        estimatedPrice: (currentItem.estimatedManHours || 0) * hourlyRate
      };
      return { ...prev, jobItems: updatedJobItems };
    });
  };

// ✅ Utility function to fetch rate
  const fetchHourlyRate = async (type) => {
    try {
      console.log("Fetching rate for type:", type);
      const res = await axios.get(`/shop/getHourlyRate/${userInfo?.shopId}/${type}`);
      console.log("Rate Response:", res.data);
      return res.data?.rate || 0; // ✅ Only return numeric rate
    } catch (error) {
      console.error("Error fetching hourly rate:", error);
      return 0;
    }
  };

// ✅ When a machine is selected
  const handleMachineRequiredChange = async (itemIndex, machineId) => {
    const selectedMachine = machines.find(m => m._id === machineId);
    if (!selectedMachine) return;

    const type = selectedMachine.type;
    const hourlyRate = await fetchHourlyRate(type); // ✅ Wait for rate
    const machineHours = formData.jobItems[itemIndex]?.machineHours || 0;
    const machineEstimatedCost = hourlyRate * machineHours;

    setFormData(prev => {
      const newJobItems = [...prev.jobItems];
      newJobItems[itemIndex] = {
        ...newJobItems[itemIndex],
        machine: {
          ...newJobItems[itemIndex].machine,
          machineRequired: machineId || null,
        },
        machineHourlyRate: hourlyRate,
        machineEstimatedCost
      };
      return { ...prev, jobItems: newJobItems };
    });

    console.log("✅ Machine Selected:", {
      machine: selectedMachine.name,
      type,
      hourlyRate,
      machineHours,
      machineEstimatedCost
    });
  };

// ✅ When machine hours are updated
  const handleMachineHoursChange = async (itemIndex, hours) => {
    const newHours = parseFloat(hours) || 0;
    const currentItem = formData.jobItems[itemIndex];
    const machineId = currentItem.machine.machineRequired;

    if (!machineId) return;

    const selectedMachine = machines.find(m => m._id === machineId);
    const type = selectedMachine?.type;
    const hourlyRate = await fetchHourlyRate(type); // ✅ Wait for rate

    const machineEstimatedCost = newHours * hourlyRate;

    setFormData(prev => {
      const newJobItems = [...prev.jobItems];
      newJobItems[itemIndex] = {
        ...newJobItems[itemIndex],
        machineHours: newHours,
        machineHourlyRate: hourlyRate,
        machineEstimatedCost
      };
      return { ...prev, jobItems: newJobItems };
    });

    console.log("✅ Machine Cost Calculated:", {
      machineName: selectedMachine?.name,
      hourlyRate,
      hoursNum: newHours,
      machineEstimatedCost
    });
  };

  const handleVerifyJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to approve this job?")) return;
    try {
      const res = await axios.post(`/jobs/verifyJob/${jobId}`);
      if (res.data?.success) {
        alert("✅ Job approved successfully!");
        await getAllJobs();
        setShowJobDetails(false);
        setSelectedJob(null);
      } else {
        alert("Failed to approve job.");
      }
    } catch (error) {
      console.error("Error approving job:", error);
      alert("Error while approving job. Please try again.");
    }
  };

  const handleRejectJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to reject this job?")) return;
    try {
      const res = await axios.delete(`/jobs/delete-job/${jobId}`);
      if (res.data?.success) {
        alert("❌ Job rejected and deleted successfully!");
        window.location.reload();
        await getAllJobs();
        setShowJobDetails(false);
        setSelectedJob(null);
      } else {
        alert("Failed to reject job.");
      }
    } catch (error) {
      console.error("Error rejecting job:", error);
      alert("Error while rejecting job. Please try again.");
    }
  };

  return (
    <div className="estimator-dashboard">
      <Header 
        userRole={isAuthenticated ? userInfo?.role : 'Estimator'}
        onLogin={onLoginClick}
        onLogout={logout}
        showLogin={!isAuthenticated}
      />
      <div className="e-dashboard-content">
        <div className="e-dashboard-title-section">
          <div className="e-dashboard-wrapper">
            <div className="e-dashboard-title">
              <h2>Estimator Dashboard</h2>
              <p>Create job cards and track order history</p>
            </div>
            <div className="action-buttons">
              <button className="btn-action-primary" onClick={() => {
                setShowCreateJob(!showCreateJob);
                setShowJobDetails(false);
              }}>
                + Add Job Card
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="job-list-section">
            <div className="section-header job-header-with-filters">
              <h3><img src={clipboardIcon} alt="Jobs" className="inline-icon" /> Job Cards</h3>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'waiting' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('waiting')}
                >
                  Waiting
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'assigned' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('assigned')}
                >
                  Assigned
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'unassigned' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('unassigned')}
                >
                  Unassigned
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </button>
              </div>
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
                  }}
                >
                  <div className="job-header">
                    <span className="job-number">{job.id}</span>
                    <span className={`status-badge ${
                      job.status === 'In Progress' ? 'status-progress' : 
                      job.status === 'completed' ? 'status-completed' :
                      job.status === 'approved' ? 'status-approved' :
                      job.status === 'rejected' ? 'status-rejected' :
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
            {!showJobDetails && !showCreateJob && (
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
                        selectedJob.status === 'completed' ? 'status-completed' :
                        selectedJob.status === 'Assigned' ? 'status-assigned-active' :
                        'status-assigned'
                      }`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    
                  </div>
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
                              <div className="item-description-container">
                                <div className="item-description">{item.description}</div>
                                <div className="item-description">Priority: {item.priority}</div>
                              </div>
                              
                              {/*Notes to be displayed here if Notes is not NULL*/}
                              {selectedJob.notes && selectedJob.notes.trim() !== '' && (
                                <div className="job-items-container">
                                  <strong className="job-items-title">Notes:</strong>
                                  <div className="full-width">
                                    <p className="job-notes-text">{selectedJob.notes}</p>
                                  </div>
                                </div>
                              )}

                              {item.machine.machineRequired && (
                                <div className="job-items-container">
                                  <strong className="job-items-title">Machine Used:</strong>
                                  <div className="full-width">
                                    <p className='machiene-name'><strong>Machine:</strong> {item.machine.machineRequired}</p>
                                  </div>
                                </div>
                              )}

                              {item.consumable && item.consumable.length > 0 && (
                                <div className="job-items-container">
                                  <strong className="job-items-title">Consumables Used:</strong>
                                  <div className="full-width">
                                    {item.consumable.map((c, i) => (
                                      <p key={i} style={{ color: 'black' }}>
                                        {c.name} — ₹{c.price} {c.available ? "(Available)" : "(Not Available)"}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="item-price">
                                ₹{(
                                  (item.estimatedPrice || 0) +
                                  (Array.isArray(item.consumable) ? item.consumable.reduce((sum, c) => sum + (c.price || 0), 0) : 0)
                                ).toFixed(2)}
                              </div>
                            </div>
                            {item.worker.workerAssigned && (
                              <div className="item-timer-section">
                                <div className="item-timer-controls">
                                  {item.itemStatus === 'completed' || 
                                    selectedJob.status.toLowerCase() === 'completed' || 
                                    selectedJob.status.toLowerCase() === 'approved' ? (
                                      <div className="completed-badge-small">
                                        <img src={tickIcon} alt="Completed" className="btn-icon" />
                                      </div>
                                  ) : (
                                    <>
                                      {item.itemStatus === 'stopped' && (
                                        <button 
                                          title="Start"
                                          className="btn-timer-small btn-start"
                                          onClick={() => handleStartItemTimer(selectedJob.id, index, item.worker.workerAssigned)}
                                        >
                                          <img src={playIcon} alt="Start" className="btn-icon" />
                                        </button>
                                      )}

                                      {item.itemStatus === 'running' && (
                                        <button 
                                          title="End" 
                                          className="btn-timer-small btn-end" 
                                          onClick={() => handleEndItemTimer(selectedJob.id, index, item.worker.workerAssigned)}
                                        >
                                          <img src={tickIcon} alt="End" className="btn-icon" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="full-width">
                            <p className="employee-select-label"><strong>Assign Employee for this task:</strong></p>
                            <select
                              className="employee-select"
                              value={item.worker.workerAssigned || ''}
                              onChange={(e) => {
                                const selectedEmployeeId = e.target.value;
                                if (selectedEmployeeId) {
                                  handleEmployeeSelect(selectedJob.id, index, selectedEmployeeId);
                                }
                              }}
                              disabled={
                                selectedJob.status.toLowerCase() === 'in_progress' ||
                                selectedJob.status.toLowerCase() === 'completed' ||
                                selectedJob.status.toLowerCase() === 'approved' ||
                                selectedJob.status.toLowerCase()==='waiting' ||
                                item.itemStatus === 'running' ||
                                item.itemStatus === 'completed'
                              }
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
                      </div> 
                    ))}
                  </div>
                  <div className="job-detail-total">
                    <strong className="total-label">Total Estimated Amount:</strong>
                    <strong className="total-amount">
                      ₹{calculateJobTotal(selectedJob).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {selectedJob.status.toLowerCase() === 'waiting' && (
                    <div className="approve-reject-section">
                      <button 
                        className="btn-approve"
                        onClick={() => handleVerifyJob(selectedJob.id)}
                      >
                       <img src={tickIcon} alt="Completed" className="btn-icon"/> Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleRejectJob(selectedJob.id)}
                      >
                        <img src={crossIcon} alt="Completed" className="btn-icon"/> Reject
                      </button>
                    </div>
                  )}
              </div>
            )}
            {showCreateJob && (
              <div className="create-job-form">
                <div className="form-header">
                  <h3>📝 Create New Job Card</h3>
                  <button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button>
                </div>
                <p className="form-subtitle">Fill in the details to create a new job order</p>
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
                            <label>Employee Category</label>
                        <select 
                            value={item.category || ''} 
                            onChange={(e) => handleJobCategorySelect(index, e.target.value)}
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map(category => (
                              <option key={category._id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          </div>

                        <div className="form-group">
                          <label>Estimated Man-Hours </label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={item.estimatedManHours || ''} 
                            onChange={(e) => handleJobItemChange(index, 'estimatedManHours', e.target.value)}
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
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
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

                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Machine Hours (hrs)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.machineHours || ''}
                            onChange={(e) => handleMachineHoursChange(index, e.target.value)}
                            min="0"
                          />
                          {item.machineHourlyRate > 0 && (
                            <p style={{ fontSize: '0.8rem', marginTop: '5px', color: '#444' }}>
                              Rate: ₹{item.machineHourlyRate}/hr | Cost: ₹{item.machineEstimatedCost.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
  <div className="form-group-consumables-header">
    <label>Consumables Required (Optional)</label>
  </div>

  {item.consumable.map((c, ci) => (
    <div key={ci} className="consumable-entry">
      <select
        value={c._id || ""}
        onChange={(e) => {
          const selectedId = e.target.value;

          if (selectedId === "manual") {
            // Manual input mode
            const updatedConsumables = [...item.consumable];
            updatedConsumables[ci] = { name: "", price: 0, available: true, isManual: true };
            updateJobItemField(index, "consumable", updatedConsumables);
            return;
          }

          const selectedConsumable = consumables.find(con => con._id === selectedId);
          if (selectedConsumable) {
            const updatedConsumables = [...item.consumable];
            updatedConsumables[ci] = {
              _id: selectedConsumable._id,
              name: selectedConsumable.name,
              price: selectedConsumable.price,
              available: selectedConsumable.available,
              isManual: false,
            };
            updateJobItemField(index, "consumable", updatedConsumables);
          }
        }}
      >
        <option value="">--Select Consumable--</option>
        {consumables.map((cOpt) => (
          <option key={cOpt._id} value={cOpt._id}>
            {cOpt.name} - ₹{cOpt.price}
          </option>
        ))}
        <option value="manual">+ Add Manual Consumable</option>
      </select>

      {/* Manual input fields */}
      {c.isManual && (
        <div className="manual-consumable-fields">
          <input
            type="text"
            placeholder="Consumable Name"
            value={c.name || ""}
            onChange={(e) => {
              const updated = [...item.consumable];
              updated[ci] = { ...updated[ci], name: e.target.value };
              updateJobItemField(index, "consumable", updated);
            }}
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={c.price || ""}
            onChange={(e) => {
              const updated = [...item.consumable];
              updated[ci] = { ...updated[ci], price: parseFloat(e.target.value) || 0 };
              updateJobItemField(index, "consumable", updated);
            }}
          />
        </div>
      )}

      {/* Remove button */}
      {item.consumable.length > 1 && (
        <button
          type="button"
          onClick={() => {
            const updated = item.consumable.filter((_, i) => i !== ci);
            updateJobItemField(index, "consumable", updated);
          }}
        >
          ❌
        </button>
      )}
    </div>
  ))}

  {/* Auto-add empty row when last filled */}
  {(() => {
    const last = item.consumable[item.consumable.length - 1];
    if (last?.name && last?.price > 0) {
      const updated = [...item.consumable, { name: "", price: 0, available: true }];
      if (JSON.stringify(updated) !== JSON.stringify(item.consumable)) {
        updateJobItemField(index, "consumable", updated);
      }
    }
  })()}

  {/* Add button only if no consumables */}
  {item.consumable.length === 0 && (
    <button
      type="button"
      className="btn-add-job"
      onClick={() =>
        updateJobItemField(index, "consumable", [{ name: "", price: 0, available: true }])
      }
    >
      ➕ Add Consumable
    </button>
  )}
</div>
                    </div>
                  ))}
                </div>
                <div className="form-footer">
                  <div className="total-amount">
                    <span>Total Estimated Amount:</span>
                    <span className="amount">₹{calculateFormTotal().toFixed(2)}</span>
                  </div>
                  <button className="btn-save-job" onClick={handleSaveJob}>Save Job Card</button>
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