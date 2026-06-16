# Sudha Dental Clinic Management System — Architecture & Developer Guide

This master documentation provides an in-depth view of the system architecture, directory structure, data flow, database models, and deployment configurations of the **Sudha Dental Clinic Management System**.

---

## 1. High-Level System Architecture

The application is designed as a secure, containerized, multi-tier Single Page Application (SPA). The architecture follows a standard client-server pattern communicating via a REST API.

```
                  ┌──────────────────────────────┐
                  │      Client Browser          │
                  │  (React 18 / Tailwind v4)    │
                  └──────────────┬───────────────┘
                                 │ HTTP requests (port 5174)
                                 ▼
                  ┌──────────────────────────────┐
                  │    Nginx Reverse Proxy       │
                  │   (Container: frontend)      │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┴──────────────────────┐
         │ Static Assets (/index.html)                  │ REST Proxy Pass (/api/*)
         ▼                                              ▼
┌──────────────────┐                           ┌──────────────────┐
│  Vite SPA Build  │                           │   Spring Boot    │
│  Static Files    │                           │ (Container: bnd) │
└──────────────────┘                           └────────┬─────────┘
                                                        │ JDBC (port 5432)
                                                        ▼
                                               ┌──────────────────┐
                                               │   PostgreSQL 15  │
                                               │  (Container: db) │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ Persistent Volume│
                                               │  (postgres_data) │
                                               └──────────────────┘
```

### Component Details
1. **Frontend (Vite / React 18 / Tailwind CSS v4)**: A fluid, responsive SPA served on port `5174`. The layout is built around the "Clinical Teal" design system using HSL colors, soft borders, and minimalist iconography from `lucide-react`.
2. **Reverse Proxy (Nginx)**: Embedded within the frontend container. It serves built Vite static assets and acts as a reverse proxy, forwarding requests from `/api` directly to the Spring Boot backend service on `http://backend:8081`.
3. **Backend (Java 23 / Spring Boot 3.2.x)**: Exposes a standard RESTful API on port `8081`. It utilizes Spring Data JPA + Hibernate for persistence, Spring Validation, and `@Scheduled` cron jobs.
4. **Database (PostgreSQL 15)**: Relational database engine running inside the `clinic-db` container. Port `5432` is exposed to allow local developer diagnostics, while database schemas are automatically updated via Hibernate.

---

## 2. Directory Structure

Below is the directory tree for both the frontend and backend modules of the project, including descriptions of the major packages, views, and store slices.

```
sudha-dental-clinic/
├── docker-compose.yml              # Multi-container deployment configuration
├── start.bat                       # Script to run local environment components
├── README.md                       # Local installation manual
├── WORKFLOW.md                     # Staff & Doctor operational routines
│
├── frontend/                       # React 18 UI Module (Vite)
│   ├── Dockerfile                  # Multi-stage Docker config for Node/Nginx
│   ├── nginx.conf                  # Nginx proxy pass and router fallback configuration
│   ├── vite.config.js              # Vite server & proxy configuration
│   ├── tailwind.config.js          # Tailwind CSS v4 styling rules
│   ├── package.json                # Frontend dependencies & Node 24 target
│   └── src/
│       ├── main.jsx                # App bootstrap mounting Redux and Router
│       ├── App.jsx                 # Root router & PIN verification layout router
│       ├── index.css               # Global styling system (Clinical Teal palette)
│       │
│       ├── api/                    # Axios API service adapters
│       │   ├── axios.js            # Axios client with interceptor for daily PIN headers
│       │   ├── patients.js         # Patient search and registry HTTP clients
│       │   ├── visits.js           # Queue status updates & atomic checkout clients
│       │   ├── medications.js      # Medication stock and inventory CRUD clients
│       │   └── transactions.js     # Ledger income/expense HTTP clients
│       │
│       ├── store/                  # Redux State Management
│       │   ├── index.js            # Main Redux store configurator
│       │   └── slices/
│       │       ├── appSlice.js     # Manages Workspace View & Staff Available toggle state
│       │       ├── patientSlice.js # Manages selected patient details and histories
│       │       └── queueSlice.js   # Manages patient queue tracking states
│       │
│       └── components/             # UI Components (Lucide Icons, strokeWidth={1.5})
│           ├── auth/               # PIN Authentication screen components
│           ├── layout/             # AppShell, StaffLayout, and SoloLayout
│           ├── patient/            # Search bar & registration dialog components
│           ├── queue/              # Kanban board and status tracker components
│           ├── consultation/       # Diagnostic fields & medicine selection cards
│           ├── checkout/           # Financial invoices & atomic checkout panels
│           ├── xray/               # X-ray file dropzones & lightboxes
│           ├── inventory/          # Medication tables & stock controllers
│           └── finance/            # Ledger tables and Daily closing reports
│
└── backend/                        # Spring Boot API Module
    ├── Dockerfile                  # Multi-stage build (Maven compiler -> Temurin JRE 23)
    ├── pom.xml                     # Maven project configuration (Lombok & Javac compiler v23)
    └── src/main/
        ├── resources/
        │   └── application.properties # Server ports, DB credentials, and Meta Cloud API keys
        └── java/com/sudhaclinic/
            ├── ClinicApplication.java # Spring Boot startup context
            │
            ├── config/
            │   ├── CorsConfig.java       # Global CORS rules mapping to port 5174
            │   ├── FileStorageConfig.java# Setup and folder creation for X-ray file paths
            │   └── DataInitializer.java  # Seed database with default medicines on boot
            │
            ├── controller/               # REST Endpoints
            │   ├── AuthController.java   # Daily PIN authentication verification
            │   ├── PatientController.java# Register and browse patient logs
            │   ├── VisitController.java  # Manage queue additions and atomic checkouts
            │   ├── MedicationController.java # Stock updates & low stock diagnostics
            │   ├── TransactionController.java# Ledger registry endpoints
            │   ├── XrayController.java   # X-ray uploads & local filesystem resource server
            │   └── ReportController.java # Closing metrics and aggregations
            │
            ├── entity/                   # JPA Relational Entities
            │   ├── Patient.java
            │   ├── Visit.java            # Patient consultations & queues
            │   ├── VisitStatus.java      # WAITING, CONSULTATION, CHECKOUT, DONE
            │   ├── Prescription.java     # Items attached to visits
            │   ├── Medication.java       # Stock levels & unit pricing
            │   ├── Transaction.java      # Income/Expense ledger records
            │   └── XrayImage.java        # Multi-visit X-ray registries
            │
            ├── repository/               # Spring Data JPA Repository layer
            ├── service/                  # Business logic services
            │   ├── WhatsAppNotificationService.java # Meta Cloud API templates sender
            │   └── ...                   # Core domain service packages
            │
            └── scheduler/
                └── ReminderScheduler.java# Scheduled appointment reminder cron jobs
```

---

## 3. Data Flow & State Management

### A. Daily Session PIN Security Flow
The system is protected behind a daily-rotating security session token (`1234` by default).
1. When the user logs in via the client, the UI dispatches a validation request.
2. The server checks the PIN against the current system date.
3. Upon success, the client records the validation date and PIN inside `localStorage`.
4. The Axios client (`api/axios.js`) interceptor attaches the PIN to the `X-Clinic-Pin` header on all outbound requests.
5. If the request header is missing or incorrect, backend endpoints return `401 Unauthorized`, and the UI forces a redirect to the PIN screen.

### B. Dual-Workspace UI State Flow (Solo vs. Staff Mode)
The application workspace layout adapts dynamically based on the Redux state `isStaffAvailable` (synced to the browser's `localStorage` to survive refreshes).

```
                      isStaffAvailable Toggle
                                 │
            ┌────────────────────┴────────────────────┐
            ▼ (isStaffAvailable = true)               ▼ (isStaffAvailable = false)
      ┌───────────┐                             ┌───────────┐
      │Staff Mode │                             │ Solo Mode │
      └─────┬─────┘                             └─────┬─────┘
            ▼                                         ▼
   Split Screen Layout                      Unified Dashboard View
┌───────────────────────┐                  ┌───────────────────────┐
│ 25% Staff Station     │                  │ Unified doctor screen │
│ (Registry / Checkout) │                  │ with collapsible search│
│                       │                  │ & inline queue bypass │
│ 75% Doctor Workspace  │                  │                       │
│ (Clinical Consults)   │                  │                       │
└───────────────────────┘                  └───────────────────────┘
```

### C. Patient Queue State Transitions
Patients flow through a four-stage state machine tracked in `VisitStatus`:

1. **`WAITING`**: The patient is added to today's queue. They appear on the waiting panel.
2. **`CONSULTATION`**: The doctor starts the consultation.
   - *Staff Mode*: Doctor moves them from `WAITING` to `CONSULTATION`.
   - *Solo Mode*: Searching a patient bypasses the queue, moving them directly to `CONSULTATION`.
3. **`CHECKOUT`**: The doctor records symptoms, notes, prescriptions, and flags the visit as ready for checkout.
4. **`DONE`**: The client triggers the **Atomic Checkout** endpoint. The backend processes the visit:
   - Deducts quantities of prescribed items from `Medication` inventory.
   - Generates a `Transaction` ledger entry with type `INCOME`.
   - Transitions the visit state to `DONE`.

---

## 4. Database Entity Relationship (ERD) Overview

The database is built on top of PostgreSQL. The following diagram illustrates the entity structures and their mappings:

```
                  ┌──────────────────────┐
                  │       Patient        │
                  │──────────────────────│
                  │ id (PK)              │
                  │ name                 │
                  │ phone (Unique)       │
                  │ dob / gender         │
                  └──────────┬───────────┘
                             │
                             │ 1
                             │
                             │ 0..*
                             ▼
                  ┌──────────────────────┐
                  │        Visit         │◄──────────────┐
                  │──────────────────────│               │
                  │ id (PK)              │               │
                  │ patient_id (FK)      │               │
                  │ visit_date           │               │
                  │ symptoms             │               │
                  │ status (enum)        │               │
                  │ consultation_fee     │               │
                  └──────────┬───────────┘               │
                             │                           │
                             │ 1                         │ 1 (Nullable)
                             │                           │
                             │ 0..*                      │ 0..*
                             ▼                           │
   ┌───────────────────────────┐               ┌─────────┴────────────┐
   │       Prescription        │               │     Transaction      │
   │───────────────────────────│               │──────────────────────│
   │ id (PK)                   │               │ id (PK)              │
   │ visit_id (FK)             │               │ visit_id (FK)        │
   │ medication_id (FK)        │               │ transaction_date     │
   │ quantity_dispensed        │               │ type (INCOME/EXPENSE)│
   │ unit_price                │               │ category             │
   └─────────────┬─────────────┘               │ amount               │
                 │                             └──────────────────────┘
                 │ 0..*
                 │
                 │ 1
                 ▼
   ┌───────────────────────────┐               ┌──────────────────────┐
   │        Medication         │               │      XrayImage       │
   │───────────────────────────│               │──────────────────────│
   │ id (PK)                   │               │ id (PK)              │
   │ name (Unique)             │               │ patient_id (FK)      │
   │ current_stock             │               │ visit_id (FK)        │
   │ unit_selling_price        │               │ file_name / file_path│
   └───────────────────────────┘               └──────────────────────┘
```

### Key Relationships
- **Patient ── Visit (1:N)**: A patient can have multiple dental visits over time.
- **Visit ── Prescription (1:N)**: A single consultation visit can yield several prescribed medicines.
- **Medication ── Prescription (1:N)**: A specific medication is referenced in multiple prescriptions.
- **Visit ── Transaction (1:N)**: A transaction (ledger invoice entry) can optionally link back to a specific visit for income audits.
- **Visit ── XrayImage (1:N, Nullable)**: An X-ray is uploaded and optionally linked to the visit during which it was captured.

---

## 5. DevOps & Deployment Guide

The system supports containerized deployment using Docker Compose. All services execute inside a private network, and configurations are injected via environment variables.

### A. Environment Configs (Meta WhatsApp Cloud API)
The application requires the following environment variables to send WhatsApp templates. These should be defined in your deployment configuration:

- `META_WHATSAPP_PHONE_NUMBER_ID`: The unique ID of the WhatsApp-enabled phone number.
- `META_WHATSAPP_ACCESS_TOKEN`: Permanent System User access token with business messaging permissions.
- `META_WHATSAPP_TEMPLATE_NAME`: Template registered in the Meta Developer Console (e.g. `appointment_reminder`).
- `META_WHATSAPP_TEMPLATE_LANGUAGE`: Code matching the template language (e.g. `en_US`).

### B. Meta API Request Format
The system posts a template message payload to:
`POST https://graph.facebook.com/v19.0/{phone-number-id}/messages`

**Headers**:
- `Authorization: Bearer {access-token}`
- `Content-Type: application/json`

**Body Payload**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919876543210",
  "type": "template",
  "template": {
    "name": "appointment_reminder",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "John Doe"
          },
          {
            "type": "text",
            "text": "16 Jun 2026"
          }
        ]
      }
    ]
  }
}
```

### C. Deployment Setup (`docker-compose.yml`)

Ensure you have Docker and Docker Compose installed. Navigate to the root directory and execute the following commands:

```bash
# Build all container images (frontend, backend, postgres)
docker compose build

# Launch the entire stack in detached background mode
docker compose up -d

# Check running service status
docker compose ps

# View real-time logs for the Spring Boot service
docker compose logs -f backend
```

Once launched, the frontend UI is accessible at `http://localhost:5174`.
