import { useEffect, useState } from 'react'
import './App.css'

import RegisterStudent from './components/RegisterStudent'
import StudentsList from './components/StudentsList'
import QRScanner from './components/QRScanner'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [studentCount, setStudentCount] = useState(0)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')

  const navigation = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Register Student', icon: '👨‍🎓' },
    { name: 'Scan Attendance', icon: '📷' },
    { name: 'Students', icon: '👥' },
    { name: 'Attendance', icon: '📋' },
  ]

  // =========================
  // LOAD STUDENTS
  // =========================

  const fetchStudentCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/students`)

      if (!response.ok) {
        throw new Error('Failed to load students')
      }

      const data = await response.json()

      setStudentCount(data.length)
    } catch (error) {
      console.error('Error loading student count:', error)
    }
  }

  // =========================
  // LOAD ATTENDANCE
  // =========================

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true)
      setAttendanceError('')

      const response = await fetch(`${API_URL}/api/attendance`)

      if (!response.ok) {
        throw new Error('Failed to load attendance records')
      }

      const data = await response.json()

      setAttendanceRecords(data)
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendanceError('Unable to load attendance records.')
    } finally {
      setAttendanceLoading(false)
    }
  }

  // =========================
  // LOAD DASHBOARD DATA
  // =========================

  const refreshDashboard = async () => {
    try {
      setDashboardLoading(true)

      await Promise.all([
        fetchStudentCount(),
        fetchAttendance(),
      ])
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    refreshDashboard()
  }, [])

  // =========================
  // AFTER REGISTRATION
  // =========================

  const handleStudentRegistered = (student) => {
    console.log('Student registered:', student)

    fetchStudentCount()
  }

  // =========================
  // AFTER SCANNING
  // =========================

  const handleAttendanceRecorded = async () => {
  await fetchAttendance()
}

  // =========================
  // CALCULATE TODAY'S ATTENDANCE
  // =========================

  const today = new Date()

  const presentTodayRecords = attendanceRecords.filter((record) => {
    if (!record.attendance_time) {
      return false
    }

    const attendanceDate = new Date(record.attendance_time)

    return (
      attendanceDate.getFullYear() === today.getFullYear() &&
      attendanceDate.getMonth() === today.getMonth() &&
      attendanceDate.getDate() === today.getDate()
    )
  })

  // Count unique students who attended today
  const presentStudentIds = new Set(
    presentTodayRecords.map((record) => record.student_id)
  )

  const presentToday = presentStudentIds.size

  const absentToday = Math.max(
    studentCount - presentToday,
    0
  )

  const attendanceRate =
    studentCount > 0
      ? Math.round((presentToday / studentCount) * 100)
      : 0

  // =========================
  // PAGE RENDERING
  // =========================

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
        return (
          <QRScanner
            onAttendanceRecorded={handleAttendanceRecorded}
          />
        )

      case 'Students':
        return (
          <StudentsList
            onRegisterStudent={() => setActivePage('Register Student')}
          />
        )

      case 'Attendance':
        return (
          <AttendancePage
            records={attendanceRecords}
            loading={attendanceLoading}
            error={attendanceError}
            onRefresh={fetchAttendance}
          />
        )

      default:
        return (
          <Dashboard
            onNavigate={setActivePage}
            studentCount={studentCount}
            presentToday={presentToday}
            absentToday={absentToday}
            attendanceRate={attendanceRate}
            attendanceRecords={attendanceRecords}
            loading={dashboardLoading}
            onRefresh={refreshDashboard}
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


/* =========================
   DASHBOARD
   ========================= */

function Dashboard({
  onNavigate,
  studentCount,
  presentToday,
  absentToday,
  attendanceRate,
  attendanceRecords,
  loading,
  onRefresh,
}) {
  const recentAttendance = attendanceRecords.slice(0, 5)

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


      {/* STATISTICS */}

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
            <strong>{presentToday}</strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon absent-icon">
            ✕
          </div>

          <div>
            <span>Absent Today</span>
            <strong>{absentToday}</strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon attendance-icon">
            %
          </div>

          <div>
            <span>Attendance Rate</span>
            <strong>{attendanceRate}%</strong>
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

          {recentAttendance.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>No attendance records</h3>

              <p>
                Attendance records will appear here after students check in.
              </p>

            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>

                  {recentAttendance.map((record) => (

                    <tr key={record.id}>

                      <td>
                        {record.student_id}
                      </td>

                      <td>
                        <strong>
                          {record.name}
                        </strong>
                      </td>

                      <td>
                        {record.department}
                      </td>

                      <td>
                        {record.attendance_time
                          ? new Date(
                              record.attendance_time
                            ).toLocaleString()
                          : '-'}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

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


/* =========================
   ATTENDANCE PAGE
   ========================= */

function AttendancePage({
  records,
  loading,
  error,
  onRefresh,
}) {
  return (
    <div className="page-panel">

      <div className="page-heading-row">

        <div className="page-heading">

          <h2>Attendance Records</h2>

          <p>
            View all student attendance records.
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


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {loading ? (

        <div className="table-empty">

          <span>⏳</span>

          <strong>
            Loading attendance records...
          </strong>

          <p>
            Please wait while the records are loaded.
          </p>

        </div>

      ) : records.length === 0 ? (

        <div className="table-empty">

          <span>📋</span>

          <strong>
            No attendance records
          </strong>

          <p>
            Attendance records will appear here after students check in.
          </p>

        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Attendance Time</th>
              </tr>

            </thead>

            <tbody>

              {records.map((record) => (

                <tr key={record.id}>

                  <td>
                    {record.student_id}
                  </td>

                  <td>
                    <strong>
                      {record.name}
                    </strong>
                  </td>

                  <td>
                    {record.email}
                  </td>

                  <td>
                    {record.department}
                  </td>

                  <td>
                    {record.attendance_time
                      ? new Date(
                          record.attendance_time
                        ).toLocaleString()
                      : '-'}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  )
}

export default App