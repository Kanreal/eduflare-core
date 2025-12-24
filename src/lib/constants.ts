import {
  LayoutDashboard,
  User,
  FileText,
  ClipboardList,
  CreditCard,
  Gift,
  Users,
  UserPlus,
  FileSignature,
  ListTodo,
  Eye,
  Wallet,
  History,
  Settings,
  GraduationCap,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
  Unlock,
  Download,
  Upload,
  Search,
  Bell,
  ChevronRight,
  MoreVertical,
  Plus,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

// Re-export icons for consistent usage
export {
  LayoutDashboard,
  User,
  FileText,
  ClipboardList,
  CreditCard,
  Gift,
  Users,
  UserPlus,
  FileSignature,
  ListTodo,
  Eye,
  Wallet,
  History,
  Settings,
  GraduationCap,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
  Unlock,
  Download,
  Upload,
  Search,
  Bell,
  ChevronRight,
  MoreVertical,
  Plus,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  UserCog,
};

export type { LucideIcon };

// Navigation configurations for each portal
export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

export const studentNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/student/profile', icon: User },
  { label: 'My Documents', path: '/student/documents', icon: FileText },
  { label: 'Application Tracker', path: '/student/applications', icon: ClipboardList },
  { label: 'Financials', path: '/student/financials', icon: CreditCard },
  { label: 'Appointments', path: '/student/appointments', icon: Calendar },
  { label: 'My Offers', path: '/student/offers', icon: Gift },
  { label: 'Settings', path: '/student/settings', icon: Settings },
];

export const staffNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Lead Manager', path: '/staff/leads', icon: UserPlus },
  { label: 'Active Students', path: '/staff/students', icon: Users },
  { label: 'Applications', path: '/staff/applications', icon: ClipboardList },
  { label: 'Contract Manager', path: '/staff/contracts', icon: FileSignature },
  { label: 'University List', path: '/staff/universities', icon: Building2 },
  { label: 'Calendar', path: '/staff/calendar', icon: Calendar },
  { label: 'My Profile', path: '/staff/profile', icon: User },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Application Queue', path: '/admin/applications', icon: ListTodo },
  { label: 'Financial Hub', path: '/admin/financials', icon: Wallet },
  { label: 'Staff Manager', path: '/admin/staff', icon: UserCog },
  { label: 'University Manager', path: '/admin/universities', icon: Building2 },
  { label: 'Contract Templates', path: '/admin/contracts', icon: FileSignature },
  { label: 'Audit Logs', path: '/admin/audit', icon: History },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

// Application steps for progress tracking
export const applicationSteps = [
  { step: 1, label: 'Lead', description: 'Initial inquiry & conversion' },
  { step: 2, label: 'Contracted', description: 'Agreement signed & deposit paid' },
  { step: 3, label: 'Documents', description: 'Profile building & documents' },
  { step: 4, label: 'Processing', description: 'Application submitted & review' },
  { step: 5, label: 'Offer Released', description: 'Admission offer received' },
];

// Status configurations with colors
export const statusConfig = {
  // Document statuses
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  verified: { label: 'Verified', color: 'success', icon: CheckCircle },
  error: { label: 'Error', color: 'error', icon: AlertCircle },
  locked: { label: 'Locked', color: 'muted', icon: Lock },
  
  // Lead statuses
  new: { label: 'New', color: 'primary', icon: Plus },
  hot: { label: 'Hot', color: 'error', icon: TrendingUp },
  cold: { label: 'Cold', color: 'muted', icon: Clock },
  converted: { label: 'Converted', color: 'success', icon: CheckCircle },
  lost: { label: 'Lost', color: 'muted', icon: XCircle },
  
  // Contract statuses
  draft: { label: 'Draft', color: 'muted', icon: FileText },
  pending_signature: { label: 'Pending Signature', color: 'warning', icon: Clock },
  signed: { label: 'Signed', color: 'success', icon: CheckCircle },
  expired: { label: 'Expired', color: 'error', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'muted', icon: XCircle },
  
  // Invoice statuses
  paid: { label: 'Paid', color: 'success', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'error', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'warning', icon: Clock },
  
  // Application statuses
  submitted: { label: 'Submitted', color: 'primary', icon: Upload },
  accepted: { label: 'Accepted', color: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'error', icon: XCircle },
  pending_admin: { label: 'Pending Review', color: 'warning', icon: Clock },
  approved: { label: 'Approved', color: 'success', icon: CheckCircle },
  submitted_to_uni: { label: 'Submitted to University', color: 'primary', icon: Upload },
  returned_by_school: { label: 'Returned by School', color: 'warning', icon: AlertCircle },
  
  // Student statuses
  pending_contract: { label: 'Pending Contract', color: 'warning', icon: Clock },
  contract_signed: { label: 'Contract Signed', color: 'success', icon: CheckCircle },
  active_profile: { label: 'Active - Profile Building', color: 'primary', icon: User },
  submitted_to_admin: { label: 'Submitted to Admin', color: 'warning', icon: Upload },
  returned_by_admin: { label: 'Returned by Admin', color: 'error', icon: AlertCircle },
  offer_received: { label: 'Offer Received', color: 'success', icon: Gift },
  offer_released: { label: 'Offer Released', color: 'success', icon: Gift },
  completed: { label: 'Completed', color: 'success', icon: CheckCircle },
} as const;

// Study goal options
export const studyGoalOptions = [
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'masters', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD' },
];

// Country options
export const countryOptions = [
  { value: 'china', label: 'China' },
  { value: 'india', label: 'India' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'other', label: 'Other' },
];

// Scholarship type labels
export const scholarshipLabels = {
  self_support: 'Self-Support',
  partial_b: 'Partial B',
  partial_a: 'Partial A',
  full_b: 'Full B',
  full_a: 'Full A',
};

// Mock data for backward compatibility
export const mockStudent = {
  id: 'student-1',
  email: 'john.doe@email.com',
  name: 'John Doe',
  role: 'student' as const,
  phone: '+255 755 987 654',
  createdAt: new Date('2024-01-15'),
  isActive: true,
  applicationStatus: 'documents_pending' as const,
  status: 'active_profile' as const,
  assignedStaffId: 'staff-1',
  nationality: 'Tanzania',
  dateOfBirth: new Date('2000-05-15'),
  passportNumber: 'AB1234567',
  currentStep: 3,
  offersUnlocked: false,
  isProfileLocked: false,
  depositPaid: 750,
  balancePaid: 0,
  totalOwed: 500,
};

export const mockStaff = {
  id: 'staff-1',
  email: 'sarah.johnson@eduflare.com',
  name: 'Sarah Johnson',
  role: 'staff' as const,
  phone: '+255 755 123 456',
  createdAt: new Date('2023-06-01'),
  isActive: true,
  department: 'Student Services',
  commission: 240000,
  totalCommission: 240000,
  pendingCommission: 60000,
  paidCommission: 180000,
};

export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@eduflare.com',
  name: 'Michael Chen',
  role: 'admin' as const,
  phone: '+255 755 000 001',
  createdAt: new Date('2022-01-01'),
  isActive: true,
  permissions: ['all'],
  canImpersonate: true,
};

// Additional mock data exports for backward compatibility
export const mockDocuments = [
  { id: 'doc-1', name: 'Passport Copy', type: 'identity', status: 'verified' as const, uploadedAt: new Date(), studentId: 'student-1' },
  { id: 'doc-2', name: 'Academic Transcript', type: 'academic', status: 'verified' as const, uploadedAt: new Date(), studentId: 'student-1' },
  { id: 'doc-3', name: 'English Certificate', type: 'language', status: 'pending' as const, uploadedAt: new Date(), studentId: 'student-1' },
  { id: 'doc-4', name: 'Bank Statement', type: 'financial', status: 'error' as const, uploadedAt: new Date(), studentId: 'student-1' },
  { id: 'doc-5', name: 'Recommendation Letter', type: 'supporting', status: 'locked' as const, studentId: 'student-1' },
  { id: 'doc-6', name: 'Personal Statement', type: 'supporting', status: 'verified' as const, uploadedAt: new Date(), studentId: 'student-1' },
];

export const mockUniversityApplications = [
  { id: 'app-1', studentId: 'student-1', universityName: 'Harvard University', program: 'Computer Science', status: 'pending' as const, priority: 1 },
  { id: 'app-2', studentId: 'student-1', universityName: 'MIT', program: 'Engineering', status: 'submitted' as const, submittedAt: new Date('2024-02-01'), priority: 2 },
  { id: 'app-3', studentId: 'student-1', universityName: 'Stanford University', program: 'Data Science', status: 'accepted' as const, submittedAt: new Date('2024-01-15'), responseAt: new Date('2024-03-01'), priority: 3 },
];

export const mockInvoices = [
  { id: 'inv-1', studentId: 'student-1', studentName: 'John Doe', amount: 5000, status: 'paid' as const, dueDate: new Date('2024-01-30'), paidAt: new Date('2024-01-28'), description: 'Consultation Fee' },
  { id: 'inv-2', studentId: 'student-1', studentName: 'John Doe', amount: 15000, status: 'pending' as const, dueDate: new Date('2024-04-15'), description: 'Application Processing Fee' },
  { id: 'inv-3', studentId: 'student-1', studentName: 'John Doe', amount: 2500, status: 'overdue' as const, dueDate: new Date('2024-03-01'), description: 'Document Verification Fee' },
];

export const mockContracts = [
  { id: 'con-1', studentId: 'student-1', studentName: 'John Doe', status: 'signed' as const, amount: 22500, createdAt: new Date('2024-01-10'), signedAt: new Date('2024-01-12') },
];

export const mockLeads = [
  { id: 'lead-1', name: 'Emily Wilson', email: 'emily@email.com', phone: '+1 555 111 222', status: 'new' as const, source: 'Website', createdAt: new Date(), assignedTo: 'staff-1' },
  { id: 'lead-2', name: 'David Brown', email: 'david@email.com', phone: '+1 555 333 444', status: 'hot' as const, source: 'Referral', createdAt: new Date(), lastContactAt: new Date(), assignedTo: 'staff-1' },
  { id: 'lead-3', name: 'Lisa Chen', email: 'lisa@email.com', phone: '+1 555 555 666', status: 'cold' as const, source: 'Event', createdAt: new Date(), assignedTo: 'staff-1' },
];

export const mockAppointments = [
  { id: 'apt-1', studentId: 'student-1', staffId: 'staff-1', title: 'Document Review', dateTime: new Date(Date.now() + 86400000 * 2), type: 'document_review' as const },
  { id: 'apt-2', studentId: 'student-1', staffId: 'staff-1', title: 'Interview Preparation', dateTime: new Date(Date.now() + 86400000 * 5), type: 'interview_prep' as const },
];

export const mockNotifications = [
  { id: 'not-1', userId: 'student-1', title: 'Document Verified', message: 'Your passport copy has been verified successfully.', type: 'success' as const, read: false, createdAt: new Date() },
  { id: 'not-2', userId: 'student-1', title: 'Action Required', message: 'Please upload your bank statement.', type: 'warning' as const, read: false, createdAt: new Date() },
];

export const mockAuditLogs = [
  { id: 'log-1', userId: 'admin-1', userName: 'Michael Chen', action: 'Approved Application', details: 'Application for Harvard submitted', entityType: 'application', entityId: 'app-1', timestamp: new Date(), ipAddress: '192.168.1.1' },
  { id: 'log-2', userId: 'staff-1', userName: 'Sarah Johnson', action: 'Verified Document', details: 'Passport copy verified', entityType: 'document', entityId: 'doc-1', timestamp: new Date(), ipAddress: '192.168.1.2' },
];

export const mockKPIData = {
  totalRevenue: 1250000,
  activeStudents: 342,
  successRate: 94.5,
  pendingApplications: 67,
  monthlyGrowth: 12.3,
};

export const mockTransactions = [
  { id: 'tx-1', type: 'payment' as const, amount: 5000, description: 'Consultation Fee - John Doe', status: 'completed' as const, createdAt: new Date() },
  { id: 'tx-2', type: 'commission' as const, amount: 750, description: 'Commission - Sarah Johnson', status: 'pending' as const, createdAt: new Date() },
  { id: 'tx-3', type: 'refund' as const, amount: 1000, description: 'Partial Refund - Emily Wilson', status: 'pending' as const, createdAt: new Date() },
];

// Currency conversion rates (example rates)
export const CURRENCY_RATES = {
  TZS_TO_USD: 0.0004, // 1 TZS = 0.0004 USD
  USD_TO_TZS: 2500,   // 1 USD = 2500 TZS
  EUR_TO_USD: 1.08,   // 1 EUR = 1.08 USD
};

export const formatCurrency = (amount: number, currency: string, targetCurrency: 'USD' = 'USD') => {
  if (currency === targetCurrency) {
    return `$${amount.toLocaleString()}`;
  }

  let convertedAmount = amount;
  if (currency === 'TZS') {
    convertedAmount = amount * CURRENCY_RATES.TZS_TO_USD;
  } else if (currency === 'EUR') {
    convertedAmount = amount * CURRENCY_RATES.EUR_TO_USD;
  }

  return `$${convertedAmount.toLocaleString()} (${currency} ${amount.toLocaleString()})`;
};