import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
})

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                try {
                    const { data } = await axios.post('/api/auth/refresh', { refreshToken })
                    localStorage.setItem('accessToken', data.accessToken)
                    original.headers.Authorization = `Bearer ${data.accessToken}`
                    return api(original)
                } catch {
                    localStorage.clear()
                    window.location.href = '/login'
                }
            }
        }
        const msg = error.response?.data?.message || 'Something went wrong'
        if (error.response?.status !== 401) toast.error(msg)
        return Promise.reject(error)
    }
)

// ─── Auth ──────────────────────────────────────────────────
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
}

// ─── Resumes ───────────────────────────────────────────────
export const resumeApi = {
    list: () => api.get('/resumes'),
    get: (id) => api.get(`/resumes/${id}`),
    create: (data) => api.post('/resumes', data),
    update: (id, data) => api.put(`/resumes/${id}`, data),
    delete: (id) => api.delete(`/resumes/${id}`),
    duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
    importFile: (formData) => api.post('/resumes/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ─── ATS ───────────────────────────────────────────────────
export const atsApi = {
    scan: (resumeId, jobDescription) => api.post('/ats/scan', { resumeId, jobDescription }),
    history: (resumeId) => api.get(`/ats/history/${resumeId}`),
    aiImprove: (text, type) => api.post('/ats/ai-improve', { text, type }),
    coverLetter: (resumeId, jobDescription) => api.post('/ats/cover-letter', { resumeId, jobDescription }),
}

// ─── Jobs ──────────────────────────────────────────────────
export const jobApi = {
    search: (params) => api.get('/jobs/public/search', { params }),
    externalSearch: (params) => api.get('/jobs/external/search', { params }),
    get: (id) => api.get(`/jobs/public/${id}`),
    apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
    save: (id) => api.post(`/jobs/${id}/save`),
    unsave: (id) => api.delete(`/jobs/${id}/save`),
    saved: () => api.get('/jobs/saved'),
    applied: () => api.get('/jobs/applied'),
    // Recruiter
    myJobs: () => api.get('/recruiter/jobs'),
    create: (data) => api.post('/recruiter/jobs', data),
    update: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
    delete: (id) => api.delete(`/recruiter/jobs/${id}`),
    candidates: (jobId, params) => api.get(`/recruiter/candidates/${jobId}`, { params }),
    updateAppStatus: (appId, data) => api.put(`/recruiter/applications/${appId}/status`, data),
}

// ─── Interview ─────────────────────────────────────────────
export const interviewApi = {
    questions: (category, limit) => api.get('/interview/questions', { params: { category, limit } }),
    startSession: (data) => api.post('/interview/sessions', data),
    submitAnswer: (sessionId, data) => api.post(`/interview/sessions/${sessionId}/answer`, data),
    sessions: () => api.get('/interview/sessions'),
    getSession: (id) => api.get(`/interview/sessions/${id}`),
    deleteSession: (id) => api.delete(`/interview/sessions/${id}`),
}

// ─── Subscription ──────────────────────────────────────────
export const subscriptionApi = {
    plans: () => api.get('/subscription/plans'),
    checkout: (planId, billingCycle) => api.post('/subscription/checkout', { planId, billingCycle }),
    myPlan: () => api.get('/subscription/my-plan'),
    cancel: () => api.post('/subscription/cancel'),
}

// ─── Admin ─────────────────────────────────────────────────
export const adminApi = {
    stats: () => api.get('/admin/stats'),
    users: (params) => api.get('/admin/users', { params }),
    changeRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    toggleActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    jobs: (params) => api.get('/admin/jobs', { params }),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
    revenue: () => api.get('/admin/analytics/revenue'),
}

// ─── User ──────────────────────────────────────────────────
export const userApi = {
    updateProfile: (data) => api.put('/auth/me', data),
    changePassword: (data) => api.post('/auth/change-password', data),
}

export default api

