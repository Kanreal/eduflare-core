import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  Lead, Student, Staff, Admin, Document, Contract, Invoice,
  UniversityApplication, University, Commission, RefundRequest,
  Appointment, Notification, AuditLog, LedgerEntry, FixRequest,
  SystemSettings, LeadStatus, StudentStatus, UserRole,
  LEAD_TRANSITIONS, STUDENT_TRANSITIONS, SCHOLARSHIP_PRICING,
  DEFAULT_SYSTEM_SETTINGS, ScholarshipType
} from '@/types';
import { generateMockData } from '@/lib/mockData';

interface EduFlareState {
  leads: Lead[];
  students: Student[];
  staff: Staff[];
  admins: Admin[];
  documents: Document[];
  contracts: Contract[];
  invoices: Invoice[];
  applications: UniversityApplication[];
  universities: University[];
  commissions: Commission[];
  refundRequests: RefundRequest[];
  appointments: Appointment[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  ledgerEntries: LedgerEntry[];
  fixRequests: FixRequest[];
  systemSettings: SystemSettings;
}

interface EduFlareContextType extends EduFlareState {
  // Lead operations
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  changeLeadStatus: (id: string, newStatus: LeadStatus) => boolean;
  convertLeadToStudent: (leadId: string, staffId: string) => Student | null;
  
  // Student operations
  updateStudent: (id: string, updates: Partial<Student>) => void;
  changeStudentStatus: (id: string, newStatus: StudentStatus, reason?: string) => boolean;
  lockStudentProfile: (id: string, lockedBy: string) => void;
  unlockStudentProfile: (id: string) => void;
  unlockStudentFields: (id: string, fields: string[]) => void;
  setScholarshipType: (id: string, type: ScholarshipType) => void;
  calculateFinalBalance: (studentId: string) => number;
  
  // Document operations
  addDocument: (doc: Omit<Document, 'id'>) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  verifyDocument: (id: string, verifiedBy: string) => void;
  lockDocuments: (studentId: string) => void;
  unlockDocuments: (studentId: string) => void;
  
  // Contract operations
  createContract: (studentId: string, staffId: string) => Contract;
  signContract: (id: string, signatureData: string) => void;
  
  // Invoice/Payment operations
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  recordPayment: (invoiceId: string) => void;
  processRefund: (refundId: string, approvedBy: string, approved: boolean) => void;
  
  // Application operations
  createApplication: (app: Omit<UniversityApplication, 'id' | 'createdAt' | 'status'>) => UniversityApplication;
  submitApplicationToAdmin: (appId: string) => void;
  approveApplication: (appId: string, adminId: string) => void;
  rejectApplication: (appId: string, adminId: string, reason: string) => void;
  submitToUniversity: (appId: string) => void;
  returnFromSchool: (appId: string, reason: string, fields: string[]) => void;
  recordOfferReceived: (appId: string) => void;
  releaseOffer: (studentId: string) => void;
  
  // Commission operations
  triggerCommission: (staffId: string, studentId: string, contractId: string) => void;
  payCommission: (commissionId: string) => void;
  voidCommission: (commissionId: string, reason: string) => void;
  
  // Appointment operations
  bookAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => Appointment;
  cancelAppointment: (id: string) => void;
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  
  // Fix request operations
  submitFixRequest: (request: Omit<FixRequest, 'id' | 'createdAt' | 'status'>) => void;
  processFixRequest: (id: string, approved: boolean, processedBy: string) => void;
  
  // Audit logging
  logAudit: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Settings
  updateSystemSettings: (updates: Partial<SystemSettings>) => void;
  
  // Utility
  getStudentById: (id: string) => Student | undefined;
  getLeadById: (id: string) => Lead | undefined;
  getStaffById: (id: string) => Staff | undefined;
  getDocumentsByStudent: (studentId: string) => Document[];
  getApplicationsByStudent: (studentId: string) => UniversityApplication[];
  getNotificationsByUser: (userId: string) => Notification[];
  getUnreadNotificationCount: (userId: string) => number;
  getIdleLeads: (days: number) => Lead[];
  getIdleApplications: (days: number) => UniversityApplication[];
  validatePassportExpiry: (studentId: string) => boolean;
}

const EduFlareContext = createContext<EduFlareContextType | undefined>(undefined);

export const useEduFlare = () => {
  const context = useContext(EduFlareContext);
  if (!context) {
    throw new Error('useEduFlare must be used within an EduFlareProvider');
  }
  return context;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const EduFlareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockData = useMemo(() => generateMockData(), []);
  
  const [leads, setLeads] = useState<Lead[]>(mockData.leads);
  const [students, setStudents] = useState<Student[]>(mockData.students);
  const [staff, setStaff] = useState<Staff[]>(mockData.staff);
  const [admins, setAdmins] = useState<Admin[]>(mockData.admins);
  const [documents, setDocuments] = useState<Document[]>(mockData.documents);
  const [contracts, setContracts] = useState<Contract[]>(mockData.contracts);
  const [invoices, setInvoices] = useState<Invoice[]>(mockData.invoices);
  const [applications, setApplications] = useState<UniversityApplication[]>(mockData.applications);
  const [universities] = useState<University[]>(mockData.universities);
  const [commissions, setCommissions] = useState<Commission[]>(mockData.commissions);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(mockData.appointments);
  const [notifications, setNotifications] = useState<Notification[]>(mockData.notifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockData.auditLogs);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [fixRequests, setFixRequests] = useState<FixRequest[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  // Audit logging
  const logAudit = useCallback((entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newEntry: AuditLog = {
      ...entry,
      id: generateId(),
      timestamp: new Date(),
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, []);

  // Lead operations
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt'>): Lead => {
    const newLead: Lead = {
      ...lead,
      id: generateId(),
      createdAt: new Date(),
    };
    setLeads(prev => [...prev, newLead]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const changeLeadStatus = useCallback((id: string, newStatus: LeadStatus): boolean => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return false;
    
    const allowedTransitions = LEAD_TRANSITIONS[lead.status];
    if (!allowedTransitions.includes(newStatus)) return false;
    
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    return true;
  }, [leads]);

  const convertLeadToStudent = useCallback((leadId: string, staffId: string): Student | null => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === 'converted') return null;

    const newStudent: Student = {
      id: generateId(),
      email: lead.email,
      name: lead.name,
      phone: lead.phone,
      role: 'student',
      status: 'pending_contract',
      assignedStaffId: staffId,
      createdAt: new Date(),
      isActive: true,
      currentStep: 1,
      offersUnlocked: false,
      isProfileLocked: false,
      depositPaid: 0,
      balancePaid: 0,
      totalOwed: 0,
      tempPassword: Math.random().toString(36).slice(-8),
    };

    setStudents(prev => [...prev, newStudent]);
    setLeads(prev => prev.map(l => 
      l.id === leadId 
        ? { ...l, status: 'converted' as LeadStatus, convertedAt: new Date(), convertedToStudentId: newStudent.id }
        : l
    ));

    return newStudent;
  }, [leads]);

  // Student operations
  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      // Check if profile is locked and this isn't an admin unlock
      if (s.isProfileLocked && !updates.isProfileLocked && !updates.unlockedFields) {
        // Only allow updates to unlocked fields
        const allowedFields = s.unlockedFields || [];
        const filteredUpdates: Partial<Student> = {};
        Object.entries(updates).forEach(([key, value]) => {
          if (allowedFields.includes(key) || ['status', 'offersUnlocked'].includes(key)) {
            (filteredUpdates as Record<string, unknown>)[key] = value;
          }
        });
        return { ...s, ...filteredUpdates };
      }
      
      return { ...s, ...updates };
    }));
  }, []);

  const changeStudentStatus = useCallback((id: string, newStatus: StudentStatus, reason?: string): boolean => {
    const student = students.find(s => s.id === id);
    if (!student) return false;
    
    const allowedTransitions = STUDENT_TRANSITIONS[student.status];
    if (!allowedTransitions.includes(newStatus)) return false;
    
    const stepMap: Record<StudentStatus, number> = {
      pending_contract: 1,
      contract_signed: 2,
      active_profile: 2,
      submitted_to_admin: 3,
      returned_by_admin: 3,
      submitted_to_uni: 3,
      returned_by_school: 3,
      offer_received: 4,
      offer_released: 5,
      completed: 5,
      cancelled: 0,
    };
    
    setStudents(prev => prev.map(s => 
      s.id === id 
        ? { ...s, status: newStatus, currentStep: stepMap[newStatus] }
        : s
    ));
    return true;
  }, [students]);

  const lockStudentProfile = useCallback((id: string, lockedBy: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id 
        ? { ...s, isProfileLocked: true, lockedAt: new Date(), lockedBy, unlockedFields: [] }
        : s
    ));
  }, []);

  const unlockStudentProfile = useCallback((id: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id 
        ? { ...s, isProfileLocked: false, lockedAt: undefined, lockedBy: undefined, unlockedFields: undefined }
        : s
    ));
  }, []);

  const unlockStudentFields = useCallback((id: string, fields: string[]) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, unlockedFields: fields } : s
    ));
  }, []);

  const setScholarshipType = useCallback((id: string, type: ScholarshipType) => {
    const pricing = SCHOLARSHIP_PRICING[type];
    setStudents(prev => prev.map(s => 
      s.id === id 
        ? { 
            ...s, 
            scholarshipType: type,
            totalOwed: pricing.clientPays,
          }
        : s
    ));
  }, []);

  const calculateFinalBalance = useCallback((studentId: string): number => {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.scholarshipType) return 0;
    
    const pricing = SCHOLARSHIP_PRICING[student.scholarshipType];
    // Final Balance = Scholarship Fee - (Initial Deposit - $250 Credit)
    const credit = 250;
    return pricing.totalServiceFee - (student.depositPaid - credit);
  }, [students]);

  // Document operations
  const addDocument = useCallback((doc: Omit<Document, 'id'>): Document => {
    const newDoc: Document = { ...doc, id: generateId() };
    setDocuments(prev => [...prev, newDoc]);
    return newDoc;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.isLocked && !updates.isLocked) return d; // Can't update locked docs
      return { ...d, ...updates };
    }));
  }, []);

  const verifyDocument = useCallback((id: string, verifiedBy: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === id 
        ? { ...d, status: 'verified', verifiedAt: new Date(), verifiedBy }
        : d
    ));
  }, []);

  const lockDocuments = useCallback((studentId: string) => {
    setDocuments(prev => prev.map(d => 
      d.studentId === studentId 
        ? { ...d, isLocked: true, lockedAt: new Date() }
        : d
    ));
  }, []);

  const unlockDocuments = useCallback((studentId: string) => {
    setDocuments(prev => prev.map(d => 
      d.studentId === studentId ? { ...d, isLocked: false } : d
    ));
  }, []);

  // Contract operations
  const createContract = useCallback((studentId: string, staffId: string): Contract => {
    const student = students.find(s => s.id === studentId);
    const newContract: Contract = {
      id: generateId(),
      studentId,
      studentName: student?.name || 'Unknown',
      staffId,
      status: 'pending_signature',
      amount: 750, // Basic service deposit
      depositAmount: 750,
      nonRefundableAmount: 500,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      pricingVersion: systemSettings.currentPricingVersion,
    };
    setContracts(prev => [...prev, newContract]);
    return newContract;
  }, [students, systemSettings.currentPricingVersion]);

  const signContract = useCallback((id: string, signatureData: string) => {
    setContracts(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: 'signed', signedAt: new Date(), signatureData }
        : c
    ));
    
    // Update student status
    const contract = contracts.find(c => c.id === id);
    if (contract) {
      changeStudentStatus(contract.studentId, 'contract_signed');
    }
  }, [contracts, changeStudentStatus]);

  // Invoice operations
  const createInvoice = useCallback((invoice: Omit<Invoice, 'id'>): Invoice => {
    const newInvoice: Invoice = { ...invoice, id: generateId() };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, []);

  const recordPayment = useCallback((invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setInvoices(prev => prev.map(i => 
      i.id === invoiceId 
        ? { ...i, status: 'paid', paidAt: new Date() }
        : i
    ));

    // Create ledger entry
    const entry: LedgerEntry = {
      id: generateId(),
      type: 'credit',
      category: 'payment',
      amount: invoice.amount,
      description: invoice.description,
      studentId: invoice.studentId,
      createdAt: new Date(),
      createdBy: 'system',
      isReversal: false,
    };
    setLedgerEntries(prev => [...prev, entry]);

    // Update student deposit if this is a deposit payment
    if (invoice.type === 'deposit') {
      setStudents(prev => prev.map(s => 
        s.id === invoice.studentId 
          ? { ...s, depositPaid: s.depositPaid + invoice.amount }
          : s
      ));
      
      // Check for commission trigger
      const student = students.find(s => s.id === invoice.studentId);
      const contract = contracts.find(c => c.studentId === invoice.studentId && c.status === 'signed');
      if (student && contract && student.depositPaid + invoice.amount >= 750) {
        triggerCommission(student.assignedStaffId, student.id, contract.id);
      }
    }
  }, [invoices, students, contracts]);

  const processRefund = useCallback((refundId: string, approvedBy: string, approved: boolean) => {
    setRefundRequests(prev => prev.map(r => 
      r.id === refundId 
        ? { 
            ...r, 
            status: approved ? 'approved' : 'rejected',
            processedAt: new Date(),
            processedBy: approvedBy,
          }
        : r
    ));

    if (approved) {
      const request = refundRequests.find(r => r.id === refundId);
      if (request) {
        // Create reversal ledger entry
        const entry: LedgerEntry = {
          id: generateId(),
          type: 'debit',
          category: 'refund',
          amount: request.refundableAmount,
          description: `Refund: ${request.reason}`,
          studentId: request.studentId,
          createdAt: new Date(),
          createdBy: approvedBy,
          isReversal: true,
        };
        setLedgerEntries(prev => [...prev, entry]);
      }
    }
  }, [refundRequests]);

  // Application operations
  const createApplication = useCallback((app: Omit<UniversityApplication, 'id' | 'createdAt' | 'status'>): UniversityApplication => {
    const newApp: UniversityApplication = {
      ...app,
      id: generateId(),
      createdAt: new Date(),
      status: 'draft',
    };
    setApplications(prev => [...prev, newApp]);
    return newApp;
  }, []);

  const submitApplicationToAdmin = useCallback((appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    setApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, status: 'pending_admin', submittedToAdminAt: new Date() }
        : a
    ));
    
    // Lock student profile
    lockStudentProfile(app.studentId, 'system');
  }, [applications, lockStudentProfile]);

  const approveApplication = useCallback((appId: string, adminId: string) => {
    setApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, status: 'approved', approvedAt: new Date() }
        : a
    ));
  }, []);

  const rejectApplication = useCallback((appId: string, adminId: string, reason: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    setApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, status: 'rejected', adminNotes: reason }
        : a
    ));
    
    // Unlock student profile
    unlockStudentProfile(app.studentId);
    changeStudentStatus(app.studentId, 'returned_by_admin');
  }, [applications, unlockStudentProfile, changeStudentStatus]);

  const submitToUniversity = useCallback((appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    setApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, status: 'submitted_to_uni', submittedToUniAt: new Date() }
        : a
    ));
    
    // Lock documents
    lockDocuments(app.studentId);
    changeStudentStatus(app.studentId, 'submitted_to_uni');
  }, [applications, lockDocuments, changeStudentStatus]);

  const returnFromSchool = useCallback((appId: string, reason: string, fields: string[]) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    setApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, status: 'returned_by_school', returnedAt: new Date(), returnReason: reason, returnedFields: fields }
        : a
    ));
    
    // Partially unlock fields
    unlockStudentFields(app.studentId, fields);
    changeStudentStatus(app.studentId, 'returned_by_school');
  }, [applications, unlockStudentFields, changeStudentStatus]);

  const recordOfferReceived = useCallback((appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    setApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, status: 'accepted', responseAt: new Date() }
        : a
    ));
    
    changeStudentStatus(app.studentId, 'offer_received');
  }, [applications, changeStudentStatus]);

  const releaseOffer = useCallback((studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, offersUnlocked: true }
        : s
    ));
    
    // Unhide offer documents
    setDocuments(prev => prev.map(d => 
      d.studentId === studentId && (d.type === 'admission_letter' || d.type === 'jw202')
        ? { ...d, isHidden: false }
        : d
    ));
    
    changeStudentStatus(studentId, 'offer_released');
  }, [changeStudentStatus]);

  // Commission operations
  const triggerCommission = useCallback((staffId: string, studentId: string, contractId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    const student = students.find(s => s.id === studentId);
    
    const commission: Commission = {
      id: generateId(),
      staffId,
      staffName: staffMember?.name || 'Unknown',
      studentId,
      studentName: student?.name || 'Unknown',
      contractId,
      amount: systemSettings.commissionAmount,
      status: 'pending',
      triggeredAt: new Date(),
    };
    
    setCommissions(prev => [...prev, commission]);
    
    // Update staff pending commission
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, pendingCommission: s.pendingCommission + systemSettings.commissionAmount }
        : s
    ));
  }, [staff, students, systemSettings.commissionAmount]);

  const payCommission = useCallback((commissionId: string) => {
    const commission = commissions.find(c => c.id === commissionId);
    if (!commission) return;
    
    setCommissions(prev => prev.map(c => 
      c.id === commissionId 
        ? { ...c, status: 'paid', paidAt: new Date() }
        : c
    ));
    
    setStaff(prev => prev.map(s => 
      s.id === commission.staffId 
        ? { 
            ...s, 
            pendingCommission: s.pendingCommission - commission.amount,
            paidCommission: s.paidCommission + commission.amount,
            totalCommission: s.totalCommission + commission.amount,
          }
        : s
    ));
  }, [commissions]);

  const voidCommission = useCallback((commissionId: string, reason: string) => {
    const commission = commissions.find(c => c.id === commissionId);
    if (!commission) return;
    
    if (commission.status === 'paid') {
      // Clawback
      setCommissions(prev => prev.map(c => 
        c.id === commissionId 
          ? { ...c, status: 'clawback', clawbackAt: new Date(), clawbackReason: reason }
          : c
      ));
      
      // Create negative entry for next payroll
      const clawbackCommission: Commission = {
        id: generateId(),
        staffId: commission.staffId,
        staffName: commission.staffName,
        studentId: commission.studentId,
        studentName: commission.studentName,
        contractId: commission.contractId,
        amount: -commission.amount,
        status: 'pending',
        triggeredAt: new Date(),
      };
      setCommissions(prev => [...prev, clawbackCommission]);
    } else {
      // Just void
      setCommissions(prev => prev.map(c => 
        c.id === commissionId 
          ? { ...c, status: 'voided', voidedAt: new Date() }
          : c
      ));
      
      setStaff(prev => prev.map(s => 
        s.id === commission.staffId 
          ? { ...s, pendingCommission: s.pendingCommission - commission.amount }
          : s
      ));
    }
  }, [commissions]);

  // Appointment operations
  const bookAppointment = useCallback((apt: Omit<Appointment, 'id' | 'status'>): Appointment => {
    const newApt: Appointment = { ...apt, id: generateId(), status: 'scheduled' };
    setAppointments(prev => [...prev, newApt]);
    return newApt;
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'cancelled' } : a
    ));
  }, []);

  // Notification operations
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    ));
  }, []);

  // Fix request operations
  const submitFixRequest = useCallback((request: Omit<FixRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: FixRequest = {
      ...request,
      id: generateId(),
      createdAt: new Date(),
      status: 'pending',
    };
    setFixRequests(prev => [...prev, newRequest]);
  }, []);

  const processFixRequest = useCallback((id: string, approved: boolean, processedBy: string) => {
    const request = fixRequests.find(r => r.id === id);
    if (!request) return;
    
    setFixRequests(prev => prev.map(r => 
      r.id === id 
        ? { ...r, status: approved ? 'approved' : 'rejected', processedAt: new Date(), processedBy }
        : r
    ));
    
    if (approved) {
      // Apply the fix
      updateStudent(request.studentId, { [request.field]: request.requestedValue });
    }
  }, [fixRequests, updateStudent]);

  // Settings
  const updateSystemSettings = useCallback((updates: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Utility functions
  const getStudentById = useCallback((id: string) => students.find(s => s.id === id), [students]);
  const getLeadById = useCallback((id: string) => leads.find(l => l.id === id), [leads]);
  const getStaffById = useCallback((id: string) => staff.find(s => s.id === id), [staff]);
  const getDocumentsByStudent = useCallback((studentId: string) => documents.filter(d => d.studentId === studentId), [documents]);
  const getApplicationsByStudent = useCallback((studentId: string) => applications.filter(a => a.studentId === studentId), [applications]);
  const getNotificationsByUser = useCallback((userId: string) => notifications.filter(n => n.userId === userId), [notifications]);
  const getUnreadNotificationCount = useCallback((userId: string) => notifications.filter(n => n.userId === userId && !n.read).length, [notifications]);
  
  const getIdleLeads = useCallback((days: number) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return leads.filter(l => {
      const lastContact = l.lastContactAt || l.createdAt;
      return lastContact < cutoff && l.status !== 'converted' && l.status !== 'lost';
    });
  }, [leads]);
  
  const getIdleApplications = useCallback((days: number) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return applications.filter(a => {
      return a.status === 'pending_admin' && a.submittedToAdminAt && a.submittedToAdminAt < cutoff;
    });
  }, [applications]);
  
  const validatePassportExpiry = useCallback((studentId: string): boolean => {
    const student = students.find(s => s.id === studentId);
    if (!student?.passportExpiry) return false;
    
    const expiryDate = new Date(student.passportExpiry);
    const minExpiry = new Date();
    minExpiry.setMonth(minExpiry.getMonth() + systemSettings.passportExpiryMonths);
    
    return expiryDate > minExpiry;
  }, [students, systemSettings.passportExpiryMonths]);

  const value: EduFlareContextType = {
    leads, students, staff, admins, documents, contracts, invoices,
    applications, universities, commissions, refundRequests, appointments,
    notifications, auditLogs, ledgerEntries, fixRequests, systemSettings,
    addLead, updateLead, changeLeadStatus, convertLeadToStudent,
    updateStudent, changeStudentStatus, lockStudentProfile, unlockStudentProfile,
    unlockStudentFields, setScholarshipType, calculateFinalBalance,
    addDocument, updateDocument, verifyDocument, lockDocuments, unlockDocuments,
    createContract, signContract,
    createInvoice, recordPayment, processRefund,
    createApplication, submitApplicationToAdmin, approveApplication, rejectApplication,
    submitToUniversity, returnFromSchool, recordOfferReceived, releaseOffer,
    triggerCommission, payCommission, voidCommission,
    bookAppointment, cancelAppointment,
    addNotification, markNotificationRead, markAllNotificationsRead,
    submitFixRequest, processFixRequest,
    logAudit, updateSystemSettings,
    getStudentById, getLeadById, getStaffById, getDocumentsByStudent,
    getApplicationsByStudent, getNotificationsByUser, getUnreadNotificationCount,
    getIdleLeads, getIdleApplications, validatePassportExpiry,
  };

  return (
    <EduFlareContext.Provider value={value}>
      {children}
    </EduFlareContext.Provider>
  );
};
