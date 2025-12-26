// EduFlare Management System - Complete Type Definitions

export type UserRole = 'student' | 'staff' | 'admin';

// Legacy ApplicationStatus for backward compatibility
export type ApplicationStatus = 
  | 'lead'
  | 'contracted'
  | 'documents_pending'
  | 'submitted'
  | 'offer_released';

// Strict Lead Status State Machine
export type LeadStatus = 'new' | 'hot' | 'cold' | 'converted' | 'lost';

// Strict Student Status State Machine (Phase progression)
export type StudentStatus = 
  | 'pending_contract'      // Phase B: After conversion, awaiting contract
  | 'contract_signed'       // Phase C: Contract signed, deposit pending
  | 'active_profile'        // Phase C/D: Profile building, deposit paid
  | 'submitted_to_admin'    // Phase D: Submitted for admin review (locked)
  | 'returned_by_admin'     // Phase E: Admin rejected, returned to staff
  | 'submitted_to_uni'      // Phase E: Admin approved, sent to university
  | 'returned_by_school'    // Phase E: University requested more info
  | 'offer_received'        // Phase F: Offer received but hidden
  | 'offer_released'        // Phase F: Payment complete, offer visible
  | 'completed'             // Final: Process complete
  | 'cancelled';            // Student withdrew

export type DocumentStatus = 'pending' | 'verified' | 'error' | 'locked' | 'action_required';

export type ContractStatus = 'draft' | 'pending' | 'pending_signature' | 'signed' | 'expired' | 'cancelled';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'refunded' | 'cancelled';

export type PaymentType = 'opening_book' | 'deposit' | 'balance' | 'refund';

export type ScholarshipType = 'self_support' | 'partial_b' | 'partial_a' | 'full_b' | 'full_a';

export type UniversityApplicationStatus = 
  | 'draft'
  | 'pending_admin'
  | 'approved'
  | 'rejected'
  | 'submitted_to_uni'
  | 'returned_by_school'
  | 'accepted'
  | 'declined';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'voided' | 'clawback';

export type RefundReason = 'university_rejection' | 'student_withdrawal' | 'other';

export type AppointmentType = 'consultation' | 'document_submission' | 'interview_prep' | 'other';

// Study goals for leads
export type StudyGoal = 'diploma' | 'bachelor' | 'masters' | 'phd';

// Preferred countries
export type PreferredCountry = 'china' | 'india' | 'turkey' | 'other';

// Base User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
}

// Student with full profile data
export interface Student extends User {
  role: 'student';
  status: StudentStatus;
  assignedStaffId: string;
  
  // Basic info (captured at conversion)
  nationality?: string;
  dateOfBirth?: Date;
  age?: number;
  grade?: string;
  
  // Master Application Profile (Phase D)
  passportNumber?: string;
  passportExpiry?: Date;
  passportIssuedAt?: Date;
  gender?: string;
  maritalStatus?: string;
  nativeLanguage?: string;
  religion?: string;
  placeOfBirth?: string;
  currentAddress?: string;
  permanentAddress?: string;
  homeAddress?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  familyIncome?: string;
  
  // Education history
  highSchoolName?: string;
  highSchoolGrade?: string;
  highSchoolYear?: number;
  previousDegree?: string;
  previousInstitution?: string;
  previousGPA?: string;
  
  // Health & Background
  healthConditions?: string;
  criminalRecord?: boolean;
  criminalDetails?: string;
  
  // Progress tracking
  currentStep: number;
  offersUnlocked: boolean;
  
  // Profile locking
  isProfileLocked: boolean;
  lockedAt?: Date;
  lockedBy?: string;
  
  // Unlocked fields (for partial unlocks by admin)
  unlockedFields?: string[];
  
  // Financial
  scholarshipType?: ScholarshipType;
  depositPaid: number;
  balancePaid: number;
  totalOwed: number;
  
  // Temporary password for new accounts
  tempPassword?: string;
}

export interface Staff extends User {
  role: 'staff';
  department: string;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
  canImpersonate: boolean;
}

// Lead - Phase A (minimal data collection)
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: 'website' | 'referral' | 'event' | 'manual' | 'other';
  
  // Basic interest (progressive collection)
  studyGoal?: StudyGoal;
  preferredCountry?: PreferredCountry;
  message?: string;
  
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  lastContactAt?: Date;
  convertedAt?: Date;
  convertedToStudentId?: string;
  
  // Idle tracking
  daysSinceContact?: number;
}

// Document with locking
export interface Document {
  id: string;
  name: string;
  type: 'passport' | 'transcript' | 'certificate' | 'bank_statement' | 'recommendation' | 'personal_statement' | 'admission_letter' | 'jw202' | 'financial' | 'other';
  status: DocumentStatus;
  uploadedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  studentId: string;
  fileUrl?: string;
  fileSize?: number;
  
  // Locking
  isLocked: boolean;
  lockedAt?: Date;
  
  // For offers (hidden until payment)
  isHidden: boolean;
  
  // Error details
  errorMessage?: string;
}

// Contract with digital signature
export interface Contract {
  id: string;
  studentId: string;
  studentName: string;
  staffId: string;
  status: ContractStatus;
  amount: number;
  depositAmount: number;
  nonRefundableAmount: number;
  
  createdAt: Date;
  signedAt?: Date;
  signatureData?: string;
  expiresAt?: Date;
  
  // PDF
  pdfUrl?: string;
  
  // Version tracking (config changes apply to new contracts only)
  pricingVersion: number;
}

// Invoice/Payment
export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  type: PaymentType;
  amount: number;
  currency: 'TZS' | 'USD' | 'EUR';
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  description: string;

  // Audit & tracking fields
  createdBy?: string; // Staff ID who created/processed the transaction
  createdByName?: string; // Staff name for display
  receiptFileUrl?: string; // Reference to uploaded receipt file
  receiptFileName?: string; // Original filename of receipt

  // For immutable ledger
  isReversal: boolean;
  reversesInvoiceId?: string;
}

// Financial Ledger Entry (immutable)
export interface LedgerEntry {
  id: string;
  type: 'credit' | 'debit';
  category: 'payment' | 'refund' | 'commission' | 'fee';
  amount: number;
  description: string;
  studentId?: string;
  staffId?: string;
  createdAt: Date;
  createdBy: string;
  
  // Reversal tracking
  isReversal: boolean;
  reversesEntryId?: string;
}

// University Application (2+3 strategy)
export interface UniversityApplication {
  id: string;
  studentId: string;
  universityId: string;
  universityName: string;
  program: string;
  status: UniversityApplicationStatus;
  priority: number; // 1-5 for 2+3 strategy
  batch: 1 | 2; // Batch 1 = first 2, Batch 2 = next 3
  
  createdAt: Date;
  submittedToAdminAt?: Date;
  approvedAt?: Date;
  submittedToUniAt?: Date;
  responseAt?: Date;
  
  // Returned fields
  returnedAt?: Date;
  returnReason?: string;
  returnedFields?: string[];
  
  // Admin notes
  adminNotes?: string;
}

// University (reference data)
export interface University {
  id: string;
  name: string;
  country: string;
  city?: string;
  programs: string[];
  isPartner: boolean;
  isActive: boolean;
}

// Commission
export interface Commission {
  id: string;
  staffId: string;
  staffName: string;
  studentId: string;
  studentName: string;
  contractId: string;
  amount: number;
  status: CommissionStatus;
  
  triggeredAt: Date; // When contract signed + deposit paid
  approvedAt?: Date;
  paidAt?: Date;
  voidedAt?: Date;
  clawbackAt?: Date;
  
  // Clawback tracking
  clawbackReason?: string;
}

// Refund Request
export interface RefundRequest {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  reason: RefundReason;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  requestedBy: string;
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
  
  // Calculated amounts
  retainedCosts: number;
  refundableAmount: number;
}

// Appointment
export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  staffId: string;
  staffName: string;
  title: string;
  description?: string;
  dateTime: Date;
  duration: number; // minutes
  type: AppointmentType;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
  actionRequired?: boolean;
}

// Audit Log (immutable)
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  entityType: 'lead' | 'student' | 'document' | 'contract' | 'application' | 'payment' | 'refund' | 'commission' | 'settings' | 'user';
  entityId: string;
  timestamp: Date;
  ipAddress?: string;
  
  // For workflow overrides
  isOverride: boolean;
  overrideReason?: string;
  previousValue?: string;
  newValue?: string;
}

// Fix Request (from student)
export interface FixRequest {
  id: string;
  studentId: string;
  field: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

// Unlock Request (from staff/student to admin)
export interface UnlockRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestedBy: string;
  requestedByRole: 'staff' | 'student';
  requestedFields: string[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
  adminNotes?: string;
}

// Pricing Configuration (admin configurable)
export interface PricingConfig {
  id: string;
  version: number;
  scholarshipType: ScholarshipType;
  totalServiceFee: number;
  depositAmount: number;
  creditApplied: number;
  clientPays: number;
  nonRefundableAmount: number;
  isActive: boolean;
  effectiveFrom: Date;
}

// System Settings
export interface SystemSettings {
  commissionAmount: number; // TZS per student
  openingBookFee: number;
  passportExpiryMonths: number; // Block if < this
  leadIdleDays: number; // Alert after this many days
  applicationIdleDays: number; // Alert after this many days
  currentPricingVersion: number;
}

// KPI Data (for dashboards)
export interface KPIData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeStudents: number;
  successRate: number;
  pendingApplications: number;
  monthlyGrowth: number;
  totalLeads: number;
  conversionRate: number;
}

// Transaction (for display)
export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'commission';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// State machine transitions
export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['hot', 'cold', 'converted', 'lost'],
  hot: ['new', 'cold', 'converted', 'lost'],
  cold: ['new', 'hot', 'converted', 'lost'],
  converted: [], // Terminal state
  lost: ['new'], // Can be revived
};

export const STUDENT_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  pending_contract: ['contract_signed', 'cancelled'],
  contract_signed: ['active_profile', 'cancelled'],
  active_profile: ['submitted_to_admin', 'cancelled'],
  submitted_to_admin: ['returned_by_admin', 'submitted_to_uni'],
  returned_by_admin: ['submitted_to_admin', 'cancelled'],
  submitted_to_uni: ['returned_by_school', 'offer_received'],
  returned_by_school: ['submitted_to_uni'],
  offer_received: ['offer_released'],
  offer_released: ['completed'],
  completed: [], // Terminal
  cancelled: [], // Terminal
};

// Pricing table data
export const SCHOLARSHIP_PRICING: Record<ScholarshipType, {
  label: string;
  totalServiceFee: number;
  depositAmount: number;
  creditApplied: number;
  clientPays: number;
}> = {
  self_support: { label: 'Self-Support', totalServiceFee: 1000, depositAmount: 750, creditApplied: 500, clientPays: 500 },
  partial_b: { label: 'Partial B', totalServiceFee: 1250, depositAmount: 750, creditApplied: 500, clientPays: 750 },
  partial_a: { label: 'Partial A', totalServiceFee: 1500, depositAmount: 750, creditApplied: 500, clientPays: 1000 },
  full_b: { label: 'Full B', totalServiceFee: 1750, depositAmount: 750, creditApplied: 500, clientPays: 1250 },
  full_a: { label: 'Full A', totalServiceFee: 2000, depositAmount: 750, creditApplied: 500, clientPays: 1500 },
};

// Default system settings
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  commissionAmount: 20000, // TZS
  openingBookFee: 50, // USD
  passportExpiryMonths: 6,
  leadIdleDays: 7,
  applicationIdleDays: 3,
  currentPricingVersion: 1,
};
