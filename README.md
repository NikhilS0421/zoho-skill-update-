# Instructor Skill Update Portal

A full-stack web application that allows instructors to authenticate via email OTP, update their professional profiles (certifications, experience, skills), and upload CVs for automated parsing — all synced with Zoho CRM.

## Live Deployments

| Service  | Platform | URL |
|----------|----------|-----|
| Frontend | Vercel   | *(your Vercel URL)* |
| Backend  | Render   | `https://zoho-skill-update.onrender.com` |

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [External Integrations](#external-integrations)

---

## Overview

The portal provides a secure self-service form for instructors to keep their professional profiles up to date. The flow is:

1. Instructor enters their registered email address.
2. A 6-digit OTP is sent to that email via **Resend**.
3. After OTP verification, their existing profile is fetched from **Zoho CRM**.
4. They update their skills, certifications, experience, location, LinkedIn URL, etc.
5. Optionally, they upload a CV (PDF) which is parsed by an **n8n webhook** to auto-populate fields.
6. On submit, changes are written back to Zoho CRM and an admin notification email is sent.

---

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   React Frontend    │ ──────► │  Express Backend     │
│   (Vercel)          │  REST   │  (Render)            │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                  ┌────────────────────────┼────────────────────┐
                  │                        │                    │
                  ▼                        ▼                    ▼
          ┌─────────────┐       ┌──────────────────┐  ┌──────────────┐
          │  Zoho CRM   │       │  Resend (Email)  │  │ n8n Webhook  │
          │  (OAuth 2.0)│       │  OTP + Notifs    │  │ CV Parsing   │
          └─────────────┘       └──────────────────┘  └──────────────┘
```

The frontend is a single-page app hosted on **Vercel**. The backend is a stateless Express server hosted on **Render**. There is no traditional database — all contact data lives in Zoho CRM.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.5 | UI framework |
| Create React App | 5.0.1 | Build toolchain |
| react-icons | 5.6.0 | Icon components |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | — | Runtime |
| Express | 5.2.1 | HTTP server |
| axios | 1.15.1 | HTTP client (Zoho API calls) |
| resend | 6.12.2 | Email delivery (OTP + notifications) |
| pdf-parse | 1.1.1 | CV text extraction |
| multer | — | File upload handling |
| cors | 2.8.6 | Cross-origin support |
| dotenv | 17.4.2 | Environment config |

---

## Project Structure

```
zoho-form-app/
├── frontend/
│   ├── public/
│   │   ├── index.html          # HTML template
│   │   └── manifest.json       # PWA manifest
│   └── src/
│       ├── App.js              # Main component (form logic, state)
│       ├── App.css             # Global styles (indigo/purple theme)
│       └── index.js            # React entry point
│
├── backend/
│   ├── server.js               # Express app + all route handlers
│   ├── zohoService.js          # Zoho OAuth token refresh logic
│   ├── uploads/                # Temporary CV file storage
│   └── .env                    # Secret credentials (not committed)
│
├── package.json                # Root-level shared dependencies
└── README.md                   # This file
```

---

## Features

### Authentication
- Email-based OTP login (6-digit code, valid for one session)
- OTP stored in-memory on the backend (no database required)
- Email sent via Resend from `otp@support.datacouch.io`

### Profile Form
- **Basic Info**: Full name, phone number (with country code selector), LinkedIn URL, US visa status, designation, business domain
- **Location**: Country (195 options), mailing state
- **Experience**: Consulting experience, training experience (250-word limit each)
- **Skills**: Free-text skills field, multi-select certifications (100+ options), other certifications
- **CV Upload**: PDF upload → parsed by n8n webhook → auto-fills certifications and skills

### Certifications Supported
Over 100 options across:
- **Cloud**: AWS (25+ certs), Microsoft Azure, Google Cloud, VMware, IBM
- **DevOps**: Kubernetes (CKA, CKAD, CKS), Linux, Docker
- **Enterprise**: Microsoft 365, Salesforce, ServiceNow, SAP

### Business Domains
21 domains including Finance, Healthcare, Technology, Manufacturing, Retail, Education, Government, and more.

### Admin Notifications
Every successful profile update sends a notification email to `ADMIN_EMAIL` with the updated contact details.

---

## API Reference

Base URL (production): `https://zoho-skill-update.onrender.com`

### `GET /`
Health check.

**Response:**
```
Server is running
```

---

### `POST /send-otp`
Generates a 6-digit OTP and emails it to the given address.

**Request body:**
```json
{ "email": "instructor@example.com" }
```

**Response:**
```json
{ "message": "OTP sent successfully" }
```

---

### `POST /contact`
Verifies the OTP and returns the contact record from Zoho CRM.

**Request body:**
```json
{
  "email": "instructor@example.com",
  "otp": "482910"
}
```

**Success response:**
```json
{
  "id": "zoho-contact-id",
  "First_Name": "Jane",
  "Last_Name": "Doe",
  "Email": "instructor@example.com",
  "Phone": "+1 555-000-0000",
  "Skills__c": "Python, React",
  ...
}
```

**Error responses:**
- `400` — Invalid or expired OTP
- `404` — Contact not found in Zoho CRM

---

### `PUT /contact`
Updates the contact record in Zoho CRM and emails the admin.

**Request body:**
```json
{
  "id": "zoho-contact-id",
  "First_Name": "Jane",
  "Last_Name": "Doe",
  "Skills__c": "Python, React, Node.js",
  "Certifications__c": "AWS Certified Solutions Architect",
  ...
}
```

**Success response:**
```json
{ "message": "Contact updated successfully" }
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Zoho CRM OAuth 2.0
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Admin notification recipient
ADMIN_EMAIL=admin@yourcompany.com

# Server port (optional, defaults to 9000)
PORT=9000
```

> **Note:** Never commit `.env` to version control. Add it to `.gitignore`.

---

## Local Development

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Clone the repository
```bash
git clone <repo-url>
cd zoho-form-app
```

### 2. Start the backend
```bash
cd backend
npm install
# Create your .env file with the variables listed above
npm start
# Runs on http://localhost:9000
```

### 3. Start the frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

The frontend proxies API calls to `http://localhost:9000` by default (configured via the `proxy` field in `frontend/package.json`, or update the `BACKEND_URL` constant in `App.js` for local development).

---

## Deployment

### Frontend — Vercel

1. Push the `frontend/` directory (or the whole repo) to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Vercel auto-detects Create React App; no additional config needed.
5. Set the backend URL environment variable if needed:
   ```
   REACT_APP_API_URL=https://zoho-skill-update.onrender.com
   ```
6. Deploy. Vercel handles builds on every push to `main`.

### Backend — Render

1. Create a new **Web Service** in [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add all environment variables from the [Environment Variables](#environment-variables) section under **Environment** in the Render dashboard.
5. Deploy. Render restarts the service on every push to `main`.

> **Render free tier note:** The free tier spins down after 15 minutes of inactivity. The first request after a cold start may take 30–60 seconds. Upgrade to a paid plan to avoid this.

---

## External Integrations

### Zoho CRM
- **Auth**: OAuth 2.0 with refresh token flow. The backend automatically refreshes the access token before each API call via `zohoService.js`.
- **Contacts module**: Used to search contacts by email and update their profile fields.
- **Setup**: Create an OAuth app in the Zoho API Console and generate a refresh token with `ZohoCRM.modules.contacts.READ` and `ZohoCRM.modules.contacts.UPDATE` scopes.

### Resend
- Used for sending OTP emails and admin notifications.
- From address: `otp@support.datacouch.io` (requires a verified domain in Resend).
- [Resend dashboard](https://resend.com)

### n8n (CV Parsing)
- Webhook URL: `https://n8n.datacouch.io/webhook/parse-cv`
- Accepts a PDF file, extracts skills and certifications, and returns structured JSON.
- This is a self-hosted n8n instance at `n8n.datacouch.io`.
