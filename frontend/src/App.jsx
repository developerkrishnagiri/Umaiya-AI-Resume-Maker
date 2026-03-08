import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import OAuth2RedirectPage from './pages/auth/OAuth2RedirectPage'

// Public
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/PricingPage'

// Dashboard layout + pages
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import ResumesPage from './pages/resume/ResumesPage'
import ResumeBuilderPage from './pages/resume/ResumeBuilderPage'
import AtsPage from './pages/ats/AtsPage'
import JdMatchPage from './pages/ats/JdMatchPage'
import CoverLetterPage from './pages/ats/CoverLetterPage'
import JobPortalPage from './pages/jobs/JobPortalPage'
import JobDetailPage from './pages/jobs/JobDetailPage'
import AppliedJobsPage from './pages/jobs/AppliedJobsPage'
import SavedJobsPage from './pages/jobs/SavedJobsPage'
import InterviewPrepPage from './pages/interview/InterviewPrepPage'
import MockInterviewPage from './pages/interview/MockInterviewPage'
import CareerAnalyticsPage from './pages/dashboard/CareerAnalyticsPage'
import AccountPage from './pages/dashboard/AccountPage'

// Recruiter pages
import RecruiterLayout from './components/layout/RecruiterLayout'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import PostJobPage from './pages/recruiter/PostJobPage'
import CandidatesPage from './pages/recruiter/CandidatesPage'
import MyJobsPage from './pages/recruiter/MyJobsPage'

// Admin pages
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminJobsPage from './pages/admin/AdminJobsPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'

// Guards
function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, user } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
    return children
}

function PublicOnlyRoute({ children }) {
    const { isAuthenticated } = useAuthStore()
    if (isAuthenticated) return <Navigate to="/dashboard" replace />
    return children
}

export default function App() {
    const { isAuthenticated, fetchMe } = useAuthStore()

    useEffect(() => {
        if (isAuthenticated) fetchMe()
    }, [])

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
                    duration: 4000,
                }}
            />
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

                {/* Auth (public only) */}
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Job Seeker Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardHome />} />
                    <Route path="resumes" element={<ResumesPage />} />
                    <Route path="resume/build" element={<ResumeBuilderPage />} />
                    <Route path="resume/build/:id" element={<ResumeBuilderPage />} />
                    <Route path="ats" element={<AtsPage />} />
                    <Route path="ats/jd-match" element={<JdMatchPage />} />
                    <Route path="cover-letter" element={<CoverLetterPage />} />
                    <Route path="jobs" element={<JobPortalPage />} />
                    <Route path="jobs/:id" element={<JobDetailPage />} />
                    <Route path="applied" element={<AppliedJobsPage />} />
                    <Route path="saved" element={<SavedJobsPage />} />
                    <Route path="interview" element={<InterviewPrepPage />} />
                    <Route path="interview/mock" element={<MockInterviewPage />} />
                    <Route path="career" element={<CareerAnalyticsPage />} />
                    <Route path="account" element={<AccountPage />} />
                </Route>

                {/* Recruiter Dashboard */}
                <Route path="/recruiter" element={<ProtectedRoute roles={['RECRUITER', 'ADMIN']}><RecruiterLayout /></ProtectedRoute>}>
                    <Route index element={<RecruiterDashboard />} />
                    <Route path="post-job" element={<PostJobPage />} />
                    <Route path="post-job/:id" element={<PostJobPage />} />
                    <Route path="jobs" element={<MyJobsPage />} />
                    <Route path="candidates/:jobId" element={<CandidatesPage />} />
                </Route>

                {/* Admin Dashboard */}
                <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="jobs" element={<AdminJobsPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
