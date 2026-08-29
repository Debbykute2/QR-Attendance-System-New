import { useEffect, useState } from 'react'
import './App.css'

import RegisterStudent from './components/RegisterStudent'
import StudentsList from './components/StudentsList'
import QRScanner from './components/QRScanner'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [studentCount, setStudentCount] = useState(0)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  const navigation = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Register Student', icon: '👨‍🎓' },
    { name: 'Scan Attendance', icon: '📷' },
    { name: 'Students', icon: '👥' },
    { name: 'Attendance', icon: '📋' },
  ]

  const fetchStudentCount = async () => {
    try {
      setDashboardLoading(true)

      const response = await fetch(`${API_URL}/api/students`)

      if (!response.ok) {
        throw new Error('Failed to load students')
      }

      const data = await response.json()

      setStudentCount(data.length)
    } catch (error) {
      console.error('Error loading student count:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentCount()
  }, [])

  const handleStudentRegistered = (student) => {
    console.log('Student registered:', student)

    // Update dashboard immediately after registration
    fetchStudentCount()
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Register Student':
        return (
          <RegisterStudent
            onStudentRegistered={handleStudentRegistered}
            onBack={() => setActivePage('Students')}
          />
        )

      case 'Scan Attendance':
        return <QRScanner />

      case 'Students':
        return (
          <StudentsList
            onRegisterStudent={() => setActivePage('Register Student')}
          />
        )

      case 'Attendance':
        return (
          <div className="page-panel">
            <div className="page-heading">
              <h2>Attendance Records</h2>
              <p>View student attendance records.</p>
            </div>

            <div className="table-container">
              <div className="table-empty">
                <span>📋</span>
                <strong>No attendance records</strong>
                <p>
                  Attendance records will appear here after students check in.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <Dashboard
            onNavigate={setActivePage}
            studentCount={studentCount}
            loading={dashboardLoading}
            onRefresh={fetchStudentCount}
          />
        )
    }
  }

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">QR</div>

          <div>
            <h2>QR Attendance</h2>
            <span>Management System</span>
          </div>
        </div>

        <nav className="navigation">

          <p className="nav-title">MAIN MENU</p>

          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'active' : ''
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}

        </nav>

        <div className="sidebar-footer">
          <div className="version">
            QR Attendance System
            <br />
            Version 1.0
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>{activePage}</h1>
            <p>Student Attendance Management</p>
          </div>

          <div className="user-profile">

            <div className="avatar">
              ADMIN
            </div>

            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>

          </div>

        </header>

        <section className="content">
          {renderPage()}
        </section>

      </main>

    </div>
  )
}


/* DASHBOARD */

function Dashboard({
  onNavigate,
  studentCount,
  loading,
  onRefresh,
}) {
  return (
    <>
      <div className="welcome-section">

        <div>
          <h2>Welcome back! 👋</h2>

          <p>
            Here is today's attendance overview.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>

      </div>


      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon students-icon">
            👨‍🎓
          </div>

          <div>
            <span>Total Students</span>
            <strong>{studentCount}</strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon present-icon">
            ✓
          </div>

          <div>
            <span>Present Today</span>
            <strong>0</strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon absent-icon">
            ✕
          </div>

          <div>
            <span>Absent Today</span>
            <strong>0</strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon attendance-icon">
            %
          </div>

          <div>
            <span>Attendance Rate</span>
            <strong>0%</strong>
          </div>

        </div>

      </div>


      <div className="dashboard-grid">

        {/* RECENT ATTENDANCE */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>Recent Attendance</h3>
              <p>Latest attendance records</p>
            </div>

            <button
              className="secondary-button"
              onClick={() => onNavigate('Attendance')}
            >
              View All
            </button>

          </div>

          <div className="empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h3>No attendance records</h3>

            <p>
              Attendance records will appear here after students check in.
            </p>

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>Quick Actions</h3>
              <p>Common tasks</p>
            </div>

          </div>


          <button
            className="action-button"
            onClick={() => onNavigate('Register Student')}
          >

            <span>👨‍🎓</span>

            <div>
              <strong>Register Student</strong>
              <small>Add a new student</small>
            </div>

            <b>→</b>

          </button>


          <button
            className="action-button"
            onClick={() => onNavigate('Scan Attendance')}
          >

            <span>📷</span>

            <div>
              <strong>Scan Attendance</strong>
              <small>Record student attendance</small>
            </div>

            <b>→</b>

          </button>

        </div>

      </div>
    </>
  )
}

export default App