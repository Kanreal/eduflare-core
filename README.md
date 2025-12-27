# Welcome to your Eduflare project

## Project info

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Eduflare.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# System Design Specification: EduFlare Management System

**Version:** 1.0  
**Scope:** End-to-End CRM, Application Management, and Financial Control

---

## 1. Executive Summary

The EduFlare system is a centralized platform that manages the student journey from **Lead** to **University Enrollment**.

It enforces a **Progressive Data Collection** model:
- Collecting basic information at first contact
- Collecting detailed background information during application creation

The system also enforces **Strict Permission Control**:
- **Staff** manage data accuracy and operational workflows
- **Admins** control financial gates, overrides, and final approvals

---

## 2. User Roles & Permissions

### 2.1 Admin Role — Financial Controller & System Owner

**Responsibilities**
- Approves refunds
- Sets system-wide prices
- Submits applications to universities
- Releases offers

**Privileges**
- Can override workflows
- Can view total agency revenue
- Can manage staff accounts

**Audit**
- Every override action is recorded in a strict **Audit Log**

---

### 2.2 Staff Role — Quality Gatekeeper & Sales Agent

**Responsibilities**
- Inputs student data
- Uploads documents
- Creates applications
- Manages leads

**Restrictions**
- Cannot view total agency revenue
- Cannot delete files after an application is submitted to Admin (**locking mechanism**)

**Incentive**
- Earns commission on converted contracts

---

### 2.3 Student Role — The Client

**Responsibilities**
- Views progress
- Signs contracts digitally
- Pays fees
- Books appointments

**Restrictions**
- Read-only access to forms and documents
- Cannot upload files or directly edit profiles (prevents errors and fraud)

---

## 3. End-to-End Workflow

### Phase A: Lead Acquisition

**Trigger**
- Automated: Website ("Book Consultation")
- Manual: Staff entry

**Data Captured**
- Name
- Contact
- Basic interest

**Status**
- Lead — New

---

### Phase B: Conversion — "Opening the Book"

**Action**
- Staff clicks **Convert to Student**

**Financial Event**
- Student pays the **Opening Book / Consultation Fee**

**System Actions**
- Generates a Student user account with a temporary password
- Staff enters initial screening data (Nationality, Age, Grade)

**Status**
- Student — Pending Contract

---
### Phase B.1: Paid Conversion — "Opening the Book" (Formalized Flow)

In the EduFlare system the only supported method to create a Student account is via conversion from a Lead by a Staff member. This conversion is a paid process called "Opening the Book" and is subject to strict audit, recording, and UI controls.

Business Rules (Mandatory)
- The Opening Book charge is fixed at **50,000 TZS** (configurable by Admin in future releases).
- Conversion must not complete unless a payment record exists and a receipt file is uploaded.
- Student accounts cannot be created by any other flow (no public registration, no manual admin creation).

Conversion UI Requirements
- The Convert Lead dialog must require:
  - Payment Amount (required) — defaults to 50,000 TZS and is editable only by Admin via override.
  - Payment Receipt Upload (required) — accepts image or PDF, uploaded from staff workstation and stored as payment evidence.
  - Display of the system-generated temporary password after successful conversion (shown once).

Conversion Execution (System Steps)
1. Staff provides Payment Amount and uploads Receipt file in Convert dialog.
2. System validates presence of amount and receipt; conversion is blocked if validation fails.
3. System creates the Student account (Full Name and Email from Lead) and generates a temporary password.
4. System creates a financial record of type **Opening Book** with:
   - Amount, Student ID, Staff ID, Date/time, and receipt file reference.
5. System stores the uploaded receipt as a document linked to the Student record.
6. System logs an audit entry recording conversion and payment.
7. System surfaces the temporary password to the Staff user (only once) and sends an email to the Student (implementation detail).

Post-Conversion Guarantees
- The Student must change the temporary password at first login.
- The Student portal shows the Opening Book payment, purpose, amount and the read-only receipt.
- The Admin portal exposes all Opening Book payments and receipts with links to the processing staff and student for full auditability.

Financial Integration
- Opening Book transactions must be recorded in the central ledger with all metadata (transaction type, amount, student, staff, timestamp, receipt reference) to ensure no payment is lost and for accurate reporting.

---


### Phase C: Contract & Deposit

**Action**
- Staff generates the **Study Abroad Service Agreement**

**Financial Events**
- Student signs contract
- Staff records a **$750 USD Basic Service Deposit**

**System Logic**
- $500 of the deposit is immediately flagged as **Non-Refundable**

**Commission Trigger**
- System records a **pending commission** for the Staff member

**Status**
- Active — Profile Building

---

### Phase D: Application Creation — "Data & Document Phase"

**Form Filling**
- Staff interviews student to complete the **Master Application Profile**
  - Education
  - Family
  - Health
  - Criminal record

**Document Collection**
- Student brings physical or digital documents
- Staff uploads documents to the system

**Validation Rule**
- Passport expiry check
- Submission blocked if expiry < 6 months

**Submission**
- Staff clicks **Submit to Admin**

**Locking**
- Application profile becomes **Read-only** for Staff

---

### Phase E: Application Processing — "2+3 Strategy"

**Batch 1**
- Staff selects **2 universities** from the database

**Admin Review**
- **Reject:** Returns to Staff (profile unlocked)
- **Approve:** Marked as submitted (profile remains locked)

**External Submission**
- Admin downloads files as ZIP
- Admin submits on university portals

**Feedback Loop**
- If university requests more info:
  - Admin marks status **Returned by School**
  - Temporarily unlocks specific fields for Staff

---

### Phase F: Offer, Financials & Release

**Offer Receipt**
- Admin uploads Admission Letter / JW202

**Visibility Rule**
- Status becomes **Offer Received**
- Files remain **hidden from Student**

**Scholarship Input**
- Admin selects scholarship type (Full A, Partial B, etc.)

**Auto-Calculation**

```
Final Balance = Scholarship Fee − (Initial Deposit − $250 Credit)
```

**Payment & Release**
- Student pays final balance
- Admin logs payment
- Offer files become **visible** in Student Portal

---

## 4. Financial Logic & Pricing Engine

### A. Automated Pricing Table (Admin Configurable)

| Scholarship Type | Total Service Fee | Deposit Paid | Credit Applied | Client Pays |
|-----------------|------------------|--------------|----------------|--------------|
| Self-Support | $1,000 | $750 | $500 | $500 |
| Partial B | $1,250 | $750 | $500 | $750 |
| Partial A | $1,500 | $750 | $500 | $1,000 |
| Full B | $1,750 | $750 | $500 | $1,250 |
| Full A | $2,000 | $750 | $500 | $1,500 |

> Changes apply to **new contracts only**

---

### B. Staff Commission System

**Trigger Conditions**
- Status = Contract Signed
- Deposit Paid = $750

**Commission Amount**
- Fixed at **20,000 TZS per student**

**Clawback Rules**
- Cancel before payout → Commission voided
- Cancel after payout → Negative entry (-20,000 TZS) deducted from next salary

---

### C. Refund Logic — "Unhappy Path"

- University rejection → $250 refund
- Student withdrawal → $0 refund

---

## 5. Master Page List (Sitemap)

### Part 1: Public & Authentication
- Login
- Forgot Password
- Reset Password
- Staff/Admin Secure Login

---

### Part 2: Student Portal (Read-Only)

1. **Dashboard** — Status hub, progress bar, alerts, appointments
2. **My Profile** — Read-only bio-data, request fix
3. **My Documents** — Vault view, no upload, status badges
4. **App Tracker** — 2+3 application status
5. **Financials** — Invoices & Contracts
6. **Appointments** — Booking calendar
7. **My Offers** — Locked until final payment
8. **Settings** — Password & phone

---

### Part 3: Staff Portal (Operational)

1. Dashboard — Tasks, alerts, earnings widget
2. Lead Manager — CRM & conversion
3. Student Directory — Searchable database
4. Student Detail — Profile, docs, apps, submit to admin
5. Contract Manager — Generate agreements
6. University List — Reference table
7. Calendar — Personal schedule
8. My Profile — Commission history

---

### Part 4: Admin Portal (Control)

1. Dashboard — Revenue & success metrics
2. App Queue — Pending reviews
3. App Detail View — Preview, ZIP download, submit/reject
4. Financial Hub — Transactions, refunds, commissions
5. Staff Manager — HR control
6. University Manager — Assets
7. Settings — Pricing & commission
8. Audit Logs — Full traceability

---

## 6. Technical Requirements & Utilities

- Global Notification Bell
- Admin Impersonation Mode
- PDF Generator for contracts
- Idle Alerts (Lead >7 days, App >3 days)
- Visa Warning: Block submission if passport expiry < 6 months

**Final Rule**
- When Admin clicks **Mark as Submitted**, all files are locked and Staff can no longer edit them

