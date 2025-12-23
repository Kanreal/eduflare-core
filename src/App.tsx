import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EduFlareProvider } from "@/contexts/EduFlareContext";

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

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationQueue from "./pages/admin/ApplicationQueue";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import FinancialHub from "./pages/admin/FinancialHub";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import StaffManager from "./pages/admin/StaffManager";
import UniversityManager from "./pages/admin/UniversityManager";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EduFlareProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/book-consultation" replace />} />
              <Route path="/book-consultation" element={<BookConsultation />} />
              
              {/* Auth Routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/portal/login" element={<InternalLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Student Portal Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/documents" element={<StudentDocuments />} />
              <Route path="/student/applications" element={<StudentApplications />} />
              <Route path="/student/financials" element={<StudentFinancials />} />
              <Route path="/student/offers" element={<StudentOffers />} />
              <Route path="/student/appointments" element={<StudentAppointments />} />
              <Route path="/student/settings" element={<StudentSettings />} />
              
              {/* Staff Portal Routes */}
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/leads" element={<LeadManager />} />
              <Route path="/staff/students" element={<ActiveStudents />} />
              <Route path="/staff/students/:id" element={<StudentDetail />} />
              <Route path="/staff/contracts" element={<ContractManager />} />
              <Route path="/staff/universities" element={<UniversityList />} />
              <Route path="/staff/calendar" element={<StaffCalendar />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
              
              {/* Admin Portal Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/applications" element={<ApplicationQueue />} />
              <Route path="/admin/applications/:id" element={<ApplicationDetail />} />
              <Route path="/admin/financials" element={<FinancialHub />} />
              <Route path="/admin/staff" element={<StaffManager />} />
              <Route path="/admin/universities" element={<UniversityManager />} />
              <Route path="/admin/audit" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EduFlareProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
