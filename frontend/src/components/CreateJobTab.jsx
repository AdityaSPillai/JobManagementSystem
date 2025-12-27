import { useState, useEffect } from "react";
import axios from "../utils/axios.js";
import "../styles/EstimatorDashboard.css";
import useAuth from '../context/context.jsx';


export default function CreateJobCard({ onClose, onJobCreated }) {
  const { userInfo } = useAuth();

  /* =======================
     STATE (EXACT COPY)
     ======================= */
  const [services, setServices] = useState([]);
  const [machines, setMachines] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [consumableQty, setConsumableQty] = useState({});
  const [currency, setCurrency] = useState("$");

  const [formData, setFormData] = useState({
    templateId: "68f50077a6d75c0ab83cd019",
    customerIDNumber: "",
    isVerifiedByUser: false,
    shopId: userInfo?.shopId || "",
    formData: {
      customer_name: "",
      vehicle_number: "",
      engine_number: "",
      vehicle_model: "",
      contact_number: "",
    },
    jobItems: [
      {
        itemData: {
          job_type: "",
          description: "",
          priority: "",
        },
        estimatedPrice: 0,
        category: "",
        estimatedManHours: 0,
        numberOfWorkers: 1,
        hourlyRate: 0,
        machine: [],
        consumable: [],
      },
    ],
  });

  /* =======================
     FETCH DATA (EXACT)
     ======================= */
  useEffect(() => {
    if (!userInfo?.shopId) return;

    axios.get(`/shop/allServices/${userInfo.shopId}`).then(r => setServices(r.data?.shop?.services || []));
    axios.get(`/shop/getAllMachines/${userInfo.shopId}`).then(r => setMachines(r.data?.machines || []));
    axios.get(`/shop/allConsumables/${userInfo.shopId}`).then(r => setConsumables(r.data?.consumables || []));
    axios.get(`/shop/allCategories/${userInfo.shopId}`).then(r => setCategories(r.data?.categories || []));
    axios.get(`/customer/list/${userInfo.shopId}`).then(r => setCustomers(r.data?.customers || []));
    getCurrency();
  }, [userInfo]);

  /* =======================
     HELPERS (UNCHANGED)
     ======================= */
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  };

  const updateJobItemField = (index, key, value) => {
    setFormData(prev => {
      const items = [...prev.jobItems];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, jobItems: items };
    });
  };

  const handleJobItemChange = (index, field, value) => {
    setFormData(prev => {
      const items = [...prev.jobItems];
      const item = { ...items[index] };

      if (["job_type", "description", "priority"].includes(field)) {
        item.itemData = { ...item.itemData, [field]: value };
      } else {
        item[field] = value;
      }

      items[index] = item;
      return { ...prev, jobItems: items };
    });
  };

  const addJobItem = () => {
    setFormData(prev => ({
      ...prev,
      jobItems: [
        ...prev.jobItems,
        {
          itemData: { job_type: "", description: "", priority: "" },
          estimatedPrice: 0,
          category: "",
          estimatedManHours: 0,
          numberOfWorkers: 1,
          hourlyRate: 0,
          machine: [],
          consumable: [],
        },
      ],
    }));
  };

  const removeJobItem = (index) => {
    if (formData.jobItems.length === 1) return;
    setFormData(prev => ({
      ...prev,
      jobItems: prev.jobItems.filter((_, i) => i !== index),
    }));
  };
  const addMachineToItem = (index) => {
    setFormData(prev => {
      const items = [...prev.jobItems];

      items[index] = {
        ...items[index],
        machine: [
          ...(items[index].machine || []),
          {
            machineRequired: null,
            machineHours: 0,
            machineHourlyRate: 0,
            machineEstimatedCost: 0,
          }
        ]
      };

      return { ...prev, jobItems: items };
    });
  };

  const removeMachineFromItem = (itemIndex, machineIndex) => {
    setFormData(prev => {
      const items = [...prev.jobItems];
      items[itemIndex].machine = items[itemIndex].machine.filter((_, i) => i !== machineIndex);
      return { ...prev, jobItems: items };
    });
  };

  const fetchHourlyRate = async (type) => {
    const res = await axios.get(`/shop/getMachineHourlyRate/${userInfo.shopId}/${type}`);
    return res.data?.rate || 0;
  };
  const fetchManPowerHourlyRate = async (type) => {
    const res = await axios.get(`/shop/getManPowerHourlyRate/${userInfo.shopId}/${type}`);
    return res.data?.rate || 0;
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

  const handleMachineRequiredChange = async (itemIndex, machineIndex, machineId) => {
    const machine = machines.find(m => m._id === machineId);
    if (!machine) return;

    const rate = await fetchHourlyRate(machine.type);

    setFormData(prev => {
      const items = [...prev.jobItems];
      items[itemIndex].machine[machineIndex] = {
        ...items[itemIndex].machine[machineIndex],
        machineRequired: machineId,
        machineHourlyRate: rate,
      };
      return { ...prev, jobItems: items };
    });
  };

  const handleMachineHoursChange = async (itemIndex, machineIndex, hours) => {
    const hrs = parseFloat(hours) || 0;
    const machineId = formData.jobItems[itemIndex].machine[machineIndex]?.machineRequired;
    if (!machineId) return;

    const machine = machines.find(m => m._id === machineId);
    const rate = await fetchHourlyRate(machine.type);

    setFormData(prev => {
      const items = [...prev.jobItems];
      items[itemIndex].machine[machineIndex] = {
        ...items[itemIndex].machine[machineIndex],
        machineHours: hrs,
        machineHourlyRate: rate,
        machineEstimatedCost: hrs * rate,
      };
      return { ...prev, jobItems: items };
    });
  };

  /* =======================
     TOTAL CALC (EXACT)
     ======================= */
  const calculateFormTotal = () => {
    const itemsTotal = formData.jobItems.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
    const machineTotal = formData.jobItems.reduce(
      (s, i) => s + i.machine.reduce((m, x) => m + (x.machineEstimatedCost || 0), 0),
      0
    );
    const consumableTotal = formData.jobItems.reduce(
      (s, i, idx) =>
        s +
        i.consumable.reduce(
          (c, x, ci) => c + (x.price || 0) * (consumableQty[`${idx}-${ci}`] || 0),
          0
        ),
      0
    );
    return itemsTotal + machineTotal + consumableTotal;
  };

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

  /* =======================
     SAVE JOB (UNCHANGED)
     ======================= */
  const handleSaveJob = async () => {
    if (!formData.formData.customer_name || !formData.formData.vehicle_number) {
      alert("Required fields missing");
      return;
    }

    const payload = {
      templateId: formData.templateId,
      isVerifiedByUser: false,
      shopId: userInfo.shopId,
      customerIDNumber: formData.customerIDNumber,
      formData: formData.formData,
      jobItems: formData.jobItems.map(item => ({
        itemData: item.itemData,
        estimatedPrice:
          item.estimatedPrice +
          item.machine.reduce((s, m) => s + (m.machineEstimatedCost || 0), 0),
        numberOfWorkers: item.numberOfWorkers,
        category: item.category,
        estimatedManHours: item.estimatedManHours,
        machine: item.machine,
        consumable: item.consumable,
      })),
    };

    await axios.post("/jobs/new-job", payload);
    alert("Job card created successfully");
    window.location.reload();

    onJobCreated?.();
    onClose?.();
  };

  /* =======================
     JSX — EXACT COPY
     ======================= */
  return (
    <div className="create-job-form">
      <div className="create-job-form">
        <div className="form-header">
          <h3 className="add-job-heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon" /> <span className="new-job-card">Create New Job Card</span> </h3>
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
                    customerIDNumber: selectedCustomer.customerIDNumber,
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
                    <span className="add-con-wrapper">
                      <img src="/plus.png" alt="Plus Icon" className="plus-icon-con" />
                      Add Machine
                    </span>
                  </button>
                </div>

                <div className="form-group-machines-header">
                  {Array.isArray(item.machine) && item.machine.length > 0 ? (
                    item.machine.map((machine, machineIndex) => (
                      <div key={machineIndex} className="machine-entry">
                        <div className="machine-left">
                          {/* SAME AS consumable-entry-select */}
                          <select
                            className="machine-entry-select"
                            value={machine.machineRequired || ""}
                            onChange={(e) =>
                              handleMachineRequiredChange(index, machineIndex, e.target.value)
                            }
                          >
                            <option value="">--Select Machine--</option>

                            {machines.map((m) =>
                              m.isAvailable ? (
                                <option key={m._id} value={m._id}>
                                  {m.name} - {m.type}
                                </option>
                              ) : null
                            )}
                          </select>

                          {/* SAME AS consumable-quantity-input */}
                          <input
                            type="number"
                            className="machine-quantity-input"
                            placeholder="Hours"
                            value={machine.machineHours || ""}
                            onChange={(e) =>
                              handleMachineHoursChange(index, machineIndex, e.target.value)
                            }
                            min="0"
                            step="0.5"
                          />

                          {/* REMOVE BUTTON (mirrors consumable) */}
                          {item.machine.length > 0 && (
                            <button
                              type="button"
                              className="machine-remove-btn"
                              onClick={() => removeMachineFromItem(index, machineIndex)}
                            >
                              ❌
                            </button>
                          )}
                        </div>

                        <div className="machine-right">
                          {/* Machine Cost Display */}
                          {machine.machineHourlyRate > 0 && (
                            <p className="machine-cost-info">
                              Rate: {currency}{machine.machineHourlyRate}/hr | Cost: {currency}
                              {(machine.machineEstimatedCost || 0).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // <button
                    //   type="button"
                    //   className="btn-add-job"
                    //   onClick={() => addMachineToItem(index)}
                    // >
                    //   <img src="/plus.png" alt="Plus Icon" className="plus-icon-con" /> Add Machine
                    // </button>
                    <span></span>
                  )}
                </div>

                {/* Leave original class name as requested */}
                {Array.isArray(item.machine) && item.machine.length > 0 && (
                  <div className="machine-total-cost">
                    Total Machine Cost: {currency}
                    {item.machine
                      .reduce((sum, m) => sum + (m.machineEstimatedCost || 0), 0)
                      .toFixed(2)}
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
                          {cOpt.name} - {currency}{cOpt.price}{(cOpt.quantity) ? ` (In Stock: )` : 'Out of Stock'}
                        </option>
                      ))}
                      <option value="manual">+ Add Manual Consumable</option>
                    </select>
                    {!c.isManual && (
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
                    )}
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
                          // placeholder="Price ($)"
                          placeholder="Price"
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
                    <span className="add-con-wrapper"><img src="/plus.png" alt="Plus Icon" className="plus-icon-con" /> Add Consumable</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div>
            <button className="btn-add-task-job" onClick={addJobItem}>+ Add Task</button>
          </div>
        </div>
        <div className="form-footer">
          <div className="total-amount">
            <span>Total Estimated Amount:</span>
            <span className="amount">{currency}{calculateFormTotal().toFixed(2)}</span>
          </div>
          <button className="btn-save-job" onClick={handleSaveJob}>Save Job Card</button>
        </div>
      </div>
    </div>
  );
}
