// EduFlare Management System - Type Definitions

export type UserRole = 'student' | 'staff' | 'admin';

export type ApplicationStatus = 
  | 'lead'
  | 'contracted'
  | 'documents_pending'
  | 'submitted'
  | 'offer_released';

export type DocumentStatus = 'pending' | 'verified' | 'error' | 'locked';

export type LeadStatus = 'new' | 'hot' | 'cold' | 'converted' | 'lost';

export type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'refunded';

export type UniversityApplicationStatus = 'pending' | 'submitted' | 'accepted' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: 'student';
  applicationStatus: ApplicationStatus;
  assignedStaffId?: string;
  nationality?: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  currentStep: number;
  offersUnlocked: boolean;
}

export interface Staff extends User {
  role: 'staff';
  department: string;
  commission: number;
  pendingCommission: number;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  uploadedAt?: Date;
  verifiedAt?: Date;
  studentId: string;
  fileUrl?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  lastContactAt?: Date;
}

export interface Contract {
  id: string;
  studentId: string;
  studentName: string;
  status: ContractStatus;
  amount: number;
  createdAt: Date;
  signedAt?: Date;
  expiresAt?: Date;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  description: string;
}

export interface UniversityApplication {
  id: string;
  studentId: string;
  universityName: string;
  program: string;
  status: UniversityApplicationStatus;
  submittedAt?: Date;
  responseAt?: Date;
  priority: number;
}

export interface Appointment {
  id: string;
  studentId: string;
  staffId: string;
  title: string;
  description?: string;
  dateTime: Date;
  type: 'consultation' | 'document_review' | 'interview_prep' | 'other';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface KPIData {
  totalRevenue: number;
  activeStudents: number;
  successRate: number;
  pendingApplications: number;
  monthlyGrowth: number;
}

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
