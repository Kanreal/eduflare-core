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
  { label: 'My Offers', path: '/student/offers', icon: Gift },
];

export const staffNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Lead Manager', path: '/staff/leads', icon: UserPlus },
  { label: 'Active Students', path: '/staff/students', icon: Users },
  { label: 'Contract Manager', path: '/staff/contracts', icon: FileSignature },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Application Queue', path: '/admin/applications', icon: ListTodo },
  { label: 'Financial Hub', path: '/admin/financials', icon: Wallet },
  { label: 'Audit Logs', path: '/admin/audit', icon: History },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

// Application steps for progress tracking
export const applicationSteps = [
  { step: 1, label: 'Lead', description: 'Initial inquiry' },
  { step: 2, label: 'Contracted', description: 'Agreement signed' },
  { step: 3, label: 'Documents', description: 'Collecting documents' },
  { step: 4, label: 'Submitted', description: 'Application submitted' },
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
  signed: { label: 'Signed', color: 'success', icon: CheckCircle },
  expired: { label: 'Expired', color: 'error', icon: XCircle },
  
  // Invoice statuses
  paid: { label: 'Paid', color: 'success', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'error', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'warning', icon: Clock },
  
  // Application statuses
  submitted: { label: 'Submitted', color: 'primary', icon: Upload },
  accepted: { label: 'Accepted', color: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'error', icon: XCircle },
} as const;

// Mock data for development
export const mockStudent = {
  id: 'student-1',
  email: 'john.doe@email.com',
  name: 'John Doe',
  role: 'student' as const,
  phone: '+1 234 567 890',
  createdAt: new Date('2024-01-15'),
  applicationStatus: 'documents_pending' as const,
  nationality: 'United States',
  dateOfBirth: new Date('2000-05-15'),
  passportNumber: 'AB1234567',
  currentStep: 3,
  offersUnlocked: false,
  assignedStaffId: 'staff-1',
};

export const mockStaff = {
  id: 'staff-1',
  email: 'sarah.johnson@eduflare.com',
  name: 'Sarah Johnson',
  role: 'staff' as const,
  phone: '+1 555 123 456',
  createdAt: new Date('2023-06-01'),
  department: 'Student Services',
  commission: 12500,
  pendingCommission: 3200,
};

export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@eduflare.com',
  name: 'Michael Chen',
  role: 'admin' as const,
  phone: '+1 555 000 001',
  createdAt: new Date('2022-01-01'),
  permissions: ['all'],
};

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
  { id: 'log-3', userId: 'admin-1', userName: 'Michael Chen', action: 'Generated Contract', details: 'Contract generated for John Doe', entityType: 'contract', entityId: 'con-1', timestamp: new Date(), ipAddress: '192.168.1.1' },
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
