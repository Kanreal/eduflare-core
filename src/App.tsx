import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EduFlareProvider } from "@/contexts/EduFlareContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages
import StudentLogin from "./pages/auth/StudentLogin";
import InternalLogin from "./pages/auth/InternalLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import BookConsultation from "./pages/public/BookConsultation";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentDocuments from "./pages/student/StudentDocuments";
import StudentApplications from "./pages/student/StudentApplications";
import StudentFinancials from "./pages/student/StudentFinancials";
import StudentOffers from "./pages/student/StudentOffers";
import StudentAppointments from "./pages/student/StudentAppointments";
import StudentSettings from "./pages/student/StudentSettings";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import LeadManager from "./pages/staff/LeadManager";
import ActiveStudents from "./pages/staff/ActiveStudents";
import ContractManager from "./pages/staff/ContractManager";
import StudentDetail from "./pages/staff/StudentDetail";
import UniversityList from "./pages/staff/UniversityList";
import StaffCalendar from "./pages/staff/StaffCalendar";
import StaffProfile from "./pages/staff/StaffProfile";
import ApplicationManager from "./pages/staff/ApplicationManager";
import StaffApplicationDetail from "./pages/staff/ApplicationDetail";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationQueue from "./pages/admin/ApplicationQueue";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import FinancialHub from "./pages/admin/FinancialHub";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import StaffManager from "./pages/admin/StaffManager";
import UniversityManager from "./pages/admin/UniversityManager";
import ContractTemplates from "./pages/admin/ContractTemplates";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EduFlareProvider>
        <ImpersonationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ImpersonationBanner />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/book-consultation" replace />} />
                <Route path="/book-consultation" element={<BookConsultation />} />
                
                {/* Auth Routes */}
                <Route path="/login/student" element={<StudentLogin />} />
                <Route path="/login/internal" element={<InternalLogin />} />
                <Route path="/student/login" element={<Navigate to="/login/student" replace />} />
                <Route path="/portal/login" element={<Navigate to="/login/internal" replace />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Student Portal Routes - Protected */}
                <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
                <Route path="/student/documents" element={<ProtectedRoute allowedRoles={['student']}><StudentDocuments /></ProtectedRoute>} />
                <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><StudentApplications /></ProtectedRoute>} />
                <Route path="/student/financials" element={<ProtectedRoute allowedRoles={['student']}><StudentFinancials /></ProtectedRoute>} />
                <Route path="/student/offers" element={<ProtectedRoute allowedRoles={['student']}><StudentOffers /></ProtectedRoute>} />
                <Route path="/student/appointments" element={<ProtectedRoute allowedRoles={['student']}><StudentAppointments /></ProtectedRoute>} />
                <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><StudentSettings /></ProtectedRoute>} />
                
                {/* Staff Portal Routes - Protected */}
                <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
                <Route path="/staff/leads" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><LeadManager /></ProtectedRoute>} />
                <Route path="/staff/students" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ActiveStudents /></ProtectedRoute>} />
                <Route path="/staff/students/:id" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StudentDetail /></ProtectedRoute>} />
                <Route path="/staff/contracts" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ContractManager /></ProtectedRoute>} />
                <Route path="/staff/universities" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><UniversityList /></ProtectedRoute>} />
                <Route path="/staff/applications" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ApplicationManager /></ProtectedRoute>} />
                <Route path="/staff/applications/:id" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffApplicationDetail /></ProtectedRoute>} />
                <Route path="/staff/calendar" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffCalendar /></ProtectedRoute>} />
                <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffProfile /></ProtectedRoute>} />
                
                {/* Admin Portal Routes - Protected */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><ApplicationQueue /></ProtectedRoute>} />
                <Route path="/admin/applications/:id" element={<ProtectedRoute allowedRoles={['admin']}><ApplicationDetail /></ProtectedRoute>} />
                <Route path="/admin/financials" element={<ProtectedRoute allowedRoles={['admin']}><FinancialHub /></ProtectedRoute>} />
                <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManager /></ProtectedRoute>} />
                <Route path="/admin/universities" element={<ProtectedRoute allowedRoles={['admin']}><UniversityManager /></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/contracts" element={<ProtectedRoute allowedRoles={['admin']}><ContractTemplates /></ProtectedRoute>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ImpersonationProvider>
      </EduFlareProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
