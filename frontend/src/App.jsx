import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  FaCheckCircle,
  FaClipboardList,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaList,
  FaPlusCircle,
  FaSignOutAlt,
  FaTimes,
  FaTrash,
} from 'react-icons/fa'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import './App.css'
import authBackground from './assets/auth-background.png'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

function useAuth() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('taskManagerAuth')
    return stored ? JSON.parse(stored) : null
  })

  const saveAuth = (data) => {
    localStorage.setItem('taskManagerAuth', JSON.stringify(data))
    setAuth(data)
  }

  const logout = () => {
    localStorage.removeItem('taskManagerAuth')
    setAuth(null)
  }

  return { auth, saveAuth, logout }
}

function AuthLayout({ children, title, subtitle }) {
  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3)
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3)

    event.currentTarget.style.setProperty('--pointer-x', x)
    event.currentTarget.style.setProperty('--pointer-y', y)
  }

  const resetPointer = (event) => {
    event.currentTarget.style.setProperty('--pointer-x', 0)
    event.currentTarget.style.setProperty('--pointer-y', 0)
  }

  return (
    <main
      className="auth-page"
      style={{ '--auth-bg': `url(${authBackground})` }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="auth-grid-layer" aria-hidden="true" />
      <section className="auth-visual" aria-hidden="true">
        <div className="auth-visual-card">
          <FaClipboardList />
          <span>Plan</span>
        </div>
        <div className="auth-visual-card">
          <FaCheckCircle />
          <span>Track</span>
        </div>
        <div className="auth-visual-card">
          <FaList />
          <span>Finish</span>
        </div>
      </section>
      <div className="auth-task-preview" aria-hidden="true">
        <span className="preview-task done"><FaCheckCircle /> Login</span>
        <span className="preview-task active"><FaEdit /> Add task</span>
        <span className="preview-task"><FaClipboardList /> Track status</span>
      </div>
      <div className="auth-flow-board" aria-hidden="true">
        <span className="flow-pill pending">Pending</span>
        <span className="flow-line" />
        <span className="flow-pill working">In progress</span>
        <span className="flow-line" />
        <span className="flow-pill complete">Done</span>
      </div>
      <section className="auth-panel">
        <div className="brand-block">
          <span className="brand-mark">TM</span>
          <div>
            <p className="eyebrow">Task Management</p>
            <h1>{title}</h1>
          </div>
        </div>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </section>
    </main>
  )
}

function Login({ auth, saveAuth }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const successMessage = location.state?.message || ''

  if (auth) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.')
      return
    }

    try {
      setLoading(true)
      const { data } = await api.post('/auth/login', form)
      saveAuth(data)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome" subtitle="Login to manage your personal tasks.">
      <form className="form" onSubmit={handleSubmit}>
        {successMessage && (
          <p className="success alert" role="status">
            {successMessage}
          </p>
        )}
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@example.com"
            disabled={loading}
          />
        </label>
        <label>
          Password
          <span className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Enter password"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              disabled={loading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </span>
        </label>
        {error && (
          <p className="error alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="switch-link">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  )
}

function Register({ auth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const passwordStrength = useMemo(() => {
    if (form.password.length >= 10) {
      return { label: 'Strong password', level: 'strong' }
    }

    if (form.password.length >= 6) {
      return { label: 'Good password', level: 'good' }
    }

    return { label: 'Minimum 6 characters', level: 'weak' }
  }, [form.password])

  if (auth) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('All fields are required.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/register', form)
      navigate('/login', {
        state: { message: 'Account created successfully. Please log in.' },
      })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Register to start tracking your tasks.">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Your name"
            disabled={loading}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@example.com"
            disabled={loading}
          />
        </label>
        <label>
          Password
          <span className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              disabled={loading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </span>
          {form.password && (
            <span className={`password-strength ${passwordStrength.level}`}>
              <span />
              {passwordStrength.label}
            </span>
          )}
        </label>
        {error && (
          <p className="error alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="switch-link">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  )
}

function TaskForm({ onSubmit, editingTask, onCancel, loading }) {
  const [title, setTitle] = useState(editingTask?.title || '')
  const [description, setDescription] = useState(editingTask?.description || '')
  const [taskStatus, setTaskStatus] = useState(editingTask?.status || 'pending')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const submittedTitle = String(formData.get('title') || '')
    const submittedDescription = String(formData.get('description') || '')
    const submittedStatus = String(formData.get('status') || 'pending')

    if (!submittedTitle.trim()) {
      setError('Task title is required.')
      return
    }

    setError('')
    const saved = await onSubmit({
      title: submittedTitle,
      description: submittedDescription,
      status: submittedStatus,
    })

    if (saved && !editingTask) {
      setTitle('')
      setDescription('')
      setTaskStatus('pending')
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Title
          <input
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setError('')
            }}
            placeholder="Prepare project report"
            disabled={loading}
          />
        </label>
        <label>
          Status
          <select
            name="status"
            value={taskStatus}
            onChange={(event) => setTaskStatus(event.target.value)}
            disabled={loading}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>
      <label>
        Description
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add task details"
          rows="3"
          disabled={loading}
        />
      </label>
      {error && (
        <p className="error alert" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
        </button>
        {editingTask && (
          <button
            type="button"
            className="ghost-btn"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function Toast({ toast, onClose }) {
  if (!toast) {
    return null
  }

  return (
    <div
      className={`toast ${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  )
}

const formatDate = (value) => new Date(value).toLocaleDateString()

function Dashboard({ auth, logout }) {
  const [activeView, setActiveView] = useState('overview')
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [overviewSearch, setOverviewSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [editingTask, setEditingTask] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState('')

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${auth?.token}` }),
    [auth?.token],
  )

  const showToast = useCallback((type, message) => {
    setToast({ id: Date.now(), type, message })
  }, [])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/tasks', {
        headers,
        params: { search, status, page, limit: 6 },
      })
      setTasks(data.tasks)
      setPages(data.pages)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [headers, page, search, showToast, status])

  const fetchCompletedTasks = useCallback(async () => {
    try {
      setOverviewLoading(true)
      const { data } = await api.get('/tasks', {
        headers,
        params: {
          search: overviewSearch,
          status: 'completed',
          page: 1,
          limit: 50,
        },
      })
      setCompletedTasks(data.tasks)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Something went wrong')
    } finally {
      setOverviewLoading(false)
    }
  }, [headers, overviewSearch, showToast])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (activeView === 'overview') {
      fetchCompletedTasks()
    }
  }, [activeView, fetchCompletedTasks])

  const filteredCompletedTasks = useMemo(() => {
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (end) {
      end.setHours(23, 59, 59, 999)
    }

    return completedTasks.filter((task) => {
      const completedAt = new Date(task.updatedAt)

      if (start && completedAt < start) {
        return false
      }

      if (end && completedAt > end) {
        return false
      }

      return true
    })
  }, [completedTasks, endDate, startDate])

  const taskStats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length
    const pending = tasks.filter((task) => task.status === 'pending').length

    return {
      completed,
      pending,
      total: tasks.length,
    }
  }, [tasks])

  const handleSearch = (event) => {
    event.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const openTaskList = (nextStatus) => {
    setStatus(nextStatus)
    setPage(1)
    setActiveView('manage')
  }

  const saveTask = async (form) => {
    try {
      setSaving(true)

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, form, { headers })
        showToast('success', 'Task updated successfully')
      } else {
        await api.post('/tasks', form, { headers })
        showToast('success', 'Task added successfully')
      }

      setEditingTask(null)
      await fetchTasks()
      await fetchCompletedTasks()
      setActiveView('manage')
      return true
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Something went wrong')
      return false
    } finally {
      setSaving(false)
    }
  }

  const toggleTask = async (taskId) => {
    try {
      setBusyTaskId(taskId)
      await api.patch(`/tasks/${taskId}/toggle`, {}, { headers })
      showToast('success', 'Status updated successfully')
      await fetchTasks()
      await fetchCompletedTasks()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Something went wrong')
    } finally {
      setBusyTaskId('')
    }
  }

  const handleDelete = async (taskId) => {
    try {
      setBusyTaskId(taskId)
      await api.delete(`/tasks/${taskId}`, { headers })
      showToast('success', 'Task deleted successfully')
      await fetchTasks()
      await fetchCompletedTasks()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Something went wrong')
    } finally {
      setBusyTaskId('')
    }
  }

  const confirmDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      handleDelete(taskId)
    }
  }

  const handleOverviewSubmit = (event) => {
    event.preventDefault()
    fetchCompletedTasks()
  }

  const showTaskForm = (task = null) => {
    setEditingTask(task)
    setActiveView('form')
  }

  const isBusy = loading || overviewLoading || saving || Boolean(busyTaskId)

  return (
    <main className="dashboard-shell">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="avatar">{auth.user.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>Task<br />Management</strong>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <button
            type="button"
            className={activeView === 'overview' ? 'active' : ''}
            disabled={isBusy}
            onClick={() => setActiveView('overview')}
          >
            <FaClipboardList className="nav-icon" />
            <span>Task Overview</span>
          </button>
          <button
            type="button"
            className={activeView === 'manage' && status === 'pending' ? 'active' : ''}
            disabled={isBusy}
            onClick={() => {
              setStatus('pending')
              setPage(1)
              setActiveView('manage')
            }}
          >
            <FaCheckCircle className="nav-icon" />
            <span>Incomplete Tasks</span>
          </button>
          <button
            type="button"
            className={activeView === 'form' && !editingTask ? 'active' : ''}
            disabled={isBusy}
            onClick={() => showTaskForm()}
          >
            <FaPlusCircle className="nav-icon" />
            <span>Create New Task</span>
          </button>
          <button
            type="button"
            className={activeView === 'form' && editingTask ? 'active' : ''}
            disabled={isBusy}
            onClick={() => setActiveView('manage')}
          >
            <FaEdit className="nav-icon" />
            <span>Update Task</span>
          </button>
          <button
            type="button"
            className={activeView === 'manage' && status === 'all' ? 'active' : ''}
            disabled={isBusy}
            onClick={() => {
              setStatus('all')
              setPage(1)
              setActiveView('manage')
            }}
          >
            <FaList className="nav-icon" />
            <span>Manage All Tasks</span>
          </button>
          <button type="button" disabled={isBusy} onClick={logout}>
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="overview-header" id="task-overview">
          <div>
            <h1>Task Overview</h1>
            <p>Monitor and manage your tasks efficiently.</p>
          </div>
        </header>

        <section className="summary-grid" aria-label="Task quick filters">
          <button
            type="button"
            className={`summary-card ${status === 'all' && activeView === 'manage' ? 'active' : ''}`}
            disabled={isBusy}
            onClick={() => openTaskList('all')}
          >
            <span className="summary-icon total"><FaClipboardList /></span>
            <span>
              <strong>{taskStats.total}</strong>
              <small>Visible Tasks</small>
            </span>
          </button>
          <button
            type="button"
            className={`summary-card ${status === 'pending' && activeView === 'manage' ? 'active' : ''}`}
            disabled={isBusy}
            onClick={() => openTaskList('pending')}
          >
            <span className="summary-icon pending"><FaList /></span>
            <span>
              <strong>{taskStats.pending}</strong>
              <small>Pending</small>
            </span>
          </button>
          <button
            type="button"
            className={`summary-card ${status === 'completed' && activeView === 'manage' ? 'active' : ''}`}
            disabled={isBusy}
            onClick={() => openTaskList('completed')}
          >
            <span className="summary-icon completed"><FaCheckCircle /></span>
            <span>
              <strong>{taskStats.completed}</strong>
              <small>Completed</small>
            </span>
          </button>
          <button
            type="button"
            className="summary-card create"
            disabled={isBusy}
            onClick={() => showTaskForm()}
          >
            <span className="summary-icon create"><FaPlusCircle /></span>
            <span>
              <strong>New</strong>
              <small>Add Task</small>
            </span>
          </button>
        </section>

        {activeView === 'overview' && (
          <section className="task-table-panel overview-panel">
            <h2>My Completed Tasks</h2>

            <form className="overview-filters" onSubmit={handleOverviewSubmit}>
              <input
                value={overviewSearch}
                onChange={(event) => setOverviewSearch(event.target.value)}
                placeholder="Search by task..."
                disabled={isBusy}
              />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isBusy}
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={isBusy}
              />
              <button className="primary-btn" type="submit" disabled={isBusy}>
                {overviewLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {overviewLoading ? (
              <p className="empty-state">Loading completed tasks...</p>
            ) : filteredCompletedTasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p>Your completed tasks will appear here.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="overview-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompletedTasks.map((task) => (
                        <tr key={task._id}>
                          <td data-label="Task">{task.title}</td>
                          <td data-label="Description">{task.description || 'No description added.'}</td>
                          <td data-label="Status">
                            <span className={`status ${task.status}`}>{task.status}</span>
                          </td>
                          <td data-label="Created At">{formatDate(task.createdAt)}</td>
                          <td data-label="Updated At">{formatDate(task.updatedAt)}</td>
                          <td data-label="Actions">
                            <div className="task-actions compact-actions">
                              <button
                                type="button"
                                className="icon-action edit-action"
                                disabled={isBusy}
                                onClick={() => showTaskForm(task)}
                                title="Edit task"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                className="icon-action delete-action"
                                disabled={isBusy}
                                onClick={() => confirmDelete(task._id)}
                                title="Delete task"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeView === 'form' && (
          <section className="task-form-panel" id="task-form">
            <h2>{editingTask ? 'Update Task' : 'Create New Task'}</h2>
            <TaskForm
              key={editingTask?._id || 'new-task'}
              editingTask={editingTask}
              loading={saving}
              onCancel={() => {
                setEditingTask(null)
                setActiveView('manage')
              }}
              onSubmit={saveTask}
            />
          </section>
        )}

        {activeView === 'manage' && (
          <section className="task-table-panel" id="task-table">
            <h2>All Tasks</h2>

            <form className="filters" onSubmit={handleSearch}>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by task or description..."
                disabled={isBusy}
              />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
                disabled={isBusy}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <button
                className="primary-btn"
                type="submit"
                disabled={isBusy}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              {(search || searchInput) && (
                <button
                  className="ghost-btn clear-btn"
                  type="button"
                  disabled={isBusy}
                  onClick={clearSearch}
                >
                  <FaTimes /> Clear
                </button>
              )}
            </form>

            {loading ? (
              <p className="empty-state">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p>Create your first task to get started.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td data-label="Task">{task.title}</td>
                        <td data-label="Description">{task.description || 'No description added.'}</td>
                        <td data-label="Status">
                          <span className={`status ${task.status}`}>{task.status}</span>
                        </td>
                        <td data-label="Created At">{formatDate(task.createdAt)}</td>
                        <td data-label="Updated At">{formatDate(task.updatedAt)}</td>
                        <td data-label="Actions">
                          <div className="task-actions">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => toggleTask(task._id)}
                            >
                              {busyTaskId === task._id ? (
                                'Saving...'
                              ) : (
                                <>
                                  <FaCheckCircle /> Toggle
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => showTaskForm(task)}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              type="button"
                              className="danger"
                              disabled={isBusy}
                              onClick={() => confirmDelete(task._id)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pagination">
              <button
                type="button"
                className="ghost-btn"
                disabled={page === 1 || isBusy}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button
                type="button"
                className="ghost-btn"
                disabled={page === pages || isBusy}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

function ProtectedRoute({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { auth, saveAuth, logout } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login auth={auth} saveAuth={saveAuth} />} />
        <Route path="/register" element={<Register auth={auth} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute auth={auth}>
              <Dashboard auth={auth} logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={auth ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
