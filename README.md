# Siddheswari Ayurveda Management System

## Overview
Siddheswari Ayurveda Management System is a clinic and business management application built with React (Vite) and Node.js / Express with MongoDB. It supports day-to-day operations such as customer management, sales, purchases, stock tracking, staff records, analytics, and appointment handling through a clean browser-based interface.

The project is organized with a React frontend and an Express/MongoDB backend service layer.

## Purpose
The purpose of this system is to simplify administrative and operational workflows for an Ayurveda clinic or similar healthcare business. It reduces manual record keeping, centralizes business data, and provides quick access to invoices, reports, and operational dashboards.

## Features

| Feature | Description |
| --- | --- |
| Landing Page & Doctors Directory | Public showcase highlighting Ayurvedic treatments, remedies, clinic hours, and doctors directory with speciality filters. |
| Multi-Doctor System & Specialities | Support for multiple doctors categorized by department (Vision, Rheumatology, Neurology, etc.) with feature lock toggle. |
| Appointment Booking | Patients can request consultations directly from the landing page with automatic doctor assignment and backend sync. |
| Login and session handling | Staff can sign in with a username and password authenticated against the database. |
| Dashboard | Provides a central landing area for navigating the application. |
| Customer management | Create, update, delete, and view customer records. |
| Sales module | Handle sales entries, invoice generation, editing, and print-ready invoices. |
| Purchase module | Record purchases and create purchase entries. |
| Stock reporting | View stock-related information from the stocks database collection. |
| Staff reports | Manage and review staff-related operational details. |
| Analytics | Display business insights using chart-based reporting. |
| Appointment management | Track appointments from a dedicated appointment flow in staff dashboard. |
| Toast notifications | Show success and error messages for user actions. |
| Lazy loading | Load heavier routes only when needed to improve initial performance. |

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite |
| Routing | React Router DOM |
| UI styling | CSS, Bootstrap 5, Bootstrap Icons |
| Notifications | React Toastify |
| Charts and reporting | Recharts |
| Excel/export utilities | ExcelJS, xlsx, File Saver |
| Backend platform | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Build tooling | ESLint, Vite plugin React, PostCSS, Tailwind CSS tooling |

## Project Structure

| Path | Purpose |
| --- | --- |
| `package.json` | Root scripts that proxy to the frontend app. |
| `frontend/` | Main Vite React application. |
| `frontend/src/App.jsx` | Application routing and global layout. |
| `frontend/src/main.jsx` | App bootstrap entry point. |
| `frontend/src/data/doctorsData.js` | Specialist doctor profiles and `SHOW_MULTIPLE_DOCTORS` feature lock toggle. |
| `frontend/src/services/` | Data access helpers for auth, doctors, customers, sales, purchases, stock, and other modules. |
| `frontend/src/Pages/` | Page-level views such as Landing, Dashboard, Login, Remedies, Customer, Purchase, Sale, Stock, Analytics, and Appointment. |
| `frontend/src/Components/` | Reusable UI and feature components such as invoices, loaders, headers, sidebars, and purchase entry screens. |
| `frontend/src/Popup/` | Modal and popup-based forms for adding and viewing records. |
| `frontend/src/CSS/` | Screen-specific stylesheet files. |
| `backend/` | Express backend server, database models, and API routes. |

## Current Architecture
The current architecture is a full-stack Web application with route-based navigation and Express/MongoDB backend APIs.

1. `main.jsx` mounts the React app and loads global Bootstrap and application styles.
2. `App.jsx` defines application routes using React Router.
3. Public and protected views are rendered as pages under `src/Pages` and feature components under `src/Components`.
4. API requests are directed to the backend endpoints (`/api/...`).
5. Business actions such as login, customer updates, staff management, and doctor registrations are implemented inside the service layer rather than directly in UI components.
6. Heavier routes like analytics and purchase entry are lazy-loaded with `Suspense` to keep the initial load lighter.

### Route Map

| Route | Access | Screen |
| --- | --- | --- |
| `/` | Public | Clinic Landing Page (Philosophy, Doctors, Timetable, Remedies, Treatments) |
| `/remedies` | Public | Herbal Remedies Catalog |
| `/shop` | Public | Shop (Under development) |
| `/login` | Public | Staff & Admin Login |
| `/dashboard` | Protected | Dashboard Overview |
| `/dashboard/customer` | Protected | Customer management |
| `/dashboard/sales` | Protected | Sales entries and reporting |
| `/dashboard/sales/sale-invoice` | Protected | Sales invoice view |
| `/print-invoice` | Protected | Print-ready invoice view |
| `/dashboard/sales/edit/:billnumber` | Protected | Edit sale entry |
| `/dashboard/purchase` | Protected | Purchase management |
| `/dashboard/purchase/purchase-entry` | Protected | Purchase entry form |
| `/dashboard/stock-report` | Protected | Stock reporting and tracking |
| `/dashboard/staff-report` | Protected | Staff operational reports |
| `/dashboard/analytics` | Protected | Business analytics charts |
| `/dashboard/appointments` | Protected | Clinic appointment scheduling |

---

## Doctor Section & Feature Lock Configuration

The Landing Page (`Landing.jsx`) includes a flexible **Ayurvedic Doctors Directory** with speciality filtering (Vision, Rheumatology, Neurology, etc.) and a doctor selector dropdown in the appointment booking box.

### Feature Lock Mechanism

By default, the multi-doctor UI is **locked** so that public visitors only see a single doctor (**Dr. Subham Maity**), preserving the original clinic homepage appearance.

### How to Unlock All Doctors Data

To unlock multi-doctor view permanently in code:

- Open `frontend/src/data/doctorsData.js` and set `SHOW_MULTIPLE_DOCTORS` to `true`:

```javascript
// frontend/src/data/doctorsData.js
export const SHOW_MULTIPLE_DOCTORS = true;
```

---

## Frontend Setup

### Prerequisites
- Node.js 18 or newer
- npm

### Install
Run the following from the repository root:

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

This command starts the frontend through the root script, which forwards to the Vite app inside `frontend/`.

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

### Lint the Codebase

```bash
npm run lint
```

## Backend Setup
This project uses an Express backend connected to MongoDB.

### Setup Steps
1. Ensure Node.js and MongoDB are installed and running.
2. Configure `.env` in `backend/` with `PORT` and `MONGO_URI`.
3. Start backend server: `cd backend && node server.js`.

## Useful Tips
- Keep database schemas consistent across routes and models.
- Test login, stock tracking, purchase entries, and sales invoice validation flows.
- Keep the print invoice layout and sales invoice flow aligned, since those screens are typically used together.
- When registering new doctors in the admin dashboard, their chosen `specialization` will automatically be recognized by the landing page's multi-doctor filter.

## Conclusion
This application provides a practical operational layer for managing Ayurveda clinic workflows in one place. It combines a responsive React UI with Express and MongoDB persistence, making it suitable for day-to-day staff use, billing, reporting, and appointment tracking.

## Support Contact
For support, contact your project administrator or internal IT team:

- Email: adakrahul15@gmail.com, rohitadak0@gmail.com
- Phone: +91-8145322318, +91-8348765905

