import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function RegisterStudent({ onStudentRegistered, onBack }) {
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: '',
  })

  const [registeredStudent, setRegisteredStudent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (
      !formData.student_id ||
      !formData.name ||
      !formData.email ||
      !formData.department
    ) {
      setError('Please complete all fields.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register student.')
      }

      setRegisteredStudent(data.student)

      if (onStudentRegistered) {
        onStudentRegistered(data.student)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'Failed to register student.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (registeredStudent) {
    return (
      <div className="page-panel">
        <div className="success-message">
          <div className="success-icon">✓</div>

          <div>
            <h2>Student Registered Successfully!</h2>
            <p>
              The student's QR code has been generated successfully.
            </p>
          </div>
        </div>

        <div className="qr-card" id="qr-print-area">
          <div className="qr-card-header">
            <div className="qr-logo">QR</div>

            <div>
              <h2>QR Attendance</h2>
              <p>Student Attendance Card</p>
            </div>
          </div>

          <div className="qr-code-wrapper">
  <img
    src={registeredStudent.qr_code}
    alt={`QR Code for ${registeredStudent.student_id}`}
    width="220"
    height="220"
  />
</div>

          <div className="student-qr-details">
            <h2>{registeredStudent.name}</h2>

            <div className="student-detail">
              <span>Student ID</span>
              <strong>{registeredStudent.student_id}</strong>
            </div>

            <div className="student-detail">
              <span>Department</span>
              <strong>{registeredStudent.department}</strong>
            </div>

            <div className="student-detail">
              <span>Email</span>
              <strong>{registeredStudent.email}</strong>
            </div>
          </div>

          <p className="scan-instruction">
            Scan this QR code to record attendance.
          </p>
        </div>

        <div className="qr-actions">
          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Students
          </button>

          <button
            className="primary-button"
            onClick={handlePrint}
          >
            🖨 Print QR Code
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-panel">
      <div className="page-heading">
        <h2>Register New Student</h2>

        <p>
          Enter the student's information to create their attendance QR code.
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form
        className="student-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="student_id">
              Student ID
            </label>

            <input
              id="student_id"
              name="student_id"
              type="text"
              placeholder="e.g. STU001"
              value={formData.student_id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter student's full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">
              Department
            </label>

            <input
              id="department"
              name="department"
              type="text"
              placeholder="Enter department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? 'Registering...'
              : 'Generate QR & Register'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterStudent