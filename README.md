# QR Attendance System

A web-based QR Attendance Management System built with React, Vite, Node.js, Express, and PostgreSQL.

## Features

* Student registration
* Automatic QR code generation
* QR code scanning using the device camera
* Attendance recording
* Student management
* Attendance records
* PostgreSQL database
* REST API
* Responsive web interface

## Technologies Used

### Frontend

* React
* Vite
* HTML5 QR Code

### Backend

* Node.js
* Express.js
* PostgreSQL
* `pg`
* `qrcode`
* `dotenv`
* `cors`

## Project Structure

```text
QR-Attendance-System/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QRScanner.jsx
│   │   │   ├── RegisterStudent.jsx
│   │   │   └── StudentsList.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── database/
│   │   └── db.js
│   ├── routes/
│   │   ├── students.js
│   │   └── attendance.js
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## API Endpoints

### Students

```text
POST /api/students
GET  /api/students
GET  /api/students/:student_id
```

### Attendance

```text
POST /api/attendance
GET  /api/attendance
```

### API Test

```text
GET /api/test
```

## Database

The application uses PostgreSQL.

Two main tables are created automatically when the server starts:

* `students`
* `attendance`

The database connection is configured using the `DATABASE_URL` environment variable.

## Environment Variables

Create a `.env` file inside the `server` directory:

```env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=5000
```

The `.env` file is excluded from Git using `.gitignore`.

## Running Locally

### Backend

```bash
cd server
npm install
npm start
```

The API runs on:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Deployment

The planned deployment setup is:

* Frontend: Vercel
* Backend: Render
* Database: Render PostgreSQL

## Author

Deborah Okon

GitHub: Debbykute2
