import {
  Lead, Student, Staff, Admin, Document, Contract, Invoice,
  UniversityApplication, University, Commission, Appointment,
  Notification, AuditLog
} from '@/types';

export const generateMockData = () => {
  // Staff
  const staff: Staff[] = [
    {
      id: 'staff-1',
      email: 'sarah.johnson@eduflare.com',
      name: 'Sarah Johnson',
      phone: '+255 755 123 456',
      role: 'staff',
      createdAt: new Date('2023-06-01'),
      isActive: true,
      department: 'Student Services',
      totalCommission: 240000,
      pendingCommission: 60000,
      paidCommission: 180000,
    },
    {
      id: 'staff-2',
      email: 'james.mwanga@eduflare.com',
      name: 'James Mwanga',
      phone: '+255 755 234 567',
      role: 'staff',
      createdAt: new Date('2023-08-15'),
      isActive: true,
      department: 'Admissions',
      totalCommission: 160000,
      pendingCommission: 40000,
      paidCommission: 120000,
    },
  ];

  // Admins
  const admins: Admin[] = [
    {
      id: 'admin-1',
      email: 'admin@eduflare.com',
      name: 'Michael Chen',
      phone: '+255 755 000 001',
      role: 'admin',
      createdAt: new Date('2022-01-01'),
      isActive: true,
      permissions: ['all'],
      canImpersonate: true,
    },
  ];

  // Leads
  const leads: Lead[] = [
    {
      id: 'lead-1',
      name: 'Emily Wilson',
      email: 'emily@email.com',
      phone: '+255 755 111 222',
      status: 'new',
      source: 'website',
      studyGoal: 'bachelor',
      preferredCountry: 'china',
      message: 'Interested in studying Computer Science in China',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      assignedTo: 'staff-1',
    },
    {
      id: 'lead-2',
      name: 'David Brown',
      email: 'david@email.com',
      phone: '+255 755 333 444',
      status: 'hot',
      source: 'referral',
      studyGoal: 'masters',
      preferredCountry: 'india',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      assignedTo: 'staff-1',
    },
    {
      id: 'lead-3',
      name: 'Lisa Chen',
      email: 'lisa@email.com',
      phone: '+255 755 555 666',
      status: 'cold',
      source: 'event',
      studyGoal: 'diploma',
      preferredCountry: 'turkey',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastContactAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      assignedTo: 'staff-2',
    },
    {
      id: 'lead-4',
      name: 'Peter Kimani',
      email: 'peter.k@email.com',
      phone: '+255 755 777 888',
      status: 'new',
      source: 'website',
      studyGoal: 'bachelor',
      preferredCountry: 'china',
      message: 'Looking for scholarship opportunities',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      assignedTo: 'staff-1',
    },
  ];

  // Students
  const students: Student[] = [
    {
      id: 'student-1',
      email: 'john.doe@email.com',
      name: 'John Doe',
      phone: '+255 755 987 654',
      role: 'student',
      createdAt: new Date('2024-01-15'),
      isActive: true,
      status: 'active_profile',
      assignedStaffId: 'staff-1',
      nationality: 'Tanzania',
      dateOfBirth: new Date('2000-05-15'),
      age: 24,
      grade: 'A',
      passportNumber: 'AB1234567',
      passportExpiry: new Date('2028-05-15'),
      currentAddress: '123 Dar es Salaam, Tanzania',
      fatherName: 'Robert Doe',
      fatherOccupation: 'Engineer',
      motherName: 'Mary Doe',
      motherOccupation: 'Teacher',
      highSchoolName: 'Dar International School',
      highSchoolGrade: 'A',
      highSchoolYear: 2018,
      currentStep: 3,
      offersUnlocked: false,
      isProfileLocked: false,
      depositPaid: 750,
      balancePaid: 0,
      totalOwed: 500,
      scholarshipType: 'self_support',
    },
    {
      id: 'student-2',
      email: 'jane.smith@email.com',
      name: 'Jane Smith',
      phone: '+255 755 456 789',
      role: 'student',
      createdAt: new Date('2024-02-01'),
      isActive: true,
      status: 'submitted_to_admin',
      assignedStaffId: 'staff-1',
      nationality: 'Kenya',
      dateOfBirth: new Date('1999-08-20'),
      age: 25,
      grade: 'B+',
      passportNumber: 'CD5678901',
      passportExpiry: new Date('2027-08-20'),
      currentStep: 3,
      offersUnlocked: false,
      isProfileLocked: true,
      lockedAt: new Date(),
      lockedBy: 'staff-1',
      depositPaid: 750,
      balancePaid: 0,
      totalOwed: 750,
      scholarshipType: 'partial_b',
    },
    {
      id: 'student-3',
      email: 'alex.mwangi@email.com',
      name: 'Alex Mwangi',
      phone: '+255 755 321 654',
      role: 'student',
      createdAt: new Date('2023-11-01'),
      isActive: true,
      status: 'offer_received',
      assignedStaffId: 'staff-2',
      nationality: 'Uganda',
      dateOfBirth: new Date('2001-03-10'),
      age: 23,
      passportNumber: 'EF9012345',
      passportExpiry: new Date('2029-03-10'),
      currentStep: 4,
      offersUnlocked: false,
      isProfileLocked: true,
      depositPaid: 750,
      balancePaid: 0,
      totalOwed: 1000,
      scholarshipType: 'partial_a',
    },
  ];

  // Documents
  const documents: Document[] = [
    { id: 'doc-1', name: 'Passport Copy', type: 'passport', status: 'verified', uploadedAt: new Date(), verifiedAt: new Date(), studentId: 'student-1', isLocked: false, isHidden: false },
    { id: 'doc-2', name: 'Academic Transcript', type: 'transcript', status: 'verified', uploadedAt: new Date(), verifiedAt: new Date(), studentId: 'student-1', isLocked: false, isHidden: false },
    { id: 'doc-3', name: 'English Certificate', type: 'certificate', status: 'pending', uploadedAt: new Date(), studentId: 'student-1', isLocked: false, isHidden: false },
    { id: 'doc-4', name: 'Bank Statement', type: 'bank_statement', status: 'error', uploadedAt: new Date(), studentId: 'student-1', isLocked: false, isHidden: false, errorMessage: 'Statement is older than 3 months' },
    { id: 'doc-5', name: 'Recommendation Letter', type: 'recommendation', status: 'pending', studentId: 'student-1', isLocked: false, isHidden: false },
    { id: 'doc-6', name: 'Personal Statement', type: 'personal_statement', status: 'verified', uploadedAt: new Date(), verifiedAt: new Date(), studentId: 'student-1', isLocked: false, isHidden: false },
    { id: 'doc-7', name: 'Admission Letter', type: 'admission_letter', status: 'verified', uploadedAt: new Date(), studentId: 'student-3', isLocked: true, isHidden: true },
    { id: 'doc-8', name: 'JW202 Form', type: 'jw202', status: 'verified', uploadedAt: new Date(), studentId: 'student-3', isLocked: true, isHidden: true },
  ];

  // Contracts
  const contracts: Contract[] = [
    {
      id: 'con-1',
      studentId: 'student-1',
      studentName: 'John Doe',
      staffId: 'staff-1',
      status: 'signed',
      amount: 750,
      depositAmount: 750,
      nonRefundableAmount: 500,
      createdAt: new Date('2024-01-10'),
      signedAt: new Date('2024-01-12'),
      pricingVersion: 1,
    },
    {
      id: 'con-2',
      studentId: 'student-2',
      studentName: 'Jane Smith',
      staffId: 'staff-1',
      status: 'signed',
      amount: 750,
      depositAmount: 750,
      nonRefundableAmount: 500,
      createdAt: new Date('2024-02-01'),
      signedAt: new Date('2024-02-03'),
      pricingVersion: 1,
    },
    {
      id: 'con-3',
      studentId: 'student-3',
      studentName: 'Alex Mwangi',
      staffId: 'staff-2',
      status: 'signed',
      amount: 750,
      depositAmount: 750,
      nonRefundableAmount: 500,
      createdAt: new Date('2023-11-05'),
      signedAt: new Date('2023-11-07'),
      pricingVersion: 1,
    },
  ];

  // Invoices
  const invoices: Invoice[] = [
    { id: 'inv-1', studentId: 'student-1', studentName: 'John Doe', type: 'opening_book', amount: 50, status: 'paid', dueDate: new Date('2024-01-15'), paidAt: new Date('2024-01-14'), description: 'Opening Book / Consultation Fee', isReversal: false },
    { id: 'inv-2', studentId: 'student-1', studentName: 'John Doe', type: 'deposit', amount: 750, status: 'paid', dueDate: new Date('2024-01-20'), paidAt: new Date('2024-01-18'), description: 'Basic Service Deposit', isReversal: false },
    { id: 'inv-3', studentId: 'student-1', studentName: 'John Doe', type: 'balance', amount: 500, status: 'pending', dueDate: new Date('2024-04-15'), description: 'Final Balance Payment', isReversal: false },
    { id: 'inv-4', studentId: 'student-3', studentName: 'Alex Mwangi', type: 'balance', amount: 1000, status: 'pending', dueDate: new Date('2024-03-01'), description: 'Final Balance Payment', isReversal: false },
  ];

  // Universities
  const universities: University[] = [
    { id: 'uni-1', name: 'Zhejiang University', country: 'China', city: 'Hangzhou', programs: ['Computer Science', 'Engineering', 'Business'], isPartner: true, isActive: true },
    { id: 'uni-2', name: 'Beijing University', country: 'China', city: 'Beijing', programs: ['Medicine', 'Law', 'Arts'], isPartner: true, isActive: true },
    { id: 'uni-3', name: 'Tsinghua University', country: 'China', city: 'Beijing', programs: ['Engineering', 'Science', 'Architecture'], isPartner: true, isActive: true },
    { id: 'uni-4', name: 'Delhi University', country: 'India', city: 'Delhi', programs: ['Commerce', 'Arts', 'Science'], isPartner: true, isActive: true },
    { id: 'uni-5', name: 'IIT Bombay', country: 'India', city: 'Mumbai', programs: ['Engineering', 'Technology', 'Design'], isPartner: false, isActive: true },
    { id: 'uni-6', name: 'Istanbul University', country: 'Turkey', city: 'Istanbul', programs: ['Medicine', 'Law', 'Engineering'], isPartner: true, isActive: true },
  ];

  // Applications
  const applications: UniversityApplication[] = [
    { id: 'app-1', studentId: 'student-1', universityId: 'uni-1', universityName: 'Zhejiang University', program: 'Computer Science', status: 'draft', priority: 1, batch: 1, createdAt: new Date() },
    { id: 'app-2', studentId: 'student-1', universityId: 'uni-3', universityName: 'Tsinghua University', program: 'Engineering', status: 'draft', priority: 2, batch: 1, createdAt: new Date() },
    { id: 'app-3', studentId: 'student-2', universityId: 'uni-2', universityName: 'Beijing University', program: 'Medicine', status: 'pending_admin', priority: 1, batch: 1, createdAt: new Date(), submittedToAdminAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 'app-4', studentId: 'student-3', universityId: 'uni-1', universityName: 'Zhejiang University', program: 'Business', status: 'accepted', priority: 1, batch: 1, createdAt: new Date('2023-12-01'), submittedToAdminAt: new Date('2023-12-05'), approvedAt: new Date('2023-12-07'), submittedToUniAt: new Date('2023-12-10'), responseAt: new Date('2024-01-15') },
  ];

  // Commissions
  const commissions: Commission[] = [
    { id: 'com-1', staffId: 'staff-1', staffName: 'Sarah Johnson', studentId: 'student-1', studentName: 'John Doe', contractId: 'con-1', amount: 20000, status: 'paid', triggeredAt: new Date('2024-01-18'), paidAt: new Date('2024-02-01') },
    { id: 'com-2', staffId: 'staff-1', staffName: 'Sarah Johnson', studentId: 'student-2', studentName: 'Jane Smith', contractId: 'con-2', amount: 20000, status: 'pending', triggeredAt: new Date('2024-02-05') },
    { id: 'com-3', staffId: 'staff-2', staffName: 'James Mwanga', studentId: 'student-3', studentName: 'Alex Mwangi', contractId: 'con-3', amount: 20000, status: 'paid', triggeredAt: new Date('2023-11-10'), paidAt: new Date('2023-12-01') },
  ];

  // Appointments
  const appointments: Appointment[] = [
    { id: 'apt-1', studentId: 'student-1', studentName: 'John Doe', staffId: 'staff-1', staffName: 'Sarah Johnson', title: 'Document Review', dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), duration: 60, type: 'document_submission', status: 'scheduled' },
    { id: 'apt-2', studentId: 'student-1', studentName: 'John Doe', staffId: 'staff-1', staffName: 'Sarah Johnson', title: 'Interview Preparation', dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), duration: 90, type: 'interview_prep', status: 'scheduled' },
  ];

  // Notifications
  const notifications: Notification[] = [
    { id: 'not-1', userId: 'student-1', title: 'Document Verified', message: 'Your passport copy has been verified successfully.', type: 'success', read: false, createdAt: new Date() },
    { id: 'not-2', userId: 'student-1', title: 'Action Required', message: 'Please provide an updated bank statement.', type: 'warning', read: false, createdAt: new Date(), actionRequired: true },
    { id: 'not-3', userId: 'staff-1', title: 'New Lead Assigned', message: 'Emily Wilson has been assigned to you.', type: 'info', read: false, createdAt: new Date() },
    { id: 'not-4', userId: 'staff-1', title: 'Lead Idle Alert', message: 'Lisa Chen has not been contacted in 8 days.', type: 'warning', read: false, createdAt: new Date(), actionRequired: true },
    { id: 'not-5', userId: 'admin-1', title: 'Pending Review', message: 'Jane Smith\'s application is awaiting your review.', type: 'info', read: false, createdAt: new Date(), actionRequired: true },
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    { id: 'log-1', userId: 'staff-1', userName: 'Sarah Johnson', userRole: 'staff', action: 'Document Verified', details: 'Verified passport copy for John Doe', entityType: 'document', entityId: 'doc-1', timestamp: new Date(), isOverride: false },
    { id: 'log-2', userId: 'staff-1', userName: 'Sarah Johnson', userRole: 'staff', action: 'Contract Generated', details: 'Generated service agreement for John Doe', entityType: 'contract', entityId: 'con-1', timestamp: new Date(), isOverride: false },
    { id: 'log-3', userId: 'admin-1', userName: 'Michael Chen', userRole: 'admin', action: 'Application Approved', details: 'Approved Zhejiang University application for Alex Mwangi', entityType: 'application', entityId: 'app-4', timestamp: new Date(), isOverride: false },
    { id: 'log-4', userId: 'admin-1', userName: 'Michael Chen', userRole: 'admin', action: 'Commission Paid', details: 'Paid commission of 20,000 TZS to Sarah Johnson', entityType: 'commission', entityId: 'com-1', timestamp: new Date(), isOverride: false },
  ];

  return {
    leads,
    students,
    staff,
    admins,
    documents,
    contracts,
    invoices,
    applications,
    universities,
    commissions,
    appointments,
    notifications,
    auditLogs,
  };
};
