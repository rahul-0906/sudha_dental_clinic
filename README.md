# Sudha Dental Clinic Management System

A premium, modern Clinic Management System designed for **Sudha Dental Clinic, Sankarankovil** (Lead Doctor: **Dr. Mariyappan**). This system provides dual-workflow capabilities (Solo Mode and Nurse Station Panel), automated patient queue tracking, billing transaction ledgers, inventory stock control, interactive RVG X-ray galleries, and cron-scheduled automated WhatsApp appointment reminders.

---

## 🚀 Key Features

### 1. Dual Workflow Selection (Solo vs. Nurse Mode)
- **Solo Mode**: A unified workspace for clinics running with a single operator. Allows patient lookup, queuing, consultation diagnostics, and checkout collection from one screen.
- **Nurse Mode**: Splitted panels designed for clinics with a front-desk nurse and a consulting doctor.
  - **Nurse Station panel**: Patient registration, queue check-in, and billing checkout processing.
  - **Doctor Workspace**: Consultation record-keeping, prescription management, patient historical timelines, and X-ray management.
- **View Persistence**: Layout choices (`isNurseAvailable`) and active views are cached locally in the browser to survive page refreshes.

### 2. Security & Session Auth
- **Daily PIN Lock**: Locked behind a daily PIN screen. A single authentication code (`1234`) authorizes access for that day, resetting automatically at midnight.

### 3. Patient Queue Tracking
- **Interactive Queue**: Patients progress through queue states: `WAITING` ➡️ `CONSULTATION` ➡️ `CHECKOUT` ➡️ `DONE`.
- **Token Board**: Displays names, token status, elapsed times, and simple button-triggered transitions.

### 4. Consultation & E-Prescriptions
- **Clinical Records**: Allows logging symptoms, clinical notes, and diagnostic records.
- **Dispensing Control**: Searchable dropdown selection of dental consumables and general medicines. Warns operators when dispensing quantities exceed active stock.

### 5. Atomic Checkout & Ledger
- **One-click Checkout**: Saves prescription items, deducts inventory levels, and records transaction entries atomically in a single database transaction.
- **Auto-Ledger**: Creates ledger records split by Consultation Fees and Medicine Sales.

### 6. X-ray / RVG Image Gallery
- **RVG Gallery**: Built-in drag-and-drop X-ray uploader.
- **Lightbox Overlay**: Large image lightbox for close inspection of patient X-rays.

### 7. Financials & Daily Reports
- **Ledger Sheet**: Record expense categories (Supplies, Utilities, Salary) and list cash-flow transactions.
- **Daily Closing Summary**: Aggregated collections, expenses, patient counts, and print-ready format.

### 8. Automated Reminders
- **WhatsApp Scheduler**: A cron job executing daily at 18:00 to query appointments scheduled for tomorrow and generate WhatsApp appointment reminders using the Twilio API format.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Navigation**: React Router DOM v6
- **HTTP Client**: Axios (configured with intercepts for automatic Daily PIN validation headers)
- **Styling**: Modern CSS variables, HSL color palettes, Light Theme accent (`#077A7D`), responsive grid structures.

### Backend
- **Core Framework**: Spring Boot 3.2.x (Java 17)
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: PostgreSQL
- **Scheduling**: Spring Scheduling
- **Build Tool**: Apache Maven

---

## 📦 Project Structure

```
├── backend/                       # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/sudhaclinic/       # Main Source Files
│   │       ├── config/            # Initializers, CORS, File storage configuration
│   │       ├── controller/        # REST Endpoints
│   │       ├── dto/               # Request/Response Data Transfer Objects
│   │       ├── entity/            # JPA Entity Models
│   │       ├── repository/        # Database JPA Repositories
│   │       ├── scheduler/         # Automated WhatsApp Cron Reminders
│   │       └── service/           # Core Business Logic Services
│   ├── src/main/resources/
│   │   ├── application.properties # Application Configuration
│   │   └── import.sql             # SQL Import Seeding scripts
│   └── pom.xml                    # Maven Configuration
│
└── frontend/                      # React SPA Application
    ├── src/
    │   ├── api/                   # API Integration files
    │   ├── components/            # UI components grouped by feature
    │   │   ├── auth/              # PIN Login component
    │   │   ├── checkout/          # Checkout and Billing details
    │   │   ├── consultation/      # Prescription & notes form
    │   │   ├── finance/           # Ledger and daily reports
    │   │   ├── inventory/         # Stock tables
    │   │   ├── layout/            # App Shell layouts (Solo vs Nurse layouts)
    │   │   ├── patient/           # Demographics and Timeline History
    │   │   ├── queue/             # Kanban Queue cards
    │   │   └── xray/              # X-ray manager and Lightbox
    │   ├── store/                 # Redux Toolkit setup
    │   ├── App.jsx                # Route dispatcher
    │   ├── index.css              # Main light mode theme stylesheets
    │   └── main.jsx               # Bootstrap wrapper
    ├── vite.config.js             # Vite build & API proxy setup
    └── package.json               # Node modules list
```

---

## 🚀 Setting Up the Application

### Prerequisites
- **Java**: JDK 17
- **Node.js**: v18 or later
- **Database**: PostgreSQL 15+ (Ensure PostgreSQL is running locally)
- **Build Tools**: Maven 3.8+ & npm

### Database Initialization
Create a blank database in PostgreSQL named `sudha_clinic`:
```sql
CREATE DATABASE sudha_clinic;
```

---

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Open `src/main/resources/application.properties` and verify your credentials:
   ```properties
   server.port=8081
   spring.datasource.url=jdbc:postgresql://localhost:5432/sudha_clinic
   spring.datasource.username=postgres
   spring.datasource.password=admin
   
   # Twilio Credentials (Stubs for WhatsApp notifications)
   twilio.account-sid=YOUR_TWILIO_ACCOUNT_SID
   twilio.auth-token=YOUR_TWILIO_AUTH_TOKEN
   twilio.whatsapp-from=whatsapp:+14155238886
   ```
3. Run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   *Note: On first startup, the database schema will be auto-generated by Hibernate, and default medications will be seeded automatically.*

---

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web workspace in your browser at `http://localhost:5174/`.
5. Enter the daily authentication PIN: **`1234`**.

---

## 👩‍⚕️ Clinical Operations Guide (WORKFLOW.md)
For a complete detailed layout walkthrough, patient check-in guides, diagnostic histories, and checkout procedures, refer to the [WORKFLOW.md](WORKFLOW.md) document at the root of this project.
