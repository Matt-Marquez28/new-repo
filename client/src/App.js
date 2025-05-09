import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./components/shared-pages/LandingPage";
import LoginPage from "./components/shared-pages/LoginPage";
import SignupPage from "./components/shared-pages/SignupPage";
import { ToastProvider } from "./contexts/toast.context";
import JobSeekerLayout from "./components/jobseeker-ui/JobSeekerLayout";
import JobSeekerDashboard from "./components/jobseeker-pages/JobSeekerDashboard";
import JobSeekerProfile from "./components/jobseeker-pages/JobSeekerProfile";
import EmployerLayout from "./components/employer-ui/EmployerLayout";
import EmployerDashboard from "./components/employer-pages/EmployerDashboard";
import CompanyProfile from "./components/employer-pages/CompanyProfile";
import Test from "./components/Test";
import JobVacancyPage from "./components/employer-pages/JobVacancyPage";
import JobVacancyDetailsPage from "./components/jobseeker-pages/JobVacancyDetailsPage";
import { UserProvider } from "./contexts/user.context";
import "./styled.css";
import ApplicationDetails from "./components/employer-pages/ApplicationDetails";
import AdminLayout from "./components/admin-ui/AdminLayout";
import AdminDashboard from "./components/admin-pages/AdminDashboard";
import AdminLoginPage from "./components/admin-pages/AdminLoginPage";
import UserManagementPage from "./components/admin-pages/UserManagementPage";
import CompanyVerification from "./components/admin-pages/CompanyVerification";
import CompanyVerificationDetails from "./components/admin-pages/CompanyVerificationDetails";
import VerificationPage from "./components/shared-pages/VerificationPage";
import JobVacancyVerification from "./components/admin-pages/JobVacancyVerification";
import JobVacancyVerificationDetails from "./components/admin-pages/JobVacancyVerificationDetails";
import JobVacancyDetails from "./components/employer-pages/JobVacancyDetails";
import AuditTrail from "./components/admin-pages/AuditTrail";
import AccreditedCompanies from "./components/admin-pages/AccreditedCompanies";
import HiredApplicants from "./components/admin-pages/HiredApplicants";
import JobSeekerDetails from "./components/employer-ui/JobSeekerDetails";
import SettingsPage from "./components/shared-pages/SettingsPage";
import ForgotPasswordPage from "./components/shared-pages/ForgotPasswordPage";
import ResetPassword from "./components/shared-pages/ResetPassword";
import ChangePasswordPage from "./components/shared-pages/ChangePasswordPage";
import ApplicationDetail from "./components/jobseeker-pages/ApplicationDetail";
import { useUser } from "./contexts/user.context";
import { SocketProvider } from "./contexts/socket.context";
import UserOption from "./components/admin-pages/UserOption";
import RegularUsers from "./components/admin-pages/RegularUsers";
import Notification from "./components/shared-pages/Notification";
import BrowseJobs from "./components/shared-ui/BrowseJobs";
import CompanyInformation from "./components/jobseeker-pages/CompanyInformation";
import SearchCompanies from "./components/shared-pages/SearchCompanies";
import JobFairPage from "./components/admin-pages/JobFairPage";
import JobFair from "./components/shared-pages/JobFair";
import PreRegistrationDetails from "./components/shared-pages/PreRegistrationDetails";
import JobFairDetails from "./components/admin-pages/JobFairDetails";
import Export from "./components/Export";
import ApplicationReports from "./components/admin-pages/ApplicationReports";
import Scanner from "./components/admin-pages/Scanner";
import EmployerVerification from "./components/admin-pages/EmployerVerification";
import CompanyReports from "./components/admin-pages/CompanyReports";

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </SocketProvider>
    </UserProvider>
  );
}

const AppRoutes = () => {
  const { user } = useUser();
  return (
    <Routes>
      {/* public routes */}
      <Route path="/application-reports" element={<ApplicationReports />} />
      <Route path="/export" element={<Export />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/browse-jobs" element={<BrowseJobs />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verification" element={<VerificationPage />} />
      <Route path="/test" element={<Test />} />
      <Route path="/job-fair" element={<JobFair />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

      {/* private routes for job seeker */}
      <Route
        path="/jobseeker/*"
        element={
          user && user.accountData.role === "jobseeker" ? (
            <JobSeekerLayout />
          ) : (
            <Navigate to="/" />
          )
        }
      >
        <Route index element={<Navigate to="/jobseeker/dashboard" />} />
        <Route path="settings" element={<SettingsPage />} />

        <Route
          path="settings/change-password"
          element={<ChangePasswordPage />}
        />
        <Route path="notification" element={<Notification />} />

        <Route path="job-fair" element={<JobFair />} />
        <Route
          path="job-fair/pre-registration-details"
          element={<PreRegistrationDetails />}
        />
        <Route path="dashboard" element={<JobSeekerDashboard />} />
        <Route path="profile" element={<JobSeekerProfile />} />
        <Route path="search-companies" element={<SearchCompanies />} />
        <Route
          path="company-information/:companyId"
          element={<CompanyInformation />}
        />
        <Route
          path="job-vacancy-details/:jobVacancyId"
          element={<JobVacancyDetailsPage />}
        />
        <Route
          path="application-details/:applicationId"
          element={<ApplicationDetail />}
        />
      </Route>

      {/* private routes for employer */}
      <Route
        path="/employer/*"
        element={
          user && user.accountData.role === "employer" ? (
            <EmployerLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Navigate to="/employer/dashboard" />} />
        <Route
          path="application-details/:applicationId"
          element={<ApplicationDetails />}
        />
        <Route
          path="jobseeker-details/:jobSeekerId"
          element={<JobSeekerDetails />}
        />
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="job-fair" element={<JobFair />} />
        <Route
          path="job-fair/pre-registration-details"
          element={<PreRegistrationDetails />}
        />
        <Route
          path="settings/change-password"
          element={<ChangePasswordPage />}
        />
        <Route path="notification" element={<Notification />} />
        <Route path="company-profile" element={<CompanyProfile />} />
        <Route path="job-vacancy" element={<JobVacancyPage />} />
        <Route
          path="job-vacancy-details/:jobVacancyId"
          element={<JobVacancyDetails />}
        />
      </Route>

      {/* private route for administrator */}
      <Route
        path="/admin/*"
        element={
          user &&
          (user.accountData.role === "admin" ||
            user.accountData.role === "staff") ? (
            <AdminLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="application-reports" element={<ApplicationReports />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route
          path="employer-verification"
          element={<EmployerVerification />}
        />
        <Route path="job-fair" element={<JobFairPage />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="job-fair/details/:eventId" element={<JobFairDetails />} />
        <Route path="notification" element={<Notification />} />
        <Route
          path="dashboard/accredited-companies"
          element={<AccreditedCompanies />}
        />
        <Route path="company-reports" element={<CompanyReports />} />
        <Route
          path="user-management/system-users"
          element={
            user?.accountData?.role === "admin" ? (
              <UserManagementPage />
            ) : (
              <Navigate to="/admin/dashboard" />
            )
          }
        />
        <Route
          path="user-management/regular-users"
          element={<RegularUsers />}
        />
        <Route path="user-management/user-option" element={<UserOption />} />
        <Route
          path="dashboard/hired-applicants"
          element={<HiredApplicants />}
        />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="settings/change-password"
          element={<ChangePasswordPage />}
        />
        <Route
          path="verification/job-vacancy"
          element={<JobVacancyVerification />}
        />
        <Route path="verification/company" element={<CompanyVerification />} />
        <Route
          path="verification/company/company-verification-details/:companyId"
          element={<CompanyVerificationDetails />}
        />
        <Route
          path="verification/job-vacancy/job-vacancy-verification-details/:jobVacancyId"
          element={<JobVacancyVerificationDetails />}
        />
        <Route path="audit-trail" element={<AuditTrail />} />
      </Route>
    </Routes>
  );
};

export default App;
