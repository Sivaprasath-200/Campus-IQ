# 🏫 CampusIQ — Intelligent Campus Resource Allocation System

> **Smarter Spaces. Better Campus.**

CampusIQ is a full-stack intelligent campus resource allocation platform designed to optimize the utilization of classrooms, laboratories, seminar halls, auditoriums, sports facilities, meeting rooms, and other shared campus resources.

Built for an **8-hour AI Hackathon**, CampusIQ combines a deterministic resource allocation engine, real-time/simulated availability, conflict detection, analytics, and an AI-powered natural-language assistant into a single campus management platform.

---

## 🚀 Key Features

### 🧠 Smart Resource Allocation

CampusIQ automatically recommends the most suitable facility based on:

* Facility availability
* Capacity requirements
* Facility type
* Required equipment
* Date and time
* Existing bookings
* User preferences
* Facility utilization
* Student demand
* Scheduling conflicts
* Resource constraints

The allocation process uses **hard-constraint filtering followed by weighted scoring** rather than random room selection.

### ⚡ Allocation Engine

The allocation engine follows two stages:

**Stage 1 — Hard Constraints**

A facility is rejected when:

* It is inactive
* Facility type doesn't match
* Capacity is insufficient
* It is already booked
* Required equipment is unavailable
* A scheduling conflict exists
* A hard requirement is violated

**Stage 2 — Soft Scoring**

Valid facilities are scored using:

```text
Allocation Score =
    Capacity Fit       × 0.25
  + Equipment Match    × 0.20
  + Availability       × 0.20
  + Utilization Balance× 0.15
  + User Preference    × 0.10
  + Demand Balance     × 0.10
```

The final score is normalized to **0–100**.

---

## 🎯 Core Capabilities

| Feature                     | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| Smart Allocation            | Automatically finds suitable facilities                        |
| Conflict Detection          | Detects overlapping bookings                                   |
| Double-Booking Prevention   | Prevents conflicting reservations                              |
| Alternative Recommendations | Suggests compatible alternatives                               |
| Facility Explorer           | Search and filter campus facilities                            |
| Calendar                    | Day, week and month scheduling                                 |
| Booking Management          | Create, approve, reject, modify and cancel bookings            |
| Utilization Analytics       | Analyze resource utilization                                   |
| Demand Analytics            | Identify heavily requested resources                           |
| Underutilization Detection  | Find resources with low utilization                            |
| Conflict Center             | Manage and resolve scheduling conflicts                        |
| Reports                     | Generate utilization, booking and conflict reports             |
| AI Assistant                | Convert natural-language requests into structured requirements |
| Demo Mode                   | Quickly demonstrate the complete system to judges              |

---

# 🖥️ Application Pages

CampusIQ includes:

1. 🔐 Login
2. 📊 Dashboard
3. 🧠 Smart Allocation
4. 🏫 Facility Explorer
5. 🏢 Facility Details
6. 📅 Calendar / Schedule
7. 📋 Booking Management
8. ⚠️ Conflict Center
9. 📈 Utilization Analytics
10. 📄 Reports
11. 👥 Users
12. ⚙️ Settings

Navigation and permissions are role-based.

---

# 👥 User Roles

### ADMIN

Administrators can:

* Manage facilities
* Manage users
* Manage bookings
* Resolve conflicts
* Modify allocation weights
* Configure utilization thresholds
* View analytics
* Generate reports
* Access Demo Mode

### FACULTY

Faculty members can:

* Create resource requests
* Request facility allocation
* View bookings
* Cancel their requests
* View allocated facilities
* Explore facility availability

### STUDENT

Students can:

* Create booking requests
* View their requests
* Cancel their requests
* View allocated facilities

Students cannot:

* Create or delete facilities
* Modify allocation rules
* Resolve administrative conflicts
* Access other users' private information

---

# 🏗️ System Architecture

```text
┌─────────────────────────────┐
│          React UI           │
│   TypeScript + Tailwind     │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│       Node.js + TypeScript  │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌───────────────┐
│ Allocation   │  │ Authentication│
│ Engine       │  │ & RBAC        │
└──────┬───────┘  └───────────────┘
       │
       ▼
┌─────────────────────────────┐
│           MySQL             │
│       Prisma ORM            │
└─────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Recharts
* Lucide React
* Framer Motion

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* MySQL
* Prisma ORM

## Authentication

* JWT / Secure Cookies
* Role-Based Access Control
* Password Hashing

---

# 📁 Project Structure

```text
CampusIQ/
│
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── types/
│       └── charts/
│
├── server/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       ├── allocation/
│       ├── utils/
│       └── types/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── .env.example
├── package.json
└── README.md
```

---

# 🗄️ Database

CampusIQ uses MySQL with Prisma ORM.

### Main Entities

```text
USERS
FACILITIES
EQUIPMENT
FACILITY_EQUIPMENT
BOOKINGS
RESOURCE_REQUESTS
REQUEST_EQUIPMENT
ALLOCATIONS
CONFLICTS
MAINTENANCE
AUDIT_LOGS
```

### Important Relationships

```text
User
 │
 ├── Resource Requests
 ├── Bookings
 └── Audit Logs

Facility
 │
 ├── Equipment
 ├── Bookings
 ├── Allocations
 └── Maintenance

Resource Request
 │
 ├── Required Equipment
 └── Allocation

Booking
 │
 └── Conflict Detection
```

---

# 🔌 REST API

## Authentication

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

## Facilities

```http
GET    /api/facilities
GET    /api/facilities/:id
POST   /api/facilities
PUT    /api/facilities/:id
DELETE /api/facilities/:id
```

## Bookings

```http
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

## Resource Requests

```http
POST /api/requests
GET  /api/requests
GET  /api/requests/:id
```

## Smart Allocation

```http
POST /api/allocation/recommend
POST /api/allocation/confirm
```

## Conflicts

```http
GET  /api/conflicts
POST /api/conflicts/:id/resolve
```

## Analytics

```http
GET /api/analytics/dashboard
GET /api/analytics/utilization
GET /api/analytics/demand
GET /api/analytics/conflicts
```

## Reports

```http
GET /api/reports/utilization
GET /api/reports/bookings
GET /api/reports/conflicts
```

---

# ⚠️ Conflict Detection

CampusIQ detects overlapping bookings using:

```text
existingStart < requestedEnd
AND
existingEnd > requestedStart
```

When a conflict is detected, the system displays:

> **Scheduling Conflict Detected**

The system provides:

* Facility
* Existing booking
* Requester
* Date
* Existing time
* Requested time
* Overlap duration

The backend enforces conflict prevention, ensuring that frontend manipulation cannot create a double booking.

---

# 📊 Utilization Analytics

CampusIQ calculates facility utilization using:

```text
Utilization % =
Booked Available Hours
────────────────────── × 100
Total Available Hours
```

### Utilization Categories

| Utilization | Status           |
| ----------: | ---------------- |
|     `< 40%` | Underutilized    |
| `40% – 80%` | Healthy          |
| `80% – 90%` | High Utilization |
|     `> 90%` | Over-demanded    |

Administrators can configure these thresholds from Settings.

---

# 🤖 AI Assistant

CampusIQ includes an optional natural-language resource assistant.

### Example Request

```text
I need a computer lab for 55 students tomorrow
from 2 to 4 PM with projector and internet.
```

The assistant converts the request into structured requirements:

```json
{
  "facilityType": "Computer Lab",
  "capacity": 55,
  "date": "tomorrow",
  "startTime": "14:00",
  "endTime": "16:00",
  "equipment": [
    "projector",
    "internet"
  ]
}
```

The structured request is then passed to the **actual allocation engine**.

> The AI assistant does not bypass allocation rules or determine booking validity.

---

# 📈 Explainable AI Allocation

Every allocation produces a scoring breakdown.

Example:

```json
{
  "recommendedFacility": {
    "id": 12,
    "name": "Computer Lab 3"
  },
  "score": 94,
  "breakdown": {
    "capacity": 96,
    "equipment": 100,
    "availability": 100,
    "utilization": 88,
    "preference": 90,
    "demand": 86
  },
  "reasons": [
    "Capacity requirement satisfied",
    "All requested equipment available",
    "No scheduling conflict",
    "Available for the entire requested period",
    "Better utilization balance"
  ]
}
```

The explanation is generated from the **actual calculated allocation data**.

---

# 🧪 Demo Data

The project includes realistic seeded campus data.

### Users

```text
1 Admin
8 Faculty
20 Students
```

### Facilities

```text
20 Classrooms
8 Computer Labs
6 Electronics Labs
4 Physics Labs
4 Chemistry Labs
3 Seminar Halls
2 Auditoriums
4 Meeting Rooms
3 Project Rooms
3 Sports Facilities
```

The seed data also includes:

* Equipment
* 100+ historical bookings
* High-utilization facilities
* Low-utilization facilities
* Pending requests
* Historical conflicts
* Department usage patterns

### Departments

```text
ECE
CSE
EEE
MECH
CIVIL
AI & DS
MBA
SCIENCE
```

---

# 🎬 Hackathon Demo Scenario

CampusIQ includes a predefined demonstration scenario.

### Request

```text
Facility Type: Computer Lab
Students: 55
Date: Tomorrow
Time: 2:00 PM – 4:00 PM

Required Equipment:
✓ Computers
✓ Projector
✓ Internet
```

### Expected Flow

```text
Create Request
      ↓
Check Available Labs
      ↓
Apply Hard Constraints
      ↓
Reject Insufficient Capacity
      ↓
Reject Occupied Facilities
      ↓
Check Equipment
      ↓
Calculate Scores
      ↓
Recommend Best Facility
      ↓
Show Alternatives
      ↓
Explain Decision
      ↓
Confirm Booking
      ↓
Update Calendar
      ↓
Update Utilization
      ↓
Update Analytics
```

The demo also attempts a conflicting booking to demonstrate the system's double-booking prevention.

---

# 🔐 Security

CampusIQ implements:

* Password hashing
* Authentication middleware
* Role-based access control
* Server-side validation
* Input sanitization
* Protected APIs
* Authorization checks
* Audit logging

Sensitive operations are restricted according to user role.

---

# ⚡ Real-Time Availability

CampusIQ supports simulated real-time availability.

When a booking is confirmed:

```text
Booking
   ↓
Availability Update
   ↓
Dashboard Update
   ↓
Calendar Update
   ↓
Utilization Update
   ↓
Conflict State Update
```

The application can use polling or WebSockets depending on deployment requirements.

---

# 📄 Reports

CampusIQ supports:

* Facility Utilization Report
* Booking Report
* Conflict Report
* Demand Report
* Allocation Report
* Department Usage Report

Reports can be filtered by:

* Date range
* Facility type
* Department
* Facility

CSV export is supported, with PDF export where configured.

---

# 🎨 UI Design

CampusIQ follows a futuristic smart-campus command-center design.

### Visual Style

* Dark navy / black background
* Cyan / blue accents
* Subtle purple accents
* Glassmorphism cards
* Soft borders
* Minimal glow effects
* Modern typography
* Responsive layouts
* High information density

### UX Features

* Animated cards
* Smooth transitions
* Hover effects
* Skeleton loaders
* Toast notifications
* Modals
* Status badges
* Progress indicators
* Charts
* Calendar UI
* Searchable tables
* Filter chips
* Pagination

---

# 📱 Responsive Design

### Desktop

Full sidebar with complete dashboard.

### Tablet

Collapsible sidebar.

### Mobile

Bottom navigation or collapsible navigation.

Tables automatically become horizontally scrollable or convert into mobile-friendly cards.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CampusIQ.git
cd CampusIQ
```

## 2. Install Dependencies

```bash
npm install
```

If frontend and backend have separate packages:

```bash
cd client
npm install

cd ../server
npm install
```

---

# 🗄️ Database Setup

Make sure MySQL is installed and running.

Create a database:

```sql
CREATE DATABASE campusiq;
```

Create your environment file:

```bash
cp .env.example .env
```

Configure:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/campusiq"

JWT_SECRET="your_secure_secret"
PORT=5000
```

---

# 🔄 Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npx prisma db seed
```

---

# ▶️ Run the Application

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm run client
```

Or, if configured:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🔑 Demo Credentials

### Admin

```text
Email: admin@campusiq.com
Password: password123
```

### Faculty

```text
Email: faculty@campusiq.com
Password: password123
```

### Student

```text
Email: student@campusiq.com
Password: password123
```

---

# 🧠 Business Rule

The most important allocation rule:

> **Hard constraints always come before optimization.**

For example:

```text
Required Capacity = 60

Facility A Capacity = 40
```

Even if Facility A has excellent utilization and equipment scores, it **must be rejected**.

The system never sacrifices a hard requirement to obtain a higher optimization score.

---

# 📌 Performance

The application is designed with scalability in mind.

Implemented considerations include:

* Pagination
* Database indexes
* Efficient SQL queries
* Server-side filtering
* Debounced search
* Caching where useful
* Optimized API responses

Important database indexes include:

```text
Booking Facility
Booking Date
Booking Start/End
Request Date
Facility Type
Facility Status
```

---

# 🏆 Hackathon Value

CampusIQ addresses a practical campus-management problem by combining:

```text
Real Campus Data
       +
Constraint Satisfaction
       +
Optimization
       +
Conflict Detection
       +
Analytics
       +
AI Natural Language
       =
Intelligent Campus Resource Allocation
```

Instead of simply displaying facility information, CampusIQ **actively determines suitable resource assignments and explains the reasoning behind them**.

---

# ✅ Success Criteria

CampusIQ supports:

* ✅ Real-time/simulated facility availability
* ✅ Capacity-aware allocation
* ✅ Schedule-aware allocation
* ✅ Facility-type matching
* ✅ Equipment matching
* ✅ Automatic facility allocation
* ✅ Conflict detection
* ✅ Double-booking prevention
* ✅ Alternative recommendations
* ✅ Underutilization detection
* ✅ Over-demand analysis
* ✅ Interactive dashboard
* ✅ Utilization analytics
* ✅ Reports
* ✅ Explainable allocation decisions
* ✅ Role-based security
* ✅ Responsive UI
* ✅ End-to-end workflow
* ✅ Hackathon Demo Mode

---

# 🔮 Future Enhancements

Potential future improvements:

* IoT-based occupancy detection
* Live campus sensor integration
* Predictive demand forecasting
* Automatic timetable optimization
* Mobile application
* QR-based facility check-in
* Energy-aware facility allocation
* Carbon-aware scheduling
* Multi-campus resource optimization
* Advanced ML demand prediction

---
RUNNING MODEL
https://abstracts-seconds-ross-agencies.trycloudflare.com/

#
