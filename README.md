# Siddheswari Ayurveda Management System

## Overview
Siddheswari Ayurveda Management System is a React-based clinic and business management application built with Vite and Firebase. It supports day-to-day operations such as customer management, sales, purchases, stock tracking, staff records, analytics, and appointment handling through a clean browser-based interface.

The project is organized as a frontend-first application with Firebase acting as the backend layer for authentication, Firestore data storage, file storage, and analytics.

## Purpose
The purpose of this system is to simplify administrative and operational workflows for an Ayurveda clinic or similar healthcare business. It reduces manual record keeping, centralizes business data, and provides quick access to invoices, reports, and operational dashboards.

## Features

| Feature | Description |
| --- | --- |
| Login and session handling | Staff can sign in with a username and password stored in Firebase Firestore. |
| Dashboard | Provides a central landing area for navigating the application. |
| Customer management | Create, update, delete, and view customer records. |
| Sales module | Handle sales entries, invoice generation, editing, and print-ready invoices. |
| Purchase module | Record purchases and create purchase entries. |
| Stock reporting | View stock-related information and track product availability. |
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
| Backend platform | Firebase |
| Firebase services | Firestore, Authentication, Storage, Analytics |
| Build tooling | ESLint, Vite plugin React, PostCSS, Tailwind CSS tooling |

## Project Structure

| Path | Purpose |
| --- | --- |
| `package.json` | Root scripts that proxy to the frontend app. |
| `frontend/` | Main Vite React application. |
| `frontend/src/App.jsx` | Application routing and global layout. |
| `frontend/src/main.jsx` | App bootstrap entry point. |
| `frontend/src/firebase/firebase.js` | Firebase initialization and exported services. |
| `frontend/src/services/` | Data access helpers for auth, customers, sales, purchases, stock, and other modules. |
| `frontend/src/Pages/` | Page-level views such as Dashboard, Login, Customer, Purchase, Sale, Stock, Analytics, and Appointment. |
| `frontend/src/Components/` | Reusable UI and feature components such as invoices, loaders, headers, sidebars, and purchase entry screens. |
| `frontend/src/Popup/` | Modal and popup-based forms for adding and viewing records. |
| `frontend/src/CSS/` | Screen-specific stylesheet files. |

## Current Architecture
The current architecture is a single-page React application with route-based navigation and Firebase-backed data services.

1. `main.jsx` mounts the React app and loads global Bootstrap and application styles.
2. `App.jsx` defines application routes using React Router.
3. Public and protected views are rendered as pages under `src/Pages` and feature components under `src/Components`.
4. Firebase is initialized once in `src/firebase/firebase.js` and reused across service modules.
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
This project uses Firebase instead of a custom Express or Node backend.

### Firebase Services Used
- Firestore for structured application data
- Authentication for Firebase identity services
- Storage for file assets
- Analytics for usage tracking

### Setup Steps
1. Create or open a Firebase project.
2. Enable the services required by the app: Firestore, Authentication, Storage, and Analytics if needed.
3. Update the Firebase configuration in `frontend/src/firebase/firebase.js` with your project values.
4. Ensure your Firestore collections and documents match the service layer expectations, especially for staff, customer, product, purchase, and sales data.
5. Configure security rules so only authorized staff can access operational data.

### Important Note
The Firebase config is currently stored directly in the frontend source file. If you plan to deploy this publicly, move sensitive configuration values into environment variables or another safer deployment strategy.

## Useful Tips
- Keep Firestore collection names consistent with the service files, because the app expects exact paths.
- Use the root scripts when working from the repository root; they already forward to the frontend project.
- Test login and record creation flows after changing Firebase rules or schema fields.
- If route-based pages are slow, review the lazy-loaded screens in `App.jsx` and the components they import.
- Keep the print invoice layout and sales invoice flow aligned, since those screens are typically used together.

## Conclusion
This application provides a practical operational layer for managing Ayurveda clinic workflows in one place. It combines a responsive React UI with Firebase-backed persistence, making it suitable for day-to-day staff use, billing, reporting, and appointment tracking.

## Support Contact
For support, contact your project administrator or internal IT team.

If you want a more specific support section, replace the placeholder below with your official details:

- Email: adakrahul15@gmail.com, rohitadak0@gmail.com
- Phone: +91-8145322318, +91-8348765905
