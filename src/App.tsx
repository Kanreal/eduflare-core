import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Auth Pages
import StudentLogin from "./pages/auth/StudentLogin";
import InternalLogin from "./pages/auth/InternalLogin";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentDocuments from "./pages/student/StudentDocuments";
import StudentApplications from "./pages/student/StudentApplications";
import StudentFinancials from "./pages/student/StudentFinancials";
import StudentOffers from "./pages/student/StudentOffers";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing - redirect to student login */}
            <Route path="/" element={<Navigate to="/student/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/portal/login" element={<InternalLogin />} />
            
            {/* Student Portal Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/documents" element={<StudentDocuments />} />
            <Route path="/student/applications" element={<StudentApplications />} />
            <Route path="/student/financials" element={<StudentFinancials />} />
            <Route path="/student/offers" element={<StudentOffers />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
