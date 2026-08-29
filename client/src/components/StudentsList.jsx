import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const API_URL = import.meta.env.VITE_API_URL

function StudentsList() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/api/students`)

      if (!response.ok) {
        throw new Error('Failed to load students')
      }

      const data = await response.json()

      setStudents(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load students.')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase()

    return (
      student.student_id?.toLowerCase().includes(searchText) ||
      student.name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.department?.toLowerCase().includes(searchText)
    )
  })

  const openQR = (student) => {
    setSelectedStudent(student)
  }

  const closeQR = () => {
    setSelectedStudent(null)
  }

  const printQR = () => {
    window.print()
  }

  return (
    <>
      <div className="page-panel">

        <div className="page-heading-row">
          <div className="page-heading">
            <h2>Students</h2>
            <p>View and manage registered students.</p>
          </div>

          <div className="student-count">
            {students.length} Student{students.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="student-search">
          <input
            type="text"
            placeholder="Search by student ID, name, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="table-empty">
            <span>⏳</span>
            <strong>Loading students...</strong>
            <p>Please wait while the student list is loaded.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="table-empty">
            <span>👥</span>
            <strong>
              {students.length === 0
                ? 'No students registered yet'
                : 'No students found'}
            </strong>

            <p>
              {students.length === 0
                ? 'Registered students will appear here.'
                : 'Try a different search term.'}
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
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id || student.student_id}>

                    <td>{student.student_id}</td>

                    <td>
                      <strong>{student.name}</strong>
                    </td>

                    <td>{student.email}</td>

                    <td>{student.department}</td>

                    <td>
                      <button
                        className="view-qr-button"
                        onClick={() => openQR(student)}
                      >
                        View QR
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

      </div>

      {/* QR MODAL */}

      {selectedStudent && (
        <div
          className="qr-modal-overlay"
          onClick={closeQR}
        >

          <div
            className="qr-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-qr-button"
              onClick={closeQR}
              aria-label="Close"
            >
              ×
            </button>

            <div id="student-qr-print">

              <div className="qr-card">

                <div className="qr-card-header">

                  <div className="qr-logo">
                    QR
                  </div>

                  <div>
                    <h2>QR Attendance</h2>
                    <p>Student Attendance Card</p>
                  </div>

                </div>

                <div className="qr-code-wrapper">

                  <QRCodeCanvas
                    value={JSON.stringify({
                      student_id: selectedStudent.student_id,
                      name: selectedStudent.name,
   })}
                  size={220}
                  level="H"
            />

                </div>

                <div className="student-qr-details">

                  <h2>{selectedStudent.name}</h2>

                  <div className="student-detail">
                    <span>Student ID</span>
                    <strong>
                      {selectedStudent.student_id}
                    </strong>
                  </div>

                  <div className="student-detail">
                    <span>Department</span>
                    <strong>
                      {selectedStudent.department}
                    </strong>
                  </div>

                  <div className="student-detail">
                    <span>Email</span>
                    <strong>
                      {selectedStudent.email}
                    </strong>
                  </div>

                  <p className="scan-instruction">
                    Scan this QR code to record attendance.
                  </p>

                </div>

              </div>

            </div>

            <div className="qr-actions">

              <button
                className="secondary-button"
                onClick={closeQR}
              >
                ← Close
              </button>

              <button
                className="primary-button"
                onClick={printQR}
              >
                🖨 Print QR Code
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  )
}

export default StudentsList