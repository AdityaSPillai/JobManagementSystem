import { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/SupervisorDashboard.css';
import useAuth from '../context/context.jsx';
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
import editIcon from '../assets/edit.svg';
// --- NEW ICON IMPORTS ---
import refreshIcon from '../assets/refresh.svg';
import infoIcon from '../assets/info.svg';
import tickIcon from '../assets/tick.svg';
import deleteIcon from '../assets/delete.svg';
import axios from "../utils/axios.js"

function EditJobModal({ isOpen, onClose, jobs, initialJobData, onSave, onDelete }) {
  const [selectedJobIdInternal, setSelectedJobIdInternal] = useState('');
  const [editFormData, setEditFormData] = useState([]);
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]);
  const { userInfo} = useAuth();
  const[employees,setEmployees]=useState([]);
  const[categories,setCategories]=useState([])
  const [consumables, setConsumables] = useState([]);

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


  const getAllConsumables = async () => {
  try {
    const res = await axios.get(`/shop/allConsumables/${userInfo?.shopId}`);
    if (res.data?.consumables?.length > 0) {
      setConsumables(res.data.consumables);
    } else {
      setConsumables([]);
    }
  } catch (error) {
    console.error("Error fetching consumables:", error);
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
    getAllWorlers();
    getAllConsumables();
    getAllCategory();
  }, [userInfo]);

  useEffect(() => {
    if (isOpen && initialJobData) {
      setSelectedJobIdInternal(initialJobData.id);
      console.log(initialJobData)
    if (isOpen && initialJobData) {
  setEditFormData({
    ...initialJobData,
    items: initialJobData.items.map(item => ({
      ...item,
      estimatedManHours: item.estimatedManHours || 0,
      machineHours: item.machineHours || 0,
      machineHourlyRate: item.machineHourlyRate || 0,
      machineEstimatedCost: item.machineEstimatedCost || 0,
      consumable: item.consumable || [{ name: '', price: 0 }]
    }))
  });
}

    } else if (isOpen && !initialJobData) {
      setSelectedJobIdInternal('');
      setEditFormData(null);
    }
  }, [isOpen, initialJobData]);

  const handleJobSelect = (id) => {
    setSelectedJobIdInternal(id);
    if (id) {
      const jobToEdit = jobs.find(job => job.id === id);
      setEditFormData(JSON.parse(JSON.stringify(jobToEdit)));
    } else {
      setEditFormData(null);
    }
  };

  // ADD THIS MISSING FUNCTION
  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    setSelectedJobIdInternal('');
    setEditFormData(null);
    onClose();
  };




const handleItemChange = (index, field, value, type) => {
  setEditFormData(prev => {
    const newItems = [...prev[type]];

    if (field === 'machine') {
      const selectedMachine = machines.find(m => m._id === value);
      newItems[index].machine = {
        ...newItems[index].machine,
        machineId: selectedMachine?._id || '',
        machineRequired: selectedMachine?.name || ''
      };
    } 
    else if (field === 'estimatedPrice' || field === 'quantity' || field === 'perPiecePrice') {
      newItems[index][field] = parseFloat(value) || 0;
    } 
    else {
      newItems[index][field] = value;
    }

    return { ...prev, [type]: newItems };
  });
};



  const addItem = (type) => {
    setEditFormData(prev => {
      let newItem;
      if (type === 'items') newItem = { jobType: '', description: '', estimatedPrice: 0, itemStatus: 'stopped' };
      else if (type === 'machines') newItem = { machineType: '', description: '', estimatedPrice: 0 };
      else newItem = { name: '', quantity: 1, perPiecePrice: 0 };
      return { ...prev, [type]: [...prev[type], newItem] };
    });
  };

  const removeItem = (index, type) => {
    if (type === 'items' && editFormData.items.length <= 1) return;
    setEditFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };
  
  const handleStatusChange = (e) => setEditFormData(prev => ({ ...prev, status: e.target.value }));
  
  const handleResetTimers = () => {
    if (window.confirm('Are you sure you want to reset all task statuses to "stopped" for this job?')) {
      setEditFormData(prev => ({ ...prev, items: prev.items.map(item => ({ ...item, itemStatus: 'stopped' })) }));
      alert('Task statuses reset. Save changes to apply.');
    }
  };

  const handleDeleteClick = async (jobId) => {
    if (window.confirm(`Are you sure you want to permanently delete Job ${editFormData.id}? This action cannot be undone.`)){
      try {
      const jobs=await axios.delete(`/jobs/delete-job/${jobId}`);
      if(!jobs.data.success){
        return console.error("unable to delete suer")
      }
      alert("job deleted succesfully");
      handleClose();
        }
     catch (error) {
      console.log(error,error.message)
    }
    } 
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Prepare data according to backend schema
    const payload = {
      formData: {
        customer_name: editFormData.customer_name,
        vehicle_number: editFormData.vehicle_number,
        engine_number: editFormData.engine_number,
        vehicle_model: editFormData.vehicle_model,
        contact_number: editFormData.contact_number
      },
     jobItems: editFormData.items.map((item) => ({
            itemData: {
              job_type: item.jobType || '',
              description: item.description || '',
              priority: item.priority || ''
            },
            estimatedPrice: item.estimatedPrice || 0,
            category: item.category || '',
            estimatedManHours: item.estimatedManHours || 0,
            machine: {
              machineRequired: item.machine.machineId || null,
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
            // ✅ FIXED: send array of consumables, not single object
            consumable: Array.isArray(item.consumable)
              ? item.consumable.map((c) => ({
                  name: c.name || '',
                  price: c.price || 0,
                  available: true
                }))
              : []
          })),
      status: editFormData.status || 'pending',
      isVerifiedByUser: true
    };

    console.log('🧾 Final payload sent to backend:', payload);

    const response = await axios.put(
      `/jobs/update-job/${editFormData.id}`,
      payload
    );

    if (response.data.success) {
      alert('✅ Job updated successfully!');
       window.location.reload();
    } else {
      alert('⚠️ Failed to update job on server');
    }

    onSave(editFormData);
    handleClose();
  } catch (err) {
    console.error('Error updating job:', err);
    alert('❌ Error saving job.');
  }
};





const calculateTotal = () => {
  if (!editFormData) return 0;
  const itemsTotal = editFormData.items?.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0) || 0;
  const machinesTotal = editFormData.items?.reduce((sum, item) => sum + (item.machineEstimatedCost || 0), 0) || 0;
  const consumablesTotal = editFormData.items?.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item.consumable)
        ? item.consumable.reduce((s, c) => s + (c.price || 0), 0)
        : 0),
    0
  );
  return itemsTotal + machinesTotal + consumablesTotal;
};

  if (!isOpen) return null;

const handleJobTypeSelect = (index, serviceId) => {
  const selectedService = services.find(service => service._id === serviceId);
  setEditFormData(prev => {
    const updatedItems = [...prev.items];
    updatedItems[index] = {
      ...updatedItems[index],
      jobType: selectedService?.name || '',
      description: selectedService?.description || '',
      estimatedPrice: selectedService?.price || 0
    };
    return { ...prev, items: updatedItems };
  });
};


const handleConsumableSelect = (itemIndex, consIndex, selectedName) => {
  const selected = consumables.find(c => c.name === selectedName);
  const selectedPrice = selected?.price || 0;

  setEditFormData(prev => {
    const updatedItems = [...prev.items];
    const updatedConsumables = [...(updatedItems[itemIndex].consumable || [])];
    updatedConsumables[consIndex] = { name: selectedName, price: selectedPrice };
    updatedItems[itemIndex].consumable = updatedConsumables;
    return { ...prev, items: updatedItems };
  });
};

const addConsumable = (itemIndex) => {
  setEditFormData(prev => {
    const updatedItems = [...prev.items];
    updatedItems[itemIndex].consumable = [
      ...(updatedItems[itemIndex].consumable || []),
      { name: '', price: 0 },
    ];
    return { ...prev, items: updatedItems };
  });
};

const removeConsumable = (itemIndex, consIndex) => {
  setEditFormData(prev => {
    const updatedItems = [...prev.items];
    const updatedConsumables = [...(updatedItems[itemIndex].consumable || [])];
    updatedConsumables.splice(consIndex, 1);
    updatedItems[itemIndex].consumable = updatedConsumables;
    return { ...prev, items: updatedItems };
  });
};


const fetchHourlyRate = async (type) => {
  try {
    const res = await axios.get(`/shop/getHourlyRate/${userInfo?.shopId}/${type}`);
    return res.data?.rate || 0;
  } catch (err) {
    console.error("Error fetching hourly rate:", err);
    return 0;
  }
};

const handleManHoursChange = async (index, hours) => {
  const manHours = parseFloat(hours) || 0;
  const categoryName = editFormData.items[index].category;
  const category = categories.find(c => c.name === categoryName);
  const hourlyRate = category?.hourlyRate || 0;
  const estimatedPrice = manHours * hourlyRate;

  setEditFormData(prev => {
    const updated = [...prev.items];
    updated[index] = { ...updated[index], estimatedManHours: manHours, estimatedPrice };
    return { ...prev, items: updated };
  });
};

const handleMachineHoursChange = async (index, hours) => {
  const machineHours = parseFloat(hours) || 0;
  const machineId = editFormData.items[index].machine?.machineId;
  const machine = machines.find(m => m._id === machineId);
  const rate = machine ? await fetchHourlyRate(machine.type) : 0;
  const machineEstimatedCost = rate * machineHours;

  setEditFormData(prev => {
    const updated = [...prev.items];
    updated[index] = {
      ...updated[index],
      machineHours,
      machineHourlyRate: rate,
      machineEstimatedCost
    };
    return { ...prev, items: updated };
  });
};

const handleJobCategorySelect = (index, categoryName) => {
      const selectedCategory = categories.find(c => c.name === categoryName);
      const hourlyRate = selectedCategory?.hourlyRate || 0;

      setEditFormData(prev => {
        const updatedItems = [...prev.items];
        const currentItem = updatedItems[index];

        updatedItems[index] = {
          ...currentItem,
          category: categoryName,
          hourlyRate,
          estimatedPrice: (currentItem.estimatedManHours || 0) * hourlyRate
        };

        return { ...prev, items: updatedItems };
      });
    };



  return (

    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && handleClose()}>
    <div className="modal-content create-job-form large" onClick={(e) => e.stopPropagation()}></div>
    <div className="modal-overlay">
      <div className="modal-content create-job-form large">
        <div className="form-header">
          <h3><img src={editIcon} alt="Edit" className="inline-icon" /> Edit Job Card</h3>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {!initialJobData && !editFormData && (
          <div className="job-selection-step">
            <p className="form-subtitle">Please select a job to edit:</p>
            <div className="form-group">
              <label>Select Job ID</label>
              <select className="employee-select" value={selectedJobIdInternal} onChange={(e) => handleJobSelect(e.target.value)}>
                <option value="">-- Select a Job --</option>
                {jobs.map(job => (<option key={job.id} value={job.id}>{job.id} - {job.customer_name} ({job.vehicle_number})</option>))}
              </select>
            </div>
          </div>
        )}

        {editFormData && (
      <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
            {!initialJobData && (<button type="button" className="btn-back" onClick={() => handleJobSelect('')}>&larr; Back to Job Selection</button>)}
            
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name *</label>
                <input type="text" value={editFormData.customer_name || ''} onChange={(e) => handleFormChange('customer_name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Contact Number *</label>
                <input type="tel" value={editFormData.contact_number || ''} onChange={(e) => handleFormChange('contact_number', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Number *</label>
                <input type="text" value={editFormData.vehicle_number || ''} onChange={(e) => handleFormChange('vehicle_number', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Vehicle Model</label>
                <input type="text" value={editFormData.vehicle_model || ''} onChange={(e) => handleFormChange('vehicle_model', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Engine Number</label>
              <input type="text" value={editFormData.engine_number || ''} onChange={(e) => handleFormChange('engine_number', e.target.value)} />
            </div>

            <div className="job-items-section supervisor-actions">
              <div className="section-title"><h4>Supervisor Actions</h4></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Status</label>
                  <select className="employee-select" value={editFormData.status} onChange={handleStatusChange}>
                    <option value={editFormData.status}>{editFormData.status}</option>
                    <option value="waiting">Not Assigned</option>
                    <option value="pending">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                     <option value="approved">Approved</option>
                      <option value="rejected">Reejcted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Task Statuses</label>
                  <button type="button" className="btn-reset-timer" onClick={handleResetTimers}>Reset All Task Statuses</button>
                </div>
              </div>
            </div>
             

            <div className="job-items-section">
  <div className="section-title">
    <h4>Job Tasks</h4>
    <button type="button" className="btn-add-job" onClick={() => addItem('items')}>+ Add Task</button>
  </div>  



  {editFormData.items?.map((item, index) => (
    
    <div key={index} className="job-item-row">
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
      <div className="job-item-field">
        <label>Task #{index + 1}</label>
      </div>

      <div className="form-group">
        <label>Job Type</label>
        <select
          value={item.jobType || ''}
          onChange={(e) => handleJobTypeSelect(index, e.target.value)}
        >
          <option value="">{item.jobType}</option>
          {services.map(service => (
            <option key={service._id} value={service._id}>{service.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={item.description || ''}
          onChange={(e) => handleItemChange(index, 'description', e.target.value, 'items')}
        />
      </div>

        <div className="form-group">
          <label>Estimated Man Hours</label>
          <input
            type="number"
            value={item.estimatedManHours || ''}
            placeholder={item.estimatedManHours}
            onChange={(e) => handleManHoursChange(index, e.target.value)}
          />
        </div>

     <div className="form-group">
  <label>Machine Used</label>
  <select
    value={item.machine.machineId || ''}
    onChange={(e) => handleItemChange(index, 'machine', e.target.value, 'items')}
  >
    <option value="">Select Machine</option>
    {machines.map(machine => (
      <option key={machine._id} value={machine._id}>
        {machine.name}
      </option>
    ))}
  </select>
</div>

      <div className="form-group">
  <label>Machine Hours</label>
  <input
    type="number"
    value={item.machineHours || ''}
    onChange={(e) => handleMachineHoursChange(index, e.target.value)}
  />
</div>

    <div className="form-group">
        <label>Consumables</label>
        {item.consumable?.map((cons, ci) => (
          <div key={ci} className="consumable-row">
            <select
              value={cons.name}
              onChange={(e) => handleConsumableSelect(index, ci, e.target.value)}
            >
              <option value="">-- Select Consumable --</option>
              {consumables.map(c => (
                <option key={c._id} value={c.name}>
                  {c.name} — ₹{c.price}
                </option>
              ))}
            </select>
            <span className="consumable-price">
              {cons.price ? `₹${cons.price}` : '—'}
            </span>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeConsumable(index, ci)}
            >
              ❌
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn-add-job"
          onClick={() => addConsumable(index)}
        >
          + Add Consumable
        </button>
      </div>




      <div className="form-group">
        <label>Estimated Price (₹)</label>
        <input
          type="number"
          value={item.estimatedPrice || ''}
          onChange={(e) => handleItemChange(index, 'estimatedPrice', parseFloat(e.target.value) || 0, 'items')}
        />
      </div>

      <button
        type="button"
        className="btn-remove"
        onClick={() => removeItem(index, 'items')}
        disabled={editFormData.items.length === 1}
      >
        ✕
      </button>
    </div>
  ))}
</div>


            <div className="form-footer edit-footer">
              <button type="button" className="btn-delete-job" onClick={(e)=>{handleDeleteClick(editFormData.id)}}>Delete Job</button>
              <div className="footer-right">
                <div className="total-amount"><span>Total Est. Amount:</span><span className="amount">₹{calculateTotal().toFixed(2)}</span></div>
                <button type="submit" className="btn-save-job">Save Changes</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
}

function SupervisorDashboard({ onLogout }) {
  const [showJobDetails, setShowJobDetails] = useState(true);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToEdit, setJobToEdit] = useState(null);
  const {userInfo}=useAuth();
  const [employeeNames, setEmployeeNames] = useState({});
  const [jobs, setJobs] = useState([]);

const [formData, setFormData] = useState({
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
      consumable:[ {
       name:null,
        price: 0,
      }]
    },
  ],
  machines: [],
  consumables: []
});
  useEffect(() => {
      if (!userInfo) return;
      if (!userInfo.shopId) {
        console.log("⚠️ User info loaded but no shopId found");
        return;
      }
      getAllJobs();
    }, [userInfo]);

useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    }
  }, [jobs, selectedJob]);

const getAllJobs = async () => {
  try {
    const res = await axios.get(`/shop/getAllJobs/${userInfo?.shopId}`);
    if (res.data?.allJobs?.length > 0) {
      console.log(res.data.allJobs)
      // Fetch machine list to resolve names
      const machineRes = await axios.get(`/shop/getAllMachines/${userInfo.shopId}`);
      const machineList = machineRes.data?.machines || [];

      const transformedJobs = res.data.allJobs.map(job => ({
        id: job._id,
        jobCardNumber: job.jobCardNumber,
        customer_name: job.formData?.customer_name || '',
        vehicle_number: job.formData?.vehicle_number || '',
        engine_number: job.formData?.engine_number || '',
        vehicle_model: job.formData?.vehicle_model || '',
        contact_number: job.formData?.contact_number || '',
        date: new Date(job.createdAt || Date.now()).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        status: job.status || 'Not Assigned',
      
        totalEstimatedAmount: job.totalEstimatedAmount || 0,
        items: job.jobItems?.map(item => {
          // Resolve machine name by ID
          const machineId = item.machine?.machineRequired?._id || item.machine?.machineRequired;
          const machineName = machineList.find(m => m._id === machineId)?.name || 'N/A';
          return {
            itemId: item._id,
            jobType: item.itemData?.job_type || '',
            description: item.itemData?.description || '',
            priority: item.itemData?.priority || '',
            estimatedPrice: item.estimatedPrice || 0, 
            estimatedManHours:item.estimatedManHours || 0,
            category:item.category ||'',
            itemStatus: item.itemStatus || 'stopped',
            machine: {
              machineRequired: machineName,
              machineId,
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
                  }))
                  :[]
          };
        }) || []
      }));
      console.log(transformedJobs)

      setJobs(transformedJobs);
    }
  } catch (error) {
    console.error("Error fetching Jobs:", error);
  }
};



  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
      setShowJobDetails(true);
    } else if (jobs.length === 0) {
      setSelectedJob(null);
      setShowJobDetails(false);
    }
  }, [jobs]);

  useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      setSelectedJob(updatedJob || null);
      if (!updatedJob) setShowJobDetails(false);
    }
  }, [jobs, selectedJob?.id]);

  const handleEmployeeSelect = (jobId, employeeId) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const employee = employees.find(e => e.id === employeeId);
        const hasRunningTask = job.items.some(item => item.itemStatus === 'running');
        if (hasRunningTask) {
             alert('Cannot change assigned employee while a job task is running. Please ask the employee to pause first, or use the Edit Job function to reset timers.');
             return job;
        }
        return { ...job, assignedEmployee: employee, status: (job.status === 'Not Assigned' && employee) ? 'Assigned' : job.status };
      }
      return job;
    }));
  };

  const filteredJobs = jobs.filter(job => job.id.toLowerCase().includes(searchQuery.toLowerCase()) || job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || job.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()));

 const calculateJobTotal = (job) => {
  if (!job || !job.items) return 0;
  
  // Sum up all item prices
  const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  
  // Sum up all materials prices from items
  const materialsTotal = job.items.reduce((sum, item) => 
    sum + (item.consumable?.estimatedPrice || 0), 0
  );
  
  return itemsTotal + materialsTotal;
};
  // Save Updated Job
  const handleUpdateJob = (updatedJob) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    if (selectedJob && selectedJob.id === updatedJob.id) {
        setSelectedJob(updatedJob); // Update the view if the selected job was edited
        setShowJobDetails(true); // Ensure details view is shown after edit
    }
  };

  // Delete Job
  const handleDeleteJob = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    
    alert(`Job ${jobId} deleted successfully!`);
       window.location.reload();
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(null);
      setShowJobDetails(false);
    }
  };
  
  // Open Edit Modal for Selected Job
  const openEditModalForSelected = () => {
    if (selectedJob) {
      console.log("JOb model selected for editiong")
      setJobToEdit(selectedJob);
      setShowEditJobModal(true);
    } else {
      alert("Please select a job from the list first.");
    }
  };

  // Open Edit Modal without pre-selection
  const openGeneralEditModal = () => {
      setJobToEdit(null);
      setShowEditJobModal(true);
      setShowJobDetails(false); // Hide details view when opening general edit
      setSelectedJob(null);
  };


 const getSingleUser = async (userId) => {
  if (!userId) return null;
  
  // Check if we already have this user's name
  if (employeeNames[userId]) {
    return employeeNames[userId];
  }
  
  try {
    const res = await axios.get(`/auth/user/${userId}`);
    const name = res.data.user.name;
    
    // Store in state for future use
    setEmployeeNames(prev => ({
      ...prev,
      [userId]: name
    }));
    
    return name;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Fetch names when job is selected or items change
useEffect(() => {
  if (selectedJob?.items) {
    selectedJob.items.forEach(item => {
      if (item.worker.workerAssigned && !employeeNames[item.worker.workerAssigned]) {
        getSingleUser(item.worker.workerAssigned);
      }
    });
  }
}, [selectedJob]);

  return (
    <div className="supervisor-dashboard">
      <Header userRole="Supervisor" onLogout={onLogout} showLogin={false} />
      
      {/* Supervisor Banner */}
      <div className="dashboard-banner supervisor-banner">
         <div className="banner-content"><h2>Supervisor Dashboard</h2><p>Assign jobs, edit details, and track progress</p></div>
         <div className="stats-cards">
           <div className="stat-card"><span className="stat-label">Active Jobs</span><span className="stat-value">{jobs.filter(j => j.status === 'In Progress' || j.status === 'Assigned').length}</span><span className="stat-icon"><img src={refreshIcon} alt="Active"/></span></div>
           <div className="stat-card"><span className="stat-label">Not Assigned</span><span className="stat-value">{jobs.filter(j => j.status === 'Not Assigned').length}</span><span className="stat-icon"><img src={infoIcon} alt="Info"/></span></div>
           <div className="stat-card"><span className="stat-label">Completed</span><span className="stat-value">{jobs.filter(j => j.status === 'Completed').length}</span><span className="stat-icon"><img src={tickIcon} alt="Completed"/></span></div>
         </div>
      </div>

      <div className="dashboard-content">
        {/* Title Section */}
        <div className="dashboard-title-section supervisor-title-section">
          <div className="dashboard-wrapper">
            <div className="dashboard-title"><h2>Job Management</h2><p>Assign, edit, and create new job cards</p></div>
            <div className="action-buttons">
              <button className="btn-action" onClick={openGeneralEditModal}><img src={editIcon} alt="Edit" className="btn-icon-left" /> Edit Job</button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Job List */}
          <div className="job-list-section">
            <div className="section-header"><h3><img src={clipboardIcon} alt="Jobs" className="inline-icon" /> Job Cards</h3></div>
            <input type="text" className="search-input" placeholder="Search by job number, customer or vehicle..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {filteredJobs.length === 0 ? (<div className="no-jobs-found"><p>No jobs found...</p></div>) : (
              filteredJobs.map((job) => (
                <div key={job.id} className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`} onClick={() => { setSelectedJob(job); setShowJobDetails(true);}}>
                  <div className="job-header">
                    <span className="job-number">{job.id}</span>
                    <span className={`status-badge ${ job.status === 'In Progress' ? 'status-progress' : job.status === 'Completed' ? 'status-completed' : job.status === 'Assigned' ? 'status-assigned-active' : 'status-assigned' }`}>{job.status}</span>
                  </div>
                  <p className="job-owner">{job.customer_name}</p>
                  <div className="job-details">
                    <span><img src={userIcon} alt="Vehicle" className="inline-icon" /> {job.vehicle_number}</span>
                    <span><img src={calendarIcon} alt="Date" className="inline-icon" /> {job.date}</span>
                  </div>
                  {job.assignedEmployee && (<p className="job-employee"><img src={workerIcon} alt="Worker" className="inline-icon" /> {job.assignedEmployee.name}</p>)}
                  <p className="job-items">{job.items.length} tasks</p>
                </div>
              ))
            )}
          </div>

          {/* Details Section */}
          <div className="details-section">
            {!showJobDetails && (
              <div className="no-selection">
                <div className="no-selection-icon">
                  <img src={clipboardIcon} alt="No selection" />
                  </div>
                <p>No Selection</p>
                <p className="no-selection-hint">
                  Click a job card to view details or create a new job.
                  </p>
                  </div>
                )}

            {showJobDetails && selectedJob && (
              <div className="job-details-view">
                <div className="form-header">
                  <div className="header-left"><h3><img src={clipboardIcon} alt="Details" className="inline-icon" /> Job Details</h3><p>Job ID: {selectedJob.id}</p></div>
                  <div className="header-right-actions">
                    <button className="btn-edit-selected" onClick={openEditModalForSelected}><img src={editIcon} alt="Edit" className="btn-icon-left small" /> Edit This Job</button>
                    <button className="close-btn" onClick={() => { setShowJobDetails(false); setSelectedJob(null); }}>✕</button>
                  </div>
                </div>
                <div className="job-detail-content">
                   {/* Customer Info */}
                   <div className="job-info-grid">
                     <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div><div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div><div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div><div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div><div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div><div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                     <div><strong>Status:</strong><span className={`status-badge ${ selectedJob.status === 'In Progress' ? 'status-progress' : selectedJob.status === 'Completed' ? 'status-completed' : selectedJob.status === 'Assigned' ? 'status-assigned-active' : 'status-assigned' }`}>{selectedJob.status}</span></div>
                     
                   </div>
                   {/* Job Tasks */}
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
                                                    <p className="item-description">
                                                      {item.worker.workerAssigned && (
                                                        <>Done by {employeeNames[item.worker.workerAssigned] || 'Loading...'}</>
                                                      )}
                                                    </p>
                                                   <div className="item-description">{item.description}</div>

                                                    {item.machine.machineRequired && (
                                                      <div className="job-items-container">
                                                        <strong className="job-items-title">Machine Used:</strong>
                                                        <div className="full-width">
                                                          <p className='machiene-name'><strong>Machine:</strong> {item.machine.machineRequired}</p>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {item.consumable.length > 0 && (
                                                      <div className="job-items-container">
                                                        <strong className="job-items-title">Consumables Used:</strong>
                                                        <div className="full-width">
                                                          {item.consumable.map((cons,index)=>(
                                                            <p key={index} className='job-items-title-Materials'><strong>Materials:</strong> {cons.name}<span> (₹{cons.price})</span></p>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}

                                                   <div className="item-price">₹{item.estimatedPrice.toFixed(2)}</div>
                                                 </div>
                                               </div>
                                             </div>
                                           </div> 
                                         ))}
                   </div>
                   {/* Machines */}
                     {/* {selectedJob.machines.length > 0 && (<div className="job-items-container"><strong className="job-items-title">Machines Used:</strong>{selectedJob.machines.map((machine, index) => (<div key={index} className="job-detail-item simple-item-row"><div className="item-info"><div className="item-title"><strong>{machine.machineType}</strong></div><div className="item-description">{machine.description}</div></div><div className="item-price">${machine.estimatedPrice.toFixed(2)}</div></div>))}</div>)} */}
                   {/* Consumables */}
                   {/* Total */}
                   <div className="job-detail-total"><strong className="total-label">Total Estimated Amount:</strong><strong className="total-amount">₹{calculateJobTotal(selectedJob).toFixed(2)}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      <EditJobModal isOpen={showEditJobModal} onClose={() => setShowEditJobModal(false)} jobs={jobs} initialJobData={jobToEdit} onSave={handleUpdateJob} onDelete={handleDeleteJob} />
    </div>
  );
}

export default SupervisorDashboard;