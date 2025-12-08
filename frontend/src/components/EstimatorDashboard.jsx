import { useState, useEffect } from 'react';
import Header from './Header';
import playIcon from '../assets/play.svg';
import useAuth from '../context/context.jsx';
import tickIcon from '../assets/tick.svg';
import pause from '../assets/pause.svg';
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
  const[ispaused,setIsPaused]=useState(false);
  const [consumableQty, setConsumableQty] = useState({});
const [showCustomerPopup, setShowCustomerPopup] = useState(false);
const [customers, setCustomers] = useState([]);
const [selectedCustomerId, setSelectedCustomerId] = useState("");



const [newCustomer, setNewCustomer] = useState({
  name: '',
  phone: '',
  email: '',
  trnNumber: '',
  address: '',
  productId: '',
  productModel: '',
  productIdentification: ''
});

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
        console.log("Machines fetched:", res.data.machines);
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

  const getAllWorkers=async()=>{
    try {
      const res= await axios.get(`/shop/getAllEmployees/${userInfo?.shopId}`);
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

const getAllCustomers = async () => {
  try {
    const res = await axios.get(`/customer/list/${userInfo?.shopId}`);
    if (res.data?.customers) {
      setCustomers(res.data.customers);
      console.log("Customers fetched:", res.data.customers);
    }
  } catch (error) {
    console.error("Error fetching customers:", error);
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
    getAllWorkers();
    getAllCategory();
    getAllConsumables();
    getAllCustomers();
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
        numberOfWorkers:1,
        machineHours: 0,
        machineHourlyRate: 0,
        machineEstimatedCost: 0,
        machine: [],
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
    console.log(selectedJob);
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
          notes: (job.notes || ''),
          totalEstimatedAmount: job.totalEstimatedAmount || 0,
          items: job.jobItems?.map(item => {
            

              // Determine status from backend timestamps
             const computedStatus = item.status || 'pending';

              return {
                itemId: item._id,
                jobType: item.itemData?.job_type || '',
                description: item.itemData?.description || '',
                priority: item.itemData?.priority || '',
                estimatedPrice: item.estimatedPrice || 0,
                numberOfWorkers:item.numberOfWorkers || 1,
                category: item.category,
                estimatedManHours: item.estimatedManHours,
                itemStatus: computedStatus,   // but computedStatus = item.status now
                 
                machine: Array.isArray(item.machine) ?
                item.machine.map(machine=>({
                  machineRequired: machine.machineRequired?.name || machine.machineRequired || null,
                  machineId: machine.machineRequired?._id || null,
                  startTime: machine.startTime || null,
                  endTime: machine.endTime || null,
                  actualDuration: machine.actualDuration || null
                }))
                :[],
               
               workers: Array.isArray(item.workers)
                    ? item.workers.map(worker => ({
                        workerAssigned: worker.workerAssigned,
                        startTime: worker.startTime,
                        endTime: worker.endTime,
                        actualDuration: worker.actualDuration,
                      }))
                    : [],

                
                consumable: Array.isArray(item.consumable)
                  ? item.consumable
                      .filter(c => c.name && c.name.trim() !== "" && c.price > 0)
                      .map(c => ({
                        name: c.name.trim(),
                        price: c.price,
                        available: c.available,
                      }))
                  : []
              };
            }) || []

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

  const item = job.items[itemIndex];
  if (!item) return;

  const maxWorkers = item.numberOfWorkers || 1;
  const currentWorkers = Array.isArray(item.workers) ? item.workers.length : 0;

  if (currentWorkers >= maxWorkers) {
    alert(`You can assign only ${maxWorkers} worker(s) to this task.`);
    return;
  }

  const itemId = item.itemId;
  console.log("Assigning worker:", employeeId, jobId, itemId);

  try {
    if (!employeeId || !jobId || !itemId) {
      console.log("All IDs not received");
      return;
    }

    // call backend to push a new worker into the jobItem.workers array
    const response = await axios.put(
      `/jobs/assign-worker/${employeeId}/${jobId}/${itemId}`
    );

    if (response.data.success) {
      const employee = employees.find(e => e._id === employeeId);

      // Update local UI by pushing the new worker object into item.workers
      setJobs(prevJobs =>
        prevJobs.map(job => {
          if (job.id === jobId) {
            const newItems = [...job.items];
            const item = { ...newItems[itemIndex] };

            // Ensure workers array exists
            const currWorkers = Array.isArray(item.workers) ? [...item.workers] : [];

            // Push a minimal placeholder — backend will return the full object on next fetch.
            currWorkers.push({
              _id: response.data.workerObjectId || `temp-${employeeId}-${Date.now()}`, // backend should ideally return the new worker._id
              workerAssigned: employeeId,
              startTime: null,
              endTime: null,
              actualDuration: null
            });

            item.workers = currWorkers;
            item.itemStatus = 'stopped';

            newItems[itemIndex] = item;
            return {
              ...job,
              items: newItems,
              status: 'Assigned'
            };
          }
          return job;
        })
      );

      alert(`Worker ${employee?.name || employeeId} assigned successfully!`);
    }
  } catch (error) {
    console.error('Error assigning worker:', error);
    alert('Failed to assign worker. Please try again.');
  }
};



const addMachineToItem=(itemIndex)=>{
  setFormData(prev=>{
    const newJobs=[...prev.jobItems];
    const item={...newJobs[itemIndex]};

    item.machine=[
      ...item.machine,
      {
        machineRequired: null,
        machineHours: 0,
        machineHourlyRate: 0,
        machineEstimatedCost: 0,
        startTime: null,
        endTime: null,
        actualDuration: null
      }
    ];
    newJobs[itemIndex] = item;
    return { ...prev, jobItems: newJobs };
  });
};


const removeMachineFromItem = (itemIndex, machineIndex) => {
  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    const item = { ...newJobItems[itemIndex] };
    
    item.machine = item.machine.filter((_, i) => i !== machineIndex);
    
    newJobItems[itemIndex] = item;
    return { ...prev, jobItems: newJobItems };
  });
};

// Update a specific machine in a job item
const updateMachineInItem = (itemIndex, machineIndex, field, value) => {
  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    const item = { ...newJobItems[itemIndex] };
    
    item.machine = item.machine.map((m, i) => {
      if (i === machineIndex) {
        return { ...m, [field]: value };
      }
      return m;
    });
    
    newJobItems[itemIndex] = item;
    return { ...prev, jobItems: newJobItems };
  });
};








 const handleStartItemTimer = async (jobId, itemIndex, workerObjectId) => {
  console.log(`API CALL: Start timer for job ${jobId}, workerObjectId ${workerObjectId}`);
  console.log(jobId,itemIndex,workerObjectId)

  try {
    // Pass jobItemId and workerObjectId to backend
    const job = jobs.find(j => j.id === jobId);
    if(!job) return;
    const jobItemId = job.items[itemIndex].itemId;

    const response = await axios.post(`/jobs/start-worker-timer/${jobId}/${jobItemId}/${workerObjectId}`);
    
    if (!response.data.success) {
      console.log('Error occurred');
      alert('Failed to start timer');
      return;
    }
    else{
       alert('Timer Started Successfully');
       getAllJobs();
    }
    
    console.log('Started successfully');

    // Update UI — set that worker's itemStatus to running
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        const item = { ...newItems[itemIndex] };

        // mark worker startTime locally (if backend returned timestamp use that)
        item.workers = item.workers.map(w => w._id === workerObjectId ? { ...w, startTime: new Date().toISOString() } : w);

        // Compute itemStatus: running if any worker running
        item.itemStatus = response.data.updatedItemStatus;


        newItems[itemIndex] = item;

        const hasRunningTask = newItems.some(i => i.itemStatus === 'running');

        return { 
          ...job, 
          items: newItems, 
          status: hasRunningTask ? 'In Progress' : job.status 
        };
      }
      return job;
    }));

    setIsPaused(false);

  } catch (error) {
    console.log('Error starting timer:', error);
    alert('Failed to start timer');
  }
};


 const handleEndItemTimer = async (jobId, itemIndex, workerObjectId) => {
  console.log(`API CALL: End timer for job ${jobId}, workerObjectId ${workerObjectId}`);

  try {
    const job = jobs.find(j => j.id === jobId);
    if(!job) return;
    const jobItemId = job.items[itemIndex].itemId;

    const response = await axios.post(`/jobs/end-worker-timer/${jobId}/${jobItemId}/${workerObjectId}`);
    
    if (!response.data.success) {
      console.log('Error occurred');
      alert('Failed to end timer');
      return;
    }

    console.log('Ended successfully');

    // Update UI — set that worker's endTime & actualDuration locally
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        const item = { ...newItems[itemIndex] };

        // assume backend returned { worker: { _id, endTime, actualDuration } } optionally
        const backendWorker = response.data.worker || null;

        item.workers = item.workers.map(w => {
          if (w._id === workerObjectId) {
            const endTime = backendWorker?.endTime || new Date().toISOString();
            const startTime = w.startTime || backendWorker?.startTime || null;
            const actualDuration = backendWorker?.actualDuration != null
              ? backendWorker.actualDuration
              : startTime ? Math.floor((new Date(endTime) - new Date(startTime)) / (1000 * 60)) : 0;
            return { ...w, endTime, actualDuration };
          }
          return w;
        });

        // recompute itemStatus: completed only if all workers have endTime
        const allCompleted = item.workers.length > 0 && item.workers.every(w => w.endTime);
        const hasRunning = item.workers.some(w => w.startTime && !w.endTime);
        item.itemStatus = allCompleted ? 'completed' : (hasRunning ? 'running' : 'in_progress');

        newItems[itemIndex] = item;

        const jobAllCompleted = newItems.every(i => i.itemStatus === 'completed');
        const jobHasRunning = newItems.some(i => i.itemStatus === 'running');

        return { 
          ...job, 
          items: newItems, 
          status: jobAllCompleted ? 'completed' : (jobHasRunning ? 'In Progress' : 'assigned') 
        };
      }
      return job;
    }));

    getAllJobs();

  } catch (error) {
    console.log('Error ending timer:', error);
    alert('Failed to end timer');
  }
};


const handlePauseTimer= async (jobId, itemIndex, workerObjectId) => {
  console.log(`API CALL: End timer for job ${jobId}, workerObjectId ${workerObjectId}`);

  try {
    const job = jobs.find(j => j.id === jobId);
    if(!job) return;
    const jobItemId = job.items[itemIndex].itemId;

    const response = await axios.post(`/jobs/pause-worker-timer/${jobId}/${jobItemId}/${workerObjectId}`);
    
    if (!response.data.success) {
      console.log('Error occurred');
      alert('Failed to end timer');
      return;
    }
    setIsPaused(true);
    alert('Timer Paused Successfully');
  } catch (error) {}
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


  const updateActualCostController=async(jobId, actualCost)=>{
    try {
      if(!jobId){
        console.log("No jobId found");
        return;
      }
      const res= await axios.put(`/jobs/actual-cost/${jobId}`,{actualTotalAmount:actualCost});

      if(!res.data.success){
        console.log("Error in updating actual cost");
        return;
      }
      console.log("Actual cost updated successfully");
      
    } catch (error) {
      console.log("Error updating actual cost:", error.message);
    }
  }


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
          numberOfWorkers:1,
          machineHours: 0,
          machineHourlyRate: 0,
          machineEstimatedCost: 0,
          machine: [],
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

  // ✅ Sum all machine costs from all machines in all items
  const machinesTotal = formData.jobItems.reduce((sum, item) => {
    const itemMachineTotal = Array.isArray(item.machine)
      ? item.machine.reduce((s, m) => s + (m.machineEstimatedCost || 0), 0)
      : 0;
    return sum + itemMachineTotal;
  }, 0);

  const consumablesTotal = formData.jobItems.reduce((sum, item, itemIndex) => {
    const itemConsumableTotal = Array.isArray(item.consumable)
      ? item.consumable.reduce((s, c, ci) => {
          const qty = consumableQty[`${itemIndex}-${ci}`] || 0;
          return s + (c.price || 0) * qty;
        }, 0)
      : 0;
    return sum + itemConsumableTotal;
  }, 0);

  return itemsTotal + machinesTotal + consumablesTotal;
};


 const calculateJobTotal = (job) => {
  if (!job || !job.items) return 0;

  const itemsTotal = job.items.reduce(
    (sum, item) => sum + (item.estimatedPrice || 0),
    0
  );

  const consumablesTotal = job.items.reduce((sum, item, itemIndex) => {
    const itemConsumableTotal = Array.isArray(item.consumable)
      ? item.consumable.reduce((s, c, ci) => {
          const qty = consumableQty[`${itemIndex}-${ci}`] || 0;
          return s + (c.price || 0) * qty;
        }, 0)
      : 0;
    return sum + itemConsumableTotal;
  }, 0);

  return itemsTotal + consumablesTotal;
};




const calculateActualCost = (job) => {
  if (!job || !job.items) return 0;

  return job.items.reduce((total, item) => {
    const category = categories.find(c => c.name === item.category);
    const hourlyRate = category?.hourlyRate || 0;

    // Worker actual duration in minutes from backend (already in item.worker.actualDuration)
 const totalActualMinutes = Array.isArray(item.workers)
  ? item.workers.reduce((s, w) => s + (w.actualDuration || 0), 0)
  : (item.worker?.actualDuration || 0);

const actualHours = totalActualMinutes / 60;
const laborCost = actualHours * hourlyRate;

    // Optional: if you want to include machine cost dynamically (if machine actualDuration is tracked)
    const machineHours = (item.machine?.actualDuration || 0) / 60;
    const machineRate = item.machineHourlyRate || 0;
    const machineCost = machineHours * machineRate;

    // Include consumables (already priced)
    const consumableCost = Array.isArray(item.consumable)
      ? item.consumable.reduce((sum, c) => sum + (c.price || 0), 0)
      : 0;

    const totalItemCost = laborCost + machineCost + consumableCost;
    const acutalCost= total + totalItemCost;
    try {
      updateActualCostController(job.id,acutalCost);
    } catch (error) {
      console.log(error);
    }
    return acutalCost;
  }, 0);
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

  // ✅ Calculate total machine cost for estimated price
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
    jobItems: jobItems.map(item => {
      // Calculate total machine cost for this item
      const totalMachineCost = Array.isArray(item.machine)
        ? item.machine.reduce((sum, m) => sum + (m.machineEstimatedCost || 0), 0)
        : 0;

      return {
        itemData: {
          job_type: item.itemData.job_type || '',
          description: item.itemData.description,
          priority: item.itemData.priority || 'Medium'
        },
        estimatedPrice: item.estimatedPrice + totalMachineCost,
        numberOfWorkers: item.numberOfWorkers || 1,
        category: item.category,
        estimatedManHours: item.estimatedManHours,
        
        // ✅ Send machines as array
        machine: Array.isArray(item.machine)
          ? item.machine
              .filter(m => m.machineRequired && m.machineRequired.trim() !== "")
              .map(m => ({
                machineRequired: m.machineRequired,
                startTime: m.startTime || null,
                endTime: m.endTime || null,
                actualDuration: m.actualDuration || null
              }))
          : [],
      
        workers: Array.isArray(item.workers)
          ? item.workers.map(w => ({
              workerAssigned: w.workerAssigned,
              startTime: w.startTime || null,
              endTime: w.endTime || null,
              actualDuration: w.actualDuration || null
            }))
          : [],

        consumable: Array.isArray(item.consumable)
          ? item.consumable
              .filter(c => c.name && c.name.trim() !== "" && c.price > 0)
              .map(c => ({
                name: c.name.trim(),
                price: c.price,
                available: c.available,
                quantity: c.quantity || 1
              }))
          : []
      };
    })
  };

  console.log('Backend Payload:', JSON.stringify(backendPayload, null, 2));

  try {
    const response = await axios.post('/jobs/new-job', backendPayload);
    
    if (response.data) {
      await getAllJobs();

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
            category: '',
            estimatedManHours: 0,
            numberOfWorkers: 1,
            machine: [], // ✅ Reset as empty array
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
  const handleMachineRequiredChange = async (itemIndex, machineIndex, machineId) => {
  const selectedMachine = machines.find(m => m._id === machineId);
  if (!selectedMachine) return;

  const type = selectedMachine.type;
  const hourlyRate = await fetchHourlyRate(type);
  const machineHours = formData.jobItems[itemIndex]?.machine[machineIndex]?.machineHours || 0;
  const machineEstimatedCost = hourlyRate * machineHours;

  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    const item = { ...newJobItems[itemIndex] };
    
    item.machine = item.machine.map((m, i) => {
      if (i === machineIndex) {
        return {
          ...m,
          machineRequired: machineId,
          machineHourlyRate: hourlyRate,
          machineEstimatedCost
        };
      }
      return m;
    });
    
    newJobItems[itemIndex] = item;
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
  const handleMachineHoursChange = async (itemIndex, machineIndex, hours) => {
  const newHours = parseFloat(hours) || 0;
  const currentItem = formData.jobItems[itemIndex];
  const machineId = currentItem.machine[machineIndex]?.machineRequired;

  if (!machineId) return;

  const selectedMachine = machines.find(m => m._id === machineId);
  const type = selectedMachine?.type;
  const hourlyRate = await fetchHourlyRate(type);
  const machineEstimatedCost = newHours * hourlyRate;

  setFormData(prev => {
    const newJobItems = [...prev.jobItems];
    const item = { ...newJobItems[itemIndex] };
    
    item.machine = item.machine.map((m, i) => {
      if (i === machineIndex) {
        return {
          ...m,
          machineHours: newHours,
          machineHourlyRate: hourlyRate,
          machineEstimatedCost
        };
      }
      return m;
    });
    
    newJobItems[itemIndex] = item;
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
    const reason = prompt("Please provide a reason for rejecting this job:");
    if (!reason) {
      alert("Rejection reason is required.");
      return;
    }
    try {
      const name = userInfo?.name?.trim() || "Unknown User";

      console.log(jobId,reason,name);
      const res = await axios.post(`/reject/rejectJob`, { jobId, shopId: userInfo?.shopId, reason, rejectedBy: name });
      if (res.data?.success) {
        alert("❌ Job rejected and deleted successfully!");
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





  const handleCreateCustomer = async () => {
  const {
    name,
    phone,
    email,
    trnNumber,
    address,
    productId,
    productModel,
    productIdentification
  } = newCustomer;

  if (
    !name ||
    !phone ||
    !email ||
    !trnNumber ||
    !address ||
    !productId ||
    !productModel ||
    !productIdentification
  ) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await axios.post('/customer/create', {
      name,
      phone,
      email,
      trnNumber,
      address,
      productId,
      productModel,
      productIdentification,
      shopId: userInfo?.shopId
    });

    if (res.data?.success) {
      alert("✅ Customer Added");

      const created = res.data.customer;

      setCustomers(prev => [...prev, created]);

      // ✅ Auto-fill job form with new customer + product
      setFormData(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          customer_name: created.name,
          contact_number: created.phone,
          vehicle_number: created.productId,
          vehicle_model: created.productModel,
          engine_number: created.productIdentification
        }
      }));

      setShowCustomerPopup(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        productId: '',
        productModel: '',
        productIdentification: ''
      });
    }
  } catch (error) {
    console.error("Customer create error:", error);
    alert("Failed to add customer");
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
                  Job created
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'unassigned' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('unassigned')}
                >
                  Unassigned
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'assigned' ? 'active' : ''}`} 
                  onClick={() => setStatusFilter('assigned')}
                >
                  Assigned
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
                    <span className="job-number">
                      {`Job-${job.jobCardNumber?.split("-").pop()}`}
                    </span>
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
                    <div><strong>Job Number:</strong> <span>{selectedJob.jobCardNumber}</span></div>
                    <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div>
                    <div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div>
                    <div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div>
                    <div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div>
                    <div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div>
                    <div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                    <div>
                      <strong>Status:</strong>
                      <span className={`status-badge ${
                        selectedJob.status === 'in_progress' ? 'status-progress' : 
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
                              
                                <div className='item-description'>Estimated Man hours  : {item.estimatedManHours}</div>
                                <p className="item-status-badge">
                              Status: <strong>{item.itemStatus}</strong>
                            </p>

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

                              {Array.isArray(item.machine) && item.machine.length > 0 && (
                                  <div className="job-items-container">
                                    <strong className="job-items-title">Machines Used:</strong>
                                    <div className="full-width">
                                      {item.machine.map((m, mi) => (
                                        <p key={mi} className='machine-name'>
                                          <strong>Machine {mi + 1}:</strong> {m.machineRequired || 'N/A'}
                                          {m.actualDuration && (
                                            <span style={{ marginLeft: '10px', color: '#666' }}>
                                              (Duration: {(m.actualDuration / 60).toFixed(2)} hrs)
                                            </span>
                                          )}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {item.consumable && item.consumable.length > 0 && (
                                <div className="job-items-container">
                                  <strong className="job-items-title">Consumables Used:</strong>
                                  <div className="full-width">
                                    {item.consumable.map((c, i) => (
                                      <p key={i} style={{ color: 'black' }}>
                                        {c.name} — ${c.price} {c.available ? "(Available)" : "(Not Available)"}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="item-price">
                                ${(
                                  (item.estimatedPrice || 0) +
                                  (Array.isArray(item.consumable) ? item.consumable.reduce((sum, c) => sum + (c.price || 0), 0) : 0)
                                ).toFixed(2)}
                              </div>
                            </div>
                            <br></br>
                            <br></br>
                          {/* Workers list & per-worker timer controls */}
                           
                          </div>
                          <div className="full-width">
                            <p className="employee-select-label"><strong>Assign Employee for this task:</strong></p>


                                   {Array.isArray(item.workers) && item.workers.length > 0 ? (
                              item.workers.map((w, wi) => (
                                <div key={w._id || wi} className="item-timer-section">
                                  <div className="worker-row">
                                    <div className="worker-info">
                                      <strong>Worker:</strong> { /* show name if you can resolve, else id */ }
                                      {employees.find(e => e._id === w.workerAssigned)?.name || w.workerAssigned} {employees.find(e => e._id === w.workerAssigned)?.employeeNumber || ''  }
                                    </div>

                                    <div className="item-timer-controls">
                                      {(w.endTime || selectedJob.status.toLowerCase() === "completed" || selectedJob.status.toLowerCase() === "approved") ? (
                                        <div className="completed-badge-small">
                                          <img src={tickIcon} alt="Completed" className="btn-icon" />
                                        </div>
                                      ) : (
                                        <>
                                          {/* NOT STARTED */}
                                          {(!w.startTime && !w.endTime) && (
                                            <button
                                              title="Start"
                                              className="btn-timer-small btn-start"
                                              onClick={() => handleStartItemTimer(selectedJob.id, index, w.workerAssigned)}
                                            >
                                              <img src={playIcon} alt="Start" className="btn-icon" />
                                            </button>
                                          )}

                                          {/* PAUSED → ONLY PLAY */}
                                          {(w.startTime && !w.endTime && ispaused) && (
                                            <button
                                              title="Resume"
                                              className="btn-timer-small btn-start"
                                              onClick={() => handleStartItemTimer(selectedJob.id, index, w.workerAssigned)}
                                            >
                                              <img src={playIcon} alt="Start" className="btn-icon" />
                                            </button>
                                          )}

                                          {/* RUNNING → PAUSE + END */}
                                          {(w.startTime && !w.endTime && !ispaused) && (
                                            <>
                                              <button
                                                title="End"
                                                className="btn-timer-small btn-end"
                                                onClick={() => handleEndItemTimer(selectedJob.id, index, w.workerAssigned)}
                                              >
                                                <img src={tickIcon} alt="End" className="btn-icon" />
                                              </button>

                                              <button
                                                title="Pause"
                                                className="btn-timer-small btn-pause"
                                                onClick={() => handlePauseTimer(selectedJob.id, index, w.workerAssigned)}
                                              >
                                                <img src={pause} alt="Pause" className="btn-icon" />
                                              </button>
                                            </>
                                          )}

                                          {(w.startTime && !w.endTime && !ispaused) && (
                                            <p className="job-running-label">🟢 Working</p>
                                          )}
                                        </>
                                      )}
                                    </div>


                                    {/* show actual duration if available */}
                                   {w?.actualDuration != null && w.actualDuration > 0 && (
                                            <div className="job-items-container">
                                              <strong className="job-items-title">Actual Time Used:</strong>
                                              <div className="full-width">
                                                <p className='time'>
                                                  ⏱ {(() => {
                                                    const hours = Math.floor(w.actualDuration / 60);
                                                    const minutes = Math.floor(w.actualDuration % 60);
                                                    const seconds = Math.floor((w.actualDuration * 60) % 60);
                                                    if(minutes==0 && hours==0 || w. actualDuration <1  ){
                                                      return `Less Than A minute`;  
                                                    }
                                                    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                                                  })()}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p style={{ color: '#666' }}>No workers assigned yet for this task</p>
                            )}




                            <select
                              className="employee-select"
                              value={''} // leave empty so user can add multiple workers; selection does not represent a single assigned worker
                              onChange={(e) => {
                                const selectedEmployeeId = e.target.value;
                                if (selectedEmployeeId) {
                                  handleEmployeeSelect(selectedJob.id, index, selectedEmployeeId);
                                }
                              }}
                              disabled={
                                selectedJob.status === 'waiting' ||
                                item.itemStatus === 'completed' ||
                                item.itemStatus === 'approved' ||
                                selectedJob.status === 'approved' ||
                                selectedJob.status === 'completed'||
                                 (Array.isArray(item.workers) && item.workers.length >= (item.numberOfWorkers || 1))
                              }

                            >
                            <option value="">Select Employee</option>

                            {employees
                              .filter(emp => emp.specialization === item.category)

                              .filter(emp => !item.workers.some(w => w.workerAssigned === emp._id))
                              .map(emp => (
                                <option key={emp._id} value={emp._id}>
                                  {emp.name} {emp.employeeNumber} — {emp.specialization}
                                </option>
                              ))
                            }

                                    </select>
                          </div>
                        </div>
                      </div> 
                      
                    ))}
                  </div>

                  
                  <div className="job-detail-total">
                    <strong className="total-label">Total Estimated Amount:</strong>
                    <strong className="total-amount">
                      ${calculateJobTotal(selectedJob).toFixed(2)}
                    </strong>

                    {selectedJob.status.toLowerCase()=="approved" &&(
                      <>
                      <strong className="total-label">Actual cost:</strong>
                    <strong className="total-amount">
                      ${calculateActualCost(selectedJob).toFixed(2)}
                    </strong>
                      </>
                    )}
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
                  <h3 className="add-job-heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon"/> <span className="new-job-card">Create New Job Card</span> </h3>
                  <button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button>
                </div>
                <p className="form-subtitle">Fill in the details to create a new job order</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name</label>

                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCustomerId(value);

                        if (value === "__add_new__") {
                          setShowCustomerPopup(true);
                          return;
                        }

                        const selectedCustomer = customers.find(c => c._id === value);

                        if (selectedCustomer) {
                          setFormData(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              customer_name: selectedCustomer.name,
                              contact_number: selectedCustomer.phone,
                              vehicle_number: selectedCustomer.productId,
                              vehicle_model: selectedCustomer.productModel,
                              engine_number: selectedCustomer.productIdentification,
                            }
                          }));
                        }
                      }}
                    >
                      <option value="">-- Select Customer (Name + Phone) --</option>

                      {customers.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} — {c.phone}
                        </option>
                      ))}

                      <option value="__add_new__">➕ Add New Customer</option>
                    </select>

                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input type="tel" placeholder="555-123-4567" value={formData.formData.contact_number} onChange={(e) => handleFormChange('contact_number', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product ID </label>
                    <input type="text" placeholder="ABC-123" value={formData.formData.vehicle_number} onChange={(e) => handleFormChange('vehicle_number', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Product Model</label>
                    <input type="text" placeholder="e.g., Toyota Camry 2018" value={formData.formData.vehicle_model} onChange={(e) => handleFormChange('vehicle_model', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Serial Number</label>
                  <input type="text" placeholder="Enter engine identification number" value={formData.formData.engine_number} onChange={(e) => handleFormChange('engine_number', e.target.value)} />
                </div>
                <div className="job-items-section">
                  <div className="section-title">
                    <h4>Job Tasks</h4>
                   
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
                         <div className="form-group">
                          <label>Number of Workers </label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={item.numberOfWorkers || ''} 
                            onChange={(e) => handleJobItemChange(index, 'numberOfWorkers', e.target.value)}
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
                      <div className="form-group">
  <div className="form-group-machines-header">
    <label>Machines Required (Optional)</label>
    <button
      type="button"
        className="btn-add-job"
      onClick={() => addMachineToItem(index)}
    >
                                 <span className="add-con-wrapper"><img src="/plus.png" alt="Plus Icon" className="plus-icon-con"/> Add Mchine</span>

    </button>
  </div>
            <div className="form-group">
             <div className="form-group-consumables-header">
              {Array.isArray(item.machine) && item.machine.length > 0 ? (
                item.machine.map((machine, machineIndex) => (
                  <div key={machineIndex} className="consumable-entry">
                    <div className="machine-row">
                        <select 
                         className="consumable-quantity-input"
                          value={machine.machineRequired || ''} 
                          onChange={(e) => handleMachineRequiredChange(index, machineIndex, e.target.value)}
                        >
                          <option value="">--Select Machine--</option>
                          {machines.map((m) => (
                            m.isAvailable && (  
                              <option key={m._id} value={m._id}>
                                {m.name} - {m.type}
                              </option>
                            )
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Hours"
                          value={machine.machineHours || ''}
                          onChange={(e) => handleMachineHoursChange(index, machineIndex, e.target.value)}
                          min="0"
                          step="0.5"
                        />
              

                      {item.machine.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-machine"
                          onClick={() => removeMachineFromItem(index, machineIndex)}
                          title="Remove Machine"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {machine.machineHourlyRate > 0 && (
                      <p style={{ fontSize: '0.8rem', marginTop: '5px', color: '#444' }}>
                        Rate: ${machine.machineHourlyRate}/hr | Cost: ${(machine.machineEstimatedCost || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  className="btn-add-machine-initial"
                  onClick={() => addMachineToItem(index)}
                >
                  + Add Machine
                </button>
              )}
              </div>
              </div>

              {/* Show total machine cost for this item */}
              {Array.isArray(item.machine) && item.machine.length > 0 && (
                <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#2563eb' }}>
                  Total Machine Cost: ${item.machine.reduce((sum, m) => sum + (m.machineEstimatedCost || 0), 0).toFixed(2)}
                </div>
              )}
            </div>

                      <div className="form-group">
                        <div className="form-group-consumables-header">
                          <label>Consumables Required (Optional)</label>
                        </div>

                        {item.consumable.map((c, ci) => (
                          <div key={ci} className="consumable-entry">
                            <select
                              value={c._id || ""}
                              className="consumable-quantity-input"
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
                                <option key={cOpt._id} value={cOpt._id} >
                                  {cOpt.name} - ${cOpt.price}{ (cOpt.quantity) ? ` (In Stock: )` : 'Out of Stock' }
                                </option>
                              ))}
                              <option value="manual">+ Add Manual Consumable</option>
                            </select>
                          <input
                        type="number"
                        placeholder="Quantity"
                        className='consumable-quantity-select'
                        value={consumableQty[`${index}-${ci}`] || ""}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setConsumableQty(prev => ({
                            ...prev,
                            [`${index}-${ci}`]: qty
                          }));
                        }}
                      />


                            {/* Manual input fields */}
                            {c.isManual && (
                              <div className="manual-consumable-fields">
                                 <input
                        type="number"
                        placeholder="Quantity"
                        value={consumableQty[`${index}-${ci}`] || ""}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setConsumableQty(prev => ({
                            ...prev,
                            [`${index}-${ci}`]: qty
                          }));
                        }}
                      />
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
                                  placeholder="Price ($)"
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
                            <span className="add-con-wrapper"><img src="/plus.png" alt="Plus Icon" className="plus-icon-con"/> Add Consumable</span>
                          </button>
                        )}
                        <div>
                          <button className="btn-add-task-job" onClick={addJobItem}>+ Add Task</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="form-footer">
                  <div className="total-amount">
                    <span>Total Estimated Amount:</span>
                    <span className="amount">${calculateFormTotal().toFixed(2)}</span>
                  </div>
                  <button className="btn-save-job" onClick={handleSaveJob}>Save Job Card</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


       {/* ✅ CUSTOMER ADD POPUP — ADD IT HERE */}
    {showCustomerPopup && (
      <div className="customer-popup-overlay">
        <div className="customer-popup">
        <div className="form-group">
          <h3>Add New Customer</h3>

          <input
            placeholder="Customer Name"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
          />

          <input
            placeholder="Phone Number"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
          />

          <input
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
          />
           <input
            placeholder="TRN Number"
            value={newCustomer.trnNumber}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, trnNumber: e.target.value }))}
          />

          <input
            placeholder="Address"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
          />

          <input
            placeholder="Product ID"
            value={newCustomer.productId}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, productId: e.target.value }))}
          />

          <input
            placeholder="Product Model"
            value={newCustomer.productModel}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, productModel: e.target.value }))}
          />

          <input
            placeholder="Product Identification"
            value={newCustomer.productIdentification}
            onChange={(e) =>
              setNewCustomer(prev => ({ ...prev, productIdentification: e.target.value }))
            }
          />

          <div className="popup-actions">
            <button onClick={() => setShowCustomerPopup(false)}>Cancel</button>
            <button onClick={handleCreateCustomer}>Save</button>
          </div>
        </div>
      </div>
      </div>
    )}
  </div>
  

  
  );
}

export default EstimatorDashboard;