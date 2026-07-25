# Siddheswari Ayurveda Management System

## Overview
Siddheswari Ayurveda Management System is a clinic and business management application built with React (Vite) and Node.js / Express with MongoDB. It supports day-to-day operations such as customer management, sales, purchases, stock tracking, staff records, analytics, and appointment handling through a clean browser-based interface.

The project is organized with a React frontend and an Express/MongoDB backend service layer.

## Purpose
The purpose of this system is to simplify administrative and operational workflows for an Ayurveda clinic or similar healthcare business. It reduces manual record keeping, centralizes business data, and provides quick access to invoices, reports, and operational dashboards.

## Features

| Feature | Description |
| --- | --- |
| Login and session handling | Staff can sign in with a username and password authenticated against the database. |
| Dashboard | Provides a central landing area for navigating the application. |
| Customer management | Create, update, delete, and view customer records. |
| Sales module | Handle sales entries, invoice generation, editing, and print-ready invoices. |
| Purchase module | Record purchases and create purchase entries. |
| Stock reporting | View stock-related information from the stocks database collection. |
| Staff reports | Manage and review staff-related operational details. |
| Analytics | Display business insights using chart-based reporting. |
| Appointment management | Track appointments from a dedicated appointment flow. |
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
| `frontend/src/services/` | Data access helpers for auth, customers, sales, purchases, stock, and other modules. |
| `frontend/src/Pages/` | Page-level views such as Dashboard, Login, Customer, Purchase, Sale, Stock, Analytics, and Appointment. |
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
5. Business actions such as login, customer updates, and staff management are implemented inside the service layer rather than directly in UI components.
6. Heavier routes like analytics and purchase entry are lazy-loaded with `Suspense` to keep the initial load lighter.

### Route Map

| Route | Screen |
| --- | --- |
| `/` | Login |
| `/dashboard` | Dashboard |
| `/dashboard/customer` | Customer management |
| `/dashboard/sales` | Sales |
| `/dashboard/sales/sale-invoice` | Sales invoice view |
| `/print-invoice` | Print invoice view |
| `/dashboard/sales/edit/:billnumber` | Edit sale entry |
| `/dashboard/purchase` | Purchase management |
| `/dashboard/purchase/purchase-entry` | Purchase entry form |
| `/dashboard/stock-report` | Stock report |
| `/dashboard/staff-report` | Staff report |
| `/dashboard/analytics` | Analytics dashboard |
| `/dashboard/appointments` | Appointment management |

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

## Conclusion
This application provides a practical operational layer for managing Ayurveda clinic workflows in one place. It combines a responsive React UI with Express and MongoDB persistence, making it suitable for day-to-day staff use, billing, reporting, and appointment tracking.

## Support Contact
For support, contact your project administrator or internal IT team.

If you want a more specific support section, replace the placeholder below with your official details:

- Email: adakrahul15@gmail.com, rohitadak0@gmail.com
- Phone: +91-8145322318, +91-8348765905
