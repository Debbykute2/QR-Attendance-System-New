import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

function RegisterStudent({ onStudentRegistered, onBack }) {
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: '',
  })

  const [registeredStudent, setRegisteredStudent] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (
      !formData.student_id ||
      !formData.name ||
      !formData.email ||
      !formData.department
    ) {
      setError('Please complete all fields.')
      return
    }

    // Temporary frontend registration.
    // We will connect this to the backend later.
    const student = {
      ...formData,
      qrValue: JSON.stringify({
        student_id: formData.student_id,
      }),
    }

    const existingStudents =
  JSON.parse(localStorage.getItem('qr_students')) || []

const updatedStudents = [
  ...existingStudents.filter(
    (item) => item.student_id !== student.student_id
  ),
  student,
]

localStorage.setItem(
  'qr_students',
  JSON.stringify(updatedStudents)
)

    setRegisteredStudent(student)

    if (onStudentRegistered) {
      onStudentRegistered(student)
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
            <QRCodeCanvas
              value={registeredStudent.qrValue}
              size={220}
              level="H"
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
          <button className="secondary-button" onClick={onBack}>
            ← Back to Students
          </button>

          <button className="primary-button" onClick={handlePrint}>
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

      {error && <div className="error-message">{error}</div>}

      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
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
            <label htmlFor="name">Full Name</label>
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
            <label htmlFor="email">Email Address</label>
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
            <label htmlFor="department">Department</label>
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

          <button type="submit" className="primary-button">
            Generate QR & Register
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterStudent