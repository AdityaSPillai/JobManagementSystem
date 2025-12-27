import { useState, useEffect, useRef } from 'react';
import '../styles/SupervisorDashboard.css';
import useAuth from '../context/context.jsx';
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
import editIcon from '../assets/edit.svg';
import refreshIcon from '../assets/refresh.svg';
import infoIcon from '../assets/info.svg';
import tickIcon from '../assets/tick.svg';
import axios from "../utils/axios.js"
import WorkerSupTimer from './TimerComponent/WorkerSupTimer.jsx';
import MachineSupTimer from './TimerComponent/MachineSupTimer.jsx';
import MachineViewTimer from './TimerComponent/MachineViewTimer.jsx';
import WorkerViewTimer from './TimerComponent/WorkerViewTimer.jsx';

function EditJobModal({ isOpen, onClose, jobs, initialJobData, onSave, onDelete }) {
  const [selectedJobIdInternal, setSelectedJobIdInternal] = useState('');
  const [editFormData, setEditFormData] = useState(null);
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]);
  const { userInfo } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([])
  const [consumables, setConsumables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const jobTypeMappedRef = useRef(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // NEW STATE FOR MODAL SEARCH
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('all');

  const filteredModalJobs = jobs.filter(job => {
    const matchesSearch =
      (job.jobCardNumber || '').toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      (job.customer_name || '').toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      (job.vehicle_number || '').toLowerCase().includes(modalSearchQuery.toLowerCase());

    const matchesFilter =
      modalStatusFilter === 'all' ||
      job.status === modalStatusFilter;

    return matchesSearch && matchesFilter;
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
        const data = res.data.machines;

      } else {
        console.log("No machines found for this shop");
        setMachines([]);
      }

    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };


  const getAllWorkers = async () => {
    try {
      const res = await axios.get(`/shop/getAllWorkers/${userInfo?.shopId}`);
      if (res.data?.users?.length > 0) {
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

  const getAllCustomers = async () => {
    try {
      const res = await axios.get(`/customer/list/${userInfo?.shopId}`);
      if (res.data?.customers) {
        setCustomers(res.data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const [currency, setCurrency] = useState('$');
  const getCurrency = async () => {
    try {
      const res = await axios.get(`/shop/getCurrency/${userInfo?.shopId}`);
      if (res.data?.currency) {
        setCurrency(res.data.currency);
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  useEffect(() => {
    if (!userInfo) return;
    if (!userInfo.shopId) {
      console.log("⚠️ User info loaded but no shopId found");
      return;
    }
    getAllCustomers();
    getAllServices();
    getAllMachines();
    getAllWorkers();
    getAllConsumables();
    getAllCategory();
    getCurrency();
  }, [userInfo]);

  useEffect(() => {
    if (isOpen && initialJobData) {
      jobTypeMappedRef.current = false;
      setSelectedJobIdInternal(initialJobData.id);
      console.log(initialJobData)
      if (isOpen && initialJobData) {
        setEditFormData({
          ...initialJobData,
          items: initialJobData.items.map(item => ({
            ...item,
            machine: Array.isArray(item.machine)
              ? item.machine.map(m => ({
                ...m,
                machineRequired: m.machineRequired
                  ? {
                    _id: m.machineRequired._id,
                    name: m.machineRequired.name
                  }
                  : null,
                machineHours: m.machineHours || 0,
                machineRate: m.machineRate || 0,
                estimatedMachineHours: m.estimatedMachineHours || 0
              }))
              : [],
            consumable: Array.isArray(item.consumable)
              ? item.consumable.map(c => ({
                consumableRef: c.consumableRef,
                name: c.name,
                price: c.price,
                numberOfUsed: c.numberOfUsed || 0,
                available: c.available ?? true
              }))
              : []
          }))
        });
      }

    } else if (isOpen && !initialJobData) {
      setSelectedJobIdInternal('');
      setEditFormData(null);
    }
  }, [isOpen, initialJobData]);

  useEffect(() => {
    if (!editFormData) return;
    if (!Array.isArray(editFormData.items)) return;
    if (!services || services.length === 0) return;
    if (jobTypeMappedRef.current) return; // ✅ prevent loop

    let didUpdate = false;

    const updatedItems = editFormData.items.map(item => {
      if (item.jobTypeId) return item;

      const matchedService = services.find(
        s => s.name === item.jobType
      );

      if (!matchedService) return item;

      didUpdate = true;
      return {
        ...item,
        jobTypeId: matchedService._id
      };
    });

    if (!didUpdate) return;

    jobTypeMappedRef.current = true; // ✅ lock

    setEditFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  }, [services, editFormData]);

  const handleJobSelect = (id) => {
    setSelectedJobIdInternal(id);
    if (id) {
      const jobToEdit = jobs.find(job => job.id === id);
      setEditFormData(JSON.parse(JSON.stringify(jobToEdit)));
    } else {
      jobTypeMappedRef.current = false;
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
    jobTypeMappedRef.current = false;
    setSelectedJobIdInternal('');
    setEditFormData(null);
    onClose();
  };




  const handleItemChange = (index, field, value, type) => {
    setEditFormData(prev => {
      const newItems = [...prev[type]];

      if (field === "machine") {
        return prev;
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
      if (type === 'items')
        newItem = {
          itemId: crypto.randomUUID(),
          jobType: '',
          description: '',
          priority: '',
          category: '',
          estimatedManHours: 0,
          estimatedPrice: 0,
          numberOfWorkers: 1,
          itemStatus: 'pending',

          workers: [],
          machine: [],
          consumable: []
        };
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
    if (window.confirm('Are you sure you want to reset all task statuses to "pending" for this job?')) {
      setEditFormData(prev => ({ ...prev, items: prev.items.map(item => ({ ...item, itemStatus: 'pending' })) }));
      alert('Task statuses reset. Save changes to apply.');
    }
  };

  const handleDeleteClick = async (jobId) => {
    if (window.confirm(`Are you sure you want to permanently delete Job ${editFormData.id}? This action cannot be undone.`)) {
      try {
        const jobs = await axios.delete(`/jobs/delete-job/${jobId}`);
        if (!jobs.data.success) {
          return console.error("unable to delete suer")
        }
        alert("job deleted succesfully");
        handleClose();
      }
      catch (error) {
        console.log(error, error.message)
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        formData: {
          customer_name: editFormData.customer_name,
          vehicle_number: editFormData.vehicle_number,
          engine_number: editFormData.engine_number,
          vehicle_model: editFormData.vehicle_model,
          contact_number: editFormData.contact_number
        },

        jobItems: editFormData.items.map(item => ({
          _id: item._id || item.itemId,

          itemData: {
            job_type: item.jobType || "",
            description: item.description || "",
            priority: item.priority || "Low"
          },

          estimatedPrice: item.estimatedPrice || 0,

          allowedWorkers: [
            {
              category: item.category || "",
              estimatedManHours: item.estimatedManHours || 0,
              numberOfWorkers: item.numberOfWorkers || 1,
              hourlyRate:
                categories.find(c => c.name === item.category)?.hourlyRate || 0
            }
          ],

          status: item.itemStatus || "pending"
        })),

        status: editFormData.status || "pending",
        isVerifiedByUser: true
      };

      console.log("✅ FINAL UPDATE PAYLOAD:", payload);

      const res = await axios.put(
        `/jobs/update-job/${editFormData.id}`,
        payload
      );

      if (res.data.success) {
        alert("✅ Job updated successfully!");
        onSave(editFormData);
        handleClose();
        window.location.reload();
      } else {
        alert("❌ Update failed");
      }

    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Server error while updating job");
    }
  };


  const calculateTotal = () => {
    if (!editFormData || !editFormData.items) return 0;

    return editFormData.items.reduce((total, item) => {
      // Base item price (Labor/Service)
      const itemPrice = item.estimatedPrice || 0;

      // Consumables cost
      const consumablesCost = Array.isArray(item.consumable)
        ? item.consumable.reduce((sum, c) => sum + (c.price || 0), 0)
        : 0;

      // Machine cost
      const machineCost = Array.isArray(item.machine)
        ? item.machine.reduce((sum, m) => sum + (m.machineEstimatedCost || 0), 0)
        : 0;

      return total + itemPrice + consumablesCost + machineCost;
    }, 0);
  };

  if (!isOpen) return null;

  const handleJobTypeSelect = (index, serviceId) => {
    const selectedService = services.find(
      service => String(service._id) === String(serviceId)
    );

    if (!selectedService) return;

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        jobTypeId: selectedService._id,
        jobType: selectedService.name,
        description: selectedService.description || '',
        estimatedPrice: selectedService.price || 0
      };

      return { ...prev, items: updatedItems };
    });
  };

  const handleRemoveConsumable = async (jobId, jobItemId, consumableId, itemIndex) => {
    try {
      await axios.delete(
        `/jobs/remove-consumable/${jobId}/${jobItemId}/${consumableId}`
      );

      setEditFormData(prev => {
        const updatedItems = [...prev.items];
        updatedItems[itemIndex].consumable =
          updatedItems[itemIndex].consumable.filter(
            c => c.consumableRef !== consumableId
          );
        return { ...prev, items: updatedItems };
      });

    } catch (err) {
      console.error(err);
      alert("Failed to remove consumable");
    }
  };

  const handleAddConsumable = async (itemIndex, consumableId) => {
    const selected = consumables.find(
      c => String(c._id) === String(consumableId)
    );
    if (!selected) return;

    const jobItemId = editFormData.items[itemIndex].itemId;

    const res = await axios.put(
      `/jobs/assign-consumable/${editFormData.id}/${jobItemId}`,
      { consumableId },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const saved = res.data.consumable;

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[itemIndex] };

      item.consumable = [
        ...(item.consumable || []),
        {
          consumableRef: saved.consumableRef,
          name: saved.name,
          price: saved.price,
          numberOfUsed: saved.numberOfUsed,
          available: saved.available
        }
      ];

      updatedItems[itemIndex] = item;
      return { ...prev, items: updatedItems };
    });
  };

  const updateConsumableLocal = (itemIndex, consIndex, value) => {
    const qty = parseInt(value, 10) || 0;

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[itemIndex].consumable[consIndex].numberOfUsed = qty;
      return { ...prev, items: updatedItems };
    });
  };

  const submitConsumableQuantity = async (
    jobId,
    jobItemId,
    consumableId,
    quantity
  ) => {
    try {
      await axios.put(
        `/jobs/update-consumable-qty/${jobId}/${jobItemId}/${consumableId}`,
        { quantity }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update consumable quantity");
    }
  };


  const fetchHourlyRate = async (type) => {
    try {
      const res = await axios.get(`/shop/getMachineHourlyRate/${userInfo?.shopId}/${type}`);
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
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        estimatedManHours: manHours,
        estimatedPrice
      };

      // Recalculate total estimated amount
      const totalEstimatedAmount = updatedItems.reduce((sum, item) => {
        const itemPrice = item.estimatedPrice || 0;
        const consumablesCost = Array.isArray(item.consumable)
          ? item.consumable.reduce((s, c) => s + (c.price || 0), 0)
          : 0;
        return sum + itemPrice + consumablesCost;
      }, 0);

      return {
        ...prev,
        items: updatedItems,
        totalEstimatedAmount
      };
    });
  };

  const handleNumberOfWorkersChange = async (index, workers) => {
    const numberOfWorkers = parseFloat(workers) || 0;

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        numberOfWorkers,
      };
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const handleMachineHoursChange = async (itemIndex, machineIndex, hours) => {
    const machineHours = parseFloat(hours) || 0;

    const currentItem = editFormData.items[itemIndex];
    const machineId = currentItem.machine?.[machineIndex]?.machineRequired?._id;

    if (!machineId) return;

    const selectedMachine = machines.find(m => m._id === machineId);
    const type = selectedMachine?.type;

    const rate = await fetchHourlyRate(type);
    const machineEstimatedCost = rate * machineHours;

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      const updatedItem = { ...updatedItems[itemIndex] };

      updatedItem.machine = updatedItem.machine.map((m, i) => {
        if (i === machineIndex) {
          return {
            ...m,
            machineHours,
            machineHourlyRate: rate,
            machineEstimatedCost
          };
        }
        return m;
      });

      updatedItems[itemIndex] = updatedItem;

      return { ...prev, items: updatedItems };
    });

    console.log("✅ Machine Cost Calculated:", {
      machineName: selectedMachine?.name,
      rate,
      hours: machineHours,
      machineEstimatedCost
    });
  };

  const handleEmployeeSelect = async (jobId, itemIndex, employeeId) => {
    if (!employeeId || !jobId) return;

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[itemIndex] };

      const maxWorkers = item.numberOfWorkers || 1;
      const currentWorkers = Array.isArray(item.workers) ? item.workers.length : 0;

      if (currentWorkers >= maxWorkers) {
        alert(`Only ${maxWorkers} worker(s) allowed for this task`);
        return prev;
      }

      item.workers = [
        ...(item.workers || []),
        {
          workerAssigned: employeeId,
          startTime: null,
          endTime: null,
          actualDuration: null,
        }
      ];

      item.itemStatus = 'pending';
      updatedItems[itemIndex] = item;

      return {
        ...prev,
        items: updatedItems
      };
    });

    try {
      await axios.put(
        `/jobs/assign-worker/${employeeId}/${jobId}/${editFormData.items[itemIndex].itemId}`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to assign worker");
    }
  };

  const handleMachineRequiredChange = (itemIndex, machineIndex, machineId) => {
    const selectedMachine = machines.find(m => m._id === machineId);
    console.log("Selected Machine:", selectedMachine);

    setEditFormData(prev => {
      const updatedItems = [...prev.items];
      const updatedMachines = [...updatedItems[itemIndex].machine];

      updatedMachines[machineIndex] = {
        ...updatedMachines[machineIndex],
        machineRequired: {
          _id: selectedMachine._id,
          name: selectedMachine.name
        }

      };

      updatedItems[itemIndex].machine = updatedMachines;

      return { ...prev, items: updatedItems };
    });
  };

  const addMachineToItem = (itemIndex) => {
    setEditFormData(prev => {
      const updated = [...prev.items];

      if (!Array.isArray(updated[itemIndex].machine)) {
        updated[itemIndex].machine = [];
      }

      updated[itemIndex].machine.push({
        machineRequired: null,
        machineHours: 0,
        machineHourlyRate: 0,
        machineEstimatedCost: 0,
        startTime: null,
        endTime: null,
        actualDuration: null
      });

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

  const handleRemoveWorker = async (jobId, jobItemId, workerId) => {
    try {
      await axios.delete(
        `/jobs/remove-worker/${jobId}/${jobItemId}/${workerId}`
      );

      // update UI immediately
      setEditFormData(prev => {
        const updatedItems = prev.items.map(item => {
          if (item.itemId !== jobItemId) return item;

          return {
            ...item,
            workers: item.workers.filter(
              w => String(w.workerAssigned) !== String(workerId)
            )
          };
        });

        return { ...prev, items: updatedItems };
      });

    } catch (err) {
      console.error(err);
      alert("Failed to remove worker");
    }
  };

  const handleRemoveMachine = async (jobId, jobItemId, machineId) => {
    try {
      await axios.delete(
        `/jobs/remove-machine/${jobId}/${jobItemId}/${machineId}`
      );

      // update UI immediately
      setEditFormData(prev => {
        const updatedItems = prev.items.map(item => {
          if (item.itemId !== jobItemId) return item;

          return {
            ...item,
            machine: item.machine.filter(
              m => String(m.machineRequired?._id) !== String(machineId)
            )
          };
        });

        return { ...prev, items: updatedItems };
      });

    } catch (err) {
      console.error(err);
      alert("Failed to remove machine");
    }
  };

  const handleMachineSelect = async (jobId, itemIndex, machineId) => {
    if (!machineId) return;

    const jobItemId = editFormData.items[itemIndex].itemId;

    try {
      await axios.put(
        `/jobs/assign-machine/${machineId}/${jobId}/${jobItemId}`
      );

      // update UI immediately
      setEditFormData(prev => {
        const updatedItems = [...prev.items];
        const item = { ...updatedItems[itemIndex] };

        item.machine = [
          ...(item.machine || []),
          {
            machineRequired: machines.find(m => m._id === machineId),
            startTime: null,
            endTime: null,
            actualDuration: 0
          }
        ];

        updatedItems[itemIndex] = item;
        return { ...prev, items: updatedItems };
      });

    } catch (err) {
      console.error(err);
      alert("Failed to assign machine");
    }
  };

  const StatusLabelMap = {
    waiting: "Waiting",
    pending: "Pending",
    "in_progress": "In Progress",
    completed: "Completed",
    approved: "Approved",
    rejected: "Rejected",
    supapproved: "Supervisor Approved",
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
              <p className="form-subtitle">Search and select a job to edit:</p>

              <div className="search-filter-container">
                <input
                  type="text"
                  placeholder="Search by Customer, Job No, or Vehicle..."
                  className="sdsearch-input"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                />

                <select
                  className="modal-employee-select"
                  value={modalStatusFilter}
                  onChange={(e) => setModalStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="supapproved">Sup Approved</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Search Results List */}
              <div className="search-results-list">
                {filteredModalJobs.slice(0, 5).map(job => (
                  <div
                    key={job.id}
                    className="search-result-item"
                    onClick={() => handleJobSelect(job.id)}
                  >
                    <div className="search-result-item-content">
                      <div className="modal-search-title">
                        {`Job-${job.jobCardNumber?.split("-").pop()}`} — {job.customer_name}
                      </div>
                      <div className="modal-search-meta">
                        {new Date(job.createdAt || Date.now()).toLocaleDateString()} • {job.vehicle_number}
                      </div>
                    </div>
                    <div className="search-result-item-meta">
                      <span className={`status-badge status-${job.status}`}>
                        {StatusLabelMap[job.status]}
                      </span>
                      <div className="modal-search-amount">
                        {currency}{job.totalEstimatedAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredModalJobs.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>
                    No jobs found matching filters
                  </div>
                )}
              </div>
            </div>
          )}

          {editFormData && (
            <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
              {!initialJobData && (<button type="button" className="btn-back" onClick={() => handleJobSelect('')}>&larr; Back to Job Selection</button>)}

              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" value={editFormData.customer_name} disabled />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" value={editFormData.contact_number || ''} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product ID</label>
                  <input type="text" value={editFormData.vehicle_number || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Product Model</label>
                  <input type="text" value={editFormData.vehicle_model || ''} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Serial Number</label>
                  <input type="text" value={editFormData.engine_number || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Customer ID</label>
                  <input type="text" value={editFormData.customerIDNumber} disabled />
                </div>
              </div>

              <div className="job-items-section supervisor-actions">
                <div className="section-title"><h4>Supervisor Actions</h4></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Status</label>
                    <select className="super-action-employee-select" value={editFormData.status} onChange={handleStatusChange}>
                      <option value={editFormData.status}>{editFormData.status}</option>
                      <option value="waiting">Not Assigned</option>
                      <option value="pending">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Task Status</label>
                    <button type="button" className="btn-reset-timer" onClick={handleResetTimers}>Reset All Task Status</button>
                  </div>
                </div>
              </div>

              <div className="job-items-section">
                <div className="section-title">
                  <h4>Job Tasks</h4>
                </div>

                {editFormData.items?.map((item, index) => (
                  <div key={index} className="job-item-row">
                    <div className="job-item-field">
                      <label>Task #{index + 1}</label>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Job Type</label>
                        <select
                          value={item.jobTypeId || ""}
                          onChange={(e) => handleJobTypeSelect(index, e.target.value)}
                        >
                          <option value="">Select Job Type</option>

                          {services.map(service => (
                            <option key={service._id} value={service._id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Man Power Category</label>
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
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Estimated Man Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={item.estimatedManHours ?? ""}
                          placeholder="Estimated Man Hours"
                          onChange={(e) =>
                            handleManHoursChange(index, e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Number of Workers</label>
                        <input
                          type="number"
                          min="1"
                          value={item.numberOfWorkers ?? ""}
                          placeholder="Number of Workers"
                          onChange={(e) =>
                            handleNumberOfWorkersChange(index, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value, 'items')}
                        />
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          value={item.priority || ''}
                          onChange={(e) => handleItemChange(index, 'priority', e.target.value, 'items')}
                        >
                          <option value="">Select Priority</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    {/* --- WORKERS TABLE --- */}
                    <div className="table-section-title">
                      <div className="breaker-btw-section"></div>
                      <span>Workers Assigned</span>
                    </div>
                    {Array.isArray(item.workers) && item.workers.length > 0 ? (
                      <div className="worker-table-wrapper">
                        <table className="worker-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Worker ID</th>
                              <th>Start Time</th>
                              <th>End Time</th>
                              <th>Duration</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {item.workers.map((w, wi) => {
                              const employee = employees.find(
                                e => String(e._id) === String(w.workerAssigned)
                              );

                              return (
                                <WorkerSupTimer
                                  key={w._id || wi}
                                  worker={w}
                                  employee={employee}
                                  jobId={editFormData.id}
                                  itemIndex={index}
                                  selectedJobStatus={editFormData.status}
                                  onRemoveWorker={(workerId) =>
                                    handleRemoveWorker(editFormData.id, item.itemId, workerId)
                                  }
                                />
                              );
                            })}
                          </tbody>
                        </table>

                      </div>
                    ) : (
                      <p style={{ color: '#666' }}>
                        No workers assigned yet for this task
                      </p>
                    )}
                    <select
                      className="edit-modal-employee-select"
                      value=""
                      onChange={(e) => {
                        const selectedEmployeeId = e.target.value;
                        if (selectedEmployeeId) {
                          handleEmployeeSelect(editFormData.id, index, selectedEmployeeId);
                        }
                      }}
                      disabled={
                        item.itemStatus === 'completed' ||
                        item.itemStatus === 'approved' ||
                        editFormData.status === 'approved' ||
                        editFormData.status === 'waiting' ||
                        editFormData.status === 'completed' ||
                        (
                          editFormData.status !== 'rejected' &&
                          Array.isArray(item.workers) &&
                          item.workers.length >= (item.numberOfWorkers || 1)
                        )
                      }
                    >
                      <option value="">Select Employee</option>

                      {employees
                        .filter(emp => emp.specialization === item.category)
                        .filter(emp =>
                          !Array.isArray(item.workers) ||
                          !item.workers.some(w => String(w.workerAssigned) === String(emp._id))
                        )
                        .map(emp => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} {emp.employeeNumber} — {emp.specialization}
                          </option>
                        ))}
                    </select>

                    {/* --- MACHINES TABLE --- */}
                    <div className="breaker-btw-section"></div>
                    <strong className="job-items-title">Machines:</strong>
                    {Array.isArray(item.machine) && item.machine.length > 0 ? (
                      <div className="job-items-container-ed">
                        <div className="machine-table-wrapper">
                          <table className="machine-table">
                            <thead>
                              <tr>
                                <th>Machine Name</th>
                                <th>Machine ID</th>
                                <th>Usage Time</th>
                                <th>Actions</th>
                              </tr>
                            </thead>

                            <tbody>
                              {item.machine.map((m, mi) => (
                                <MachineSupTimer
                                  key={m.machineRequired?._id || mi}
                                  machine={m}
                                  selectedJobStatus={editFormData.status}
                                  onRemoveMachine={(machineId) =>
                                    handleRemoveMachine(
                                      editFormData.id,
                                      item.itemId,
                                      machineId
                                    )
                                  }
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#666' }}>
                        No machines in this task
                      </p>
                    )}
                    <select
                      className="edit-modal-employee-select"
                      value=""
                      onChange={(e) => {
                        const selectedMachineId = e.target.value;
                        if (selectedMachineId) {
                          handleMachineSelect(editFormData.id, index, selectedMachineId);
                        }
                      }}
                      disabled={
                        item.itemStatus === 'completed' ||
                        item.itemStatus === 'approved' ||
                        editFormData.status === 'approved' ||
                        editFormData.status === 'completed'
                      }
                    >
                      <option value="">Add Machine</option>

                      {machines
                        .filter(mac =>
                          !Array.isArray(item.machine) ||
                          !item.machine.some(
                            m => String(m.machineRequired?._id) === String(mac._id)
                          )
                        )
                        .map(mac => (
                          <option key={mac._id} value={mac._id}>
                            {mac.name} — {mac.type}
                          </option>
                        ))}
                    </select>


                    {/* --- CONSUMABLES TABLE --- */}
                    <div className="job-items-container-ed">
                      <div className="breaker-btw-section"></div>
                      <strong className="job-items-title">Consumables:</strong>

                      {Array.isArray(item.consumable) && item.consumable.length > 0 ? (
                        <div className="sdconsumable-table-wrapper">
                          <table className="consumable-table">
                            <thead>
                              <tr>
                                <th>Sl No.</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Used</th>
                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {item.consumable.map((c, ci) => (
                                <tr key={ci}>
                                  <td>{ci + 1}</td>
                                  <td>{c.name}</td>
                                  <td>{currency}{c.price}</td>
                                  <td>{c.numberOfUsed || 0}</td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <input
                                        type="number"
                                        min="0"
                                        value={c.numberOfUsed || 0}
                                        onChange={(e) =>
                                          updateConsumableLocal(index, ci, e.target.value)
                                        }
                                      />

                                      <button
                                        type="button"
                                        className="worker-btn"
                                        onClick={() =>
                                          submitConsumableQuantity(
                                            editFormData.id,
                                            item.itemId,
                                            c.consumableRef,
                                            c.numberOfUsed
                                          )
                                        }
                                      >
                                        Save
                                      </button>

                                      <button
                                        type="button"
                                        className="worker-btn stop"
                                        onClick={() =>
                                          handleRemoveConsumable(
                                            editFormData.id,
                                            item.itemId,
                                            c.consumableRef,
                                            index
                                          )
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#a0aec0', fontStyle: 'italic' }}>
                          No consumables added.
                        </p>
                      )}
                    </div>

                    {/* ADD CONSUMABLE SELECT */}
                    <select
                      className="edit-modal-employee-select"
                      defaultValue=""
                      onChange={(e) => {
                        const consumableId = e.target.value;
                        if (consumableId) {
                          handleAddConsumable(index, consumableId);
                          e.target.value = "";
                        }
                      }}
                      disabled={
                        editFormData.status === 'completed' ||
                        editFormData.status === 'approved'
                      }
                    >
                      <option value="">Add Consumable</option>

                      {consumables
                        .filter(co =>
                          !item.consumable?.some(
                            c => String(c.consumableRef) === String(co._id)
                          )
                        )
                        .map(co => (
                          <option key={co._id} value={co._id}>
                            {co.name} — {currency}{co.price}
                          </option>
                        ))}
                    </select>


                    <div className="breaker-btw-section"></div>
                    <div className="form-row">
                      <div className="form-group">
                        {/* <label>Estimated Price ($)</label> */}
                        <label>Estimated Price</label>
                        <input
                          type="number"
                          value={item.estimatedPrice || ''}
                          disabled
                          className="readonly-input"
                          onChange={(e) => handleItemChange(index, 'estimatedPrice', parseFloat(e.target.value) || 0, 'items')}
                        />
                      </div>
                      <div className="form-group">
                        {/* Implement the system to calculate the actual price with the actual data from the database*/}
                        <label>Actual Price(To Be implemented)</label>
                        <input
                          type="number"
                          value={item.estimatedPrice || ''}
                          disabled
                          className="readonly-input"
                          onChange={(e) => handleItemChange(index, 'estimatedPrice', parseFloat(e.target.value) || 0, 'items')}
                        />
                      </div>
                    </div>

                    <div className="form-row-footer">
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeItem(index, 'items')}
                        disabled={editFormData.items.length === 1}
                      >
                        ✕
                      </button>
                      <button type="button" className="btn-add-job" onClick={() => addItem('items')}>+ Add Task</button>
                    </div>
                  </div>
                ))}
              </div>


              <div className="form-footer edit-footer">
                <button type="button" className="btn-delete-job" onClick={(e) => { handleDeleteClick(editFormData.id) }}>Delete Job</button>
                <div className="footer-right">
                  <div className="total-amount"><span>Total Est. Amount:</span><span className="amount">{currency}{calculateTotal().toFixed(2)}</span></div>
                  <button type="submit" className="btn-save-job">Save Changes</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div >
    </div >
  );
}

function SupervisorDashboard({ onLogout }) {
  const [showJobDetails, setShowJobDetails] = useState(true);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToEdit, setJobToEdit] = useState(null);
  const { userInfo } = useAuth();
  const [employeeNames, setEmployeeNames] = useState({});
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);


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
        consumable: [{
          name: null,
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
        const transformedJobs = res.data.allJobs.map(job => ({
          id: job._id,
          jobCardNumber: job.jobCardNumber,
          customerIDNumber: job.customerIDNumber,
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
          actualTotalAmount: job.actualTotalAmount || 0,
          items: job.jobItems?.map(item => {
            const aw = item.allowedWorkers?.[0] || {};
            return {
              itemId: item._id,
              jobType: item.itemData?.job_type || '',
              description: item.itemData?.description || '',
              priority: item.itemData?.priority || '',
              estimatedPrice: item.estimatedPrice || 0,

              allowedWorkers: item.allowedWorkers || [],
              category: aw.category,
              numberOfWorkers: aw.numberOfWorkers || 1,
              estimatedManHours: aw.estimatedManHours || 0,

              itemStatus: item.status || 'pending',

              machine: Array.isArray(item.machine)
                ? item.machine.map(m => ({
                  machineRequired: m.machineRequired
                    ? {
                      _id: m.machineRequired._id,
                      name: m.machineRequired.name
                    }
                    : null,
                  startTime: m.startTime,
                  endTime: m.endTime,
                  actualDuration: m.actualDuration,
                  machineHours: m.machineHours || 0,
                  machineRate: m.machineRate || 0,
                  estimatedMachineCost: m.estimatedMachineCost || 0
                }))
                : [],

              workers: Array.isArray(item.workers)
                ? item.workers.map(worker => ({
                  workerAssigned: worker.workerAssigned,
                  startTime: worker.startTime,
                  endTime: worker.endTime,
                  actualDuration: worker.actualDuration,
                }))
                : [],

              consumable: Array.isArray(item.consumable)
                ? item.consumable.map(c => ({
                  consumableRef: c.consumableRef,
                  name: c.name,
                  price: c.price,
                  numberOfUsed: c.numberOfUsed || 0,
                  available: c.available ?? true
                }))
                : [],
            };
          }) || []

        }));
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };


  const getAllWorkers = async () => {
    try {
      const res = await axios.get(`/shop/getAllEmployees/${userInfo?.shopId}`);
      if (res.data?.users?.length > 0) {
        setEmployees(res.data.users)
      }

    } catch (error) {
      console.error("Error fetching Workers:", error);
    }
  };


  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
      setShowJobDetails(true);
      getAllWorkers();
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

  const handleEmployeeSelect = async (jobId, itemIndex, employeeId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const item = job.items[itemIndex];
    if (!item) return;

    const maxWorkers =
      item.numberOfWorkers || 1;

    if (item.workers.length >= maxWorkers) {
      alert(`Only ${maxWorkers} worker(s) allowed for this task`);
      return;
    }

    try {
      const res = await axios.put(
        `/jobs/assign-worker/${employeeId}/${jobId}/${item.itemId}`
      );

      if (res.data.success) {
        setJobs(prev =>
          prev.map(j => {
            if (j.id !== jobId) return j;

            const updatedItems = [...j.items];
            updatedItems[itemIndex] = {
              ...item,
              workers: [
                ...item.workers,
                {
                  workerAssigned: employeeId,
                  startTime: null,
                  endTime: null,
                  actualDuration: null
                }
              ],
              itemStatus: 'pending'
            };

            return { ...j, items: updatedItems };
          })
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to assign worker");
    }
  };

  const filteredJobs = jobs.filter(job => job.id.toLowerCase().includes(searchQuery.toLowerCase()) || job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || job.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()));

  const calculateJobTotal = (job) => {
    if (!job || !job.items) return 0;

    // Sum up all item prices
    const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

    // Sum up all materials prices from items
    const materialsTotal = job.items.reduce(
      (sum, item) =>
        sum + (Array.isArray(item.consumable)
          ? item.consumable.reduce((s, c) => s + (c.price || 0), 0)
          : 0),
      0
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

  const [currency, setCurrency] = useState('$');

  const getCurrency = async () => {
    try {
      const res = await axios.get('/currency');
      setCurrency(res.data.currency);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch names when job is selected or items change
  useEffect(() => {
    if (selectedJob?.items) {
      selectedJob.items.forEach(item => {
        if (item.workers.workerAssigned && !employeeNames[item.workers.workerAssigned]) {
          getSingleUser(item.workers.workerAssigned);
        }
      });
    }
    getCurrency();
  }, [selectedJob]);



  const handleSupervisorApprove = async (jobId) => {
    if (!window.confirm("Approve this job and send to QAQC?")) return;

    try {
      const res = await axios.put(`jobs/supervisor-approve/${jobId}`);
      if (res.data.success) {
        alert("✅ Job approved and sent to QAQC");
        getAllJobs();
        setSelectedJob(null);
        setShowJobDetails(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve job");
    }
  };



  const handleQualityBad = async (jobId, userId) => {
    const notes = prompt("Reason for rework:");
    if (!notes) return;

    try {
      const res = await axios.post(
        `jobs/qualityBad/${jobId}/${userId}`,
        { notes }
      );

      if (res.data.success) {
        alert("❌ Job item marked for rework");
        getAllJobs();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark job as bad");
    }
  };

  const calculateActualCost = (job) => {
    if (!job || !Array.isArray(job.items)) return 0;

    return job.items.reduce((jobTotal, item) => {
      const hourlyRate =
        item.allowedWorkers?.[0]?.hourlyRate || 0;

      const workersCost = Array.isArray(item.workers)
        ? item.workers.reduce((sum, worker) => {
          const seconds = worker.actualDuration || 0;
          const hours = seconds / 3600;
          return sum + hours * hourlyRate;
        }, 0)
        : 0;

      const machineCost = Array.isArray(item.machine)
        ? item.machine.reduce((sum, machine) => {
          const seconds = machine.actualDuration || 0;
          const hours = seconds / 3600;
          const rate = machine.machineRate || 0;
          return sum + hours * rate;
        }, 0)
        : 0;

      const consumablesCost = Array.isArray(item.consumable)
        ? item.consumable.reduce((sum, c) => {
          const price = c.price || 0;
          const qty = c.numberOfUsed || 0;
          return sum + price * qty;
        }, 0)
        : 0;
      const itemTotal =
        workersCost + machineCost + consumablesCost;

      return jobTotal + itemTotal;
    }, 0);
  };

  const StatusLabelMap = {
    waiting: "Waiting",
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    approved: "Approved",
    rejected: "Rejected",
    supapproved: "Supervisor Approved",
  };

  const StatusLabelMap1 = {
    waiting: "Waiting",
    pending: "Pending",
    in_progress: "Progress",
    completed: "Completed",
    approved: "Approved",
    rejected: "Rejected",
    supapproved: "Supervisor Approved",
  };


  return (
    <div className="supervisor-dashboard">
      {/* Supervisor Banner */}
      <div className="dashboard-banner supervisor-banner">
        <div className="banner-content"><h2>Supervisor Dashboard</h2><p>Assign jobs, edit details, and track progress</p></div>
        <div className="stats-cards">
          <div className="stat-card"><span className="stat-label">Active Jobs</span><span className="stat-value">{jobs.filter(j => j.status === 'rejected' || j.status === 'pending').length}</span><span className="stat-icon"><img src={refreshIcon} alt="Active" /></span></div>
          <div className="stat-card"><span className="stat-label">Completed</span><span className="stat-value">{jobs.filter(j => j.status === 'completed').length}</span><span className="stat-icon"><img src={infoIcon} alt="Info" /></span></div>
          <div className="stat-card"><span className="stat-label">Approved</span><span className="stat-value">{jobs.filter(j => j.status === 'approved').length}</span><span className="stat-icon"><img src={tickIcon} alt="Completed" /></span></div>
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
                <div key={job.id} className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`} onClick={() => { setSelectedJob(job); setShowJobDetails(true); }}>
                  <div className="job-header">
                    <span className="job-number">
                      {`Job-${job.jobCardNumber?.split("-").pop()}`}
                    </span>
                    <span className={`status-badge status-${job.status}`}>{StatusLabelMap[job.status]}</span>
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
                  <div className="form-header-left">
                    <h3><img src={clipboardIcon} alt="Details" className="inline-icon" /> Job Details</h3>
                    <span className="job-number-title">({selectedJob.jobCardNumber})</span>
                  </div>
                  <div className="form-header-right">
                    <button className="btn-action" onClick={openEditModalForSelected}><img src={editIcon} alt="Edit" className="btn-icon-left" /> Edit Job</button>
                    <button className="close-btn" onClick={() => {
                      setShowJobDetails(false);
                      setSelectedJob(null);
                    }}>✕</button>
                  </div>
                </div>
                <div className="job-detail-content">
                  <div className="job-info-grid-ed">
                    <div><strong>Customer ID Number:</strong> <span>{selectedJob.customerIDNumber}</span></div>
                    <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div>
                    <div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div>
                    <div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div>
                    <div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div>
                    <div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div>
                    <div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                    <div>
                      <strong>Status:</strong>
                      <span className={`status-badge status-${selectedJob.status}`}>
                        {StatusLabelMap[selectedJob.status]}
                      </span>
                    </div>
                  </div>
                  <div className="job-items-container-ed">
                    <div className="breaker-btw-section"></div>
                    <strong className="job-items-title">Job Tasks:</strong>
                    {selectedJob.items.map((item, index) => (

                      <div key={index}>
                        <div className="job-detail-item">
                          <div className="item-header-row">
                            <div className="item-info">
                              <div className="item-info-header">
                                <div className="item-title">
                                  <strong>Job #{index + 1}</strong>
                                  {item.jobType && <span className="item-type">({item.jobType})</span>}
                                </div>
                              </div>
                              <div className="item-description-container">
                                <div className="item-description">{item.description}</div>
                                <div className="item-description">Priority: {item.priority}</div>
                                <div className='item-description'>Estimated Man hours : {item.estimatedManHours}</div>
                                <div className='item-description'>No of Workers : {item.numberOfWorkers}</div>
                                <div className='item-description'>Man Power Category : {item.category}</div>
                                <div className="item-description">
                                  Status: <span className={`status-badge status-${item.itemStatus}`}>{StatusLabelMap[item.itemStatus]}</span>
                                </div>

                              </div>

                              {/*Notes to be displayed here if Notes is not NULL*/}
                              {item.notes && item.notes.trim() !== '' && (
                                <div className="job-items-container-ed">
                                  <div className="breaker-btw-section"></div>
                                  <strong className="job-items-title">Notes:</strong>
                                  <div className="full-width">
                                    <p className="job-notes-text">{item.notes}</p>
                                  </div>
                                </div>
                              )}

                              {Array.isArray(item.machine) && item.machine.length > 0 && (
                                <div className="job-items-container-ed">
                                  <div className="breaker-btw-section"></div>
                                  <strong className="job-items-title">Machines:</strong>

                                  <div className="machine-table-wrapper">
                                    <table className="machine-table">
                                      <thead>
                                        <tr>
                                          <th>Name</th>
                                          <th>Machine ID</th>
                                          <th>Action</th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {item.machine.map((m, mi) => (
                                          <MachineViewTimer
                                            key={m.machineId || mi}
                                            machine={m}
                                            selectedJobStatus={selectedJob.status}
                                          />
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {item.consumable && item.consumable.length > 0 && (
                                <div className="job-items-container-ed">
                                  <div className="breaker-btw-section"></div>
                                  <strong className="job-items-title">Consumables:</strong>

                                  <div className="consumable-table-wrapper">
                                    <table className="consumable-table">
                                      <thead>
                                        <tr>
                                          <th>Sl No.</th>
                                          <th>Name</th>
                                          <th>Price</th>
                                          <th>Used</th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {item.consumable.map((c, i) => (
                                          <tr key={i}>
                                            <td>{i + 1}</td>

                                            <td>{c.name}</td>

                                            <td>{currency}{c.price}</td>

                                            <td>{c.numberOfUsed}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Workers list & per-worker timer controls */}

                          </div>
                          <div className="job-items-container-ed">
                            <div className="breaker-btw-section"></div>
                            <strong className="job-items-title">Workers:</strong>

                            {Array.isArray(item.workers) && item.workers.length > 0 ? (
                              <div className="worker-table-wrapper">
                                <table className="worker-table">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Worker ID</th>
                                      <th>Start Time</th>
                                      <th>End Time</th>
                                      <th>Duration</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {item.workers.map((w, wi) => {
                                      const employee = employees.find(
                                        e => e._id === w.workerAssigned
                                      );

                                      return (
                                        <WorkerViewTimer
                                          key={w._id || wi}
                                          worker={w}
                                          employee={employee}
                                          jobId={selectedJob.id}
                                          itemIndex={index}
                                          selectedJobStatus={selectedJob.status}
                                        />
                                      );
                                    })}
                                  </tbody>
                                </table>

                              </div>
                            ) : (
                              <p style={{ color: '#666' }}>
                                No workers assigned yet for this task
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedJob.status === 'completed' && (
                    <div className="sdquality-buttons">
                      <button
                        className="btn-success"
                        onClick={() => handleSupervisorApprove(selectedJob.id)}
                      >
                        ✅ Approve & Send to QAQC
                      </button>
                      <button
                        className="btn-needs-work"
                        onClick={() =>
                          handleQualityBad(
                            selectedJob.id,
                            userInfo.id
                          )
                        }
                      >
                        ❌ Need Rework
                      </button>
                    </div>
                  )}


                  <div className="cost-wrapper">
                    {selectedJob.status.toLowerCase() !== "waiting" ? (
                      <div className="job-detail-total">
                        <strong className="total-label">Actual cost:</strong>
                        <strong className="total-amount">
                          {currency}{calculateActualCost(selectedJob).toFixed(2)}
                        </strong>
                      </div>
                    ) : (
                      <div>
                        <p></p>
                      </div>
                    )}
                    <div className="job-detail-total">
                      <strong className="total-label">Total Estimated Amount:</strong>
                      <strong className="total-amount">
                        {currency}{(selectedJob?.totalEstimatedAmount || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditJobModal isOpen={showEditJobModal} onClose={() => setShowEditJobModal(false)} jobs={jobs} initialJobData={jobToEdit} onSave={handleUpdateJob} onDelete={handleDeleteJob} />
    </div>
  );
}

export default SupervisorDashboard;