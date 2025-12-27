import React, { useEffect, useState } from "react"
import axios from "../utils/axios.js"
import useAuth from "../context/context.jsx"
import "../styles/CustomerTab.css";

// ---------- Add Category Modal ----------
function AddCategoryModal({ isVisible, onClose, onSubmit }) {
  const [name, setName] = useState("")

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ name })
    setName("")
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-small">
        <div className="modal-header">
          <h3 className="heading-h3">
            <img src="/plus.png" className="plus-icon" />
            Add Service Category
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit">Add Category</button>
        </form>
      </div>
    </div>
  )
}

// ---------- Edit Category Modal ----------
function EditCategoryModal({ isVisible, onClose, onSubmit, category }) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (category) setName(category.name || "")
  }, [category])

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ name })
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-small">
        <div className="modal-header">
          <h3 className="heading-h3">
            <img src="/edit.png" className="edit-icon" />
            Edit Service Category
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit">Update Category</button>
        </form>
      </div>
    </div>
  )
}

// ---------- Main Tab ----------
function ServiceCategoryTab() {
  const { userInfo } = useAuth()
  const shopId = userInfo?.shopId

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const fetchCategories = async () => {
    if (!shopId) return
    try {
      setLoading(true)
      const res = await axios.get(`/shop/serviceCategories/${shopId}`)
      console.log(res.data.serviceCategory)
      setCategories(res.data.serviceCategory || [])
    } catch (err) {
      setError("Failed to fetch service categories")
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async data => {
    await axios.post(`/shop/serviceCategories/${shopId}`, data)
    fetchCategories()
  }

  const updateCategory = async data => {
    await axios.put(
      `/shop/serviceCategories/${shopId}/${editingCategory._id}`,
      data
    )
    fetchCategories()
  }

  const deleteCategory = async id => {
    if (!window.confirm("Delete this category?")) return
    await axios.delete(`/shop/serviceCategories/${shopId}/${id}`)
    fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [shopId])

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Service Category Management</h3>
        <button className="btn-add-new" onClick={() => setAddOpen(true)}>
          + Add Category
        </button>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map(cat => (
              <tr key={cat._id}>
                <td className="table-primary-text">{cat.name}</td>

                <td>
                  <div className="table-actions">
                    <button
                      className="table-cta"
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditOpen(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="table-cta table-cta-danger"
                      onClick={() => deleteCategory(cat._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddCategoryModal
        isVisible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={addCategory}
      />

      <EditCategoryModal
        isVisible={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditingCategory(null)
        }}
        onSubmit={updateCategory}
        category={editingCategory}
      />
    </div>
  )
}

export default ServiceCategoryTab
