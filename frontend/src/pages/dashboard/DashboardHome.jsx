import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resumeApi, jobApi, interviewApi, subscriptionApi } from '../../api'
import useAuthStore from '../../store/authStore'
import {
    FileText, Target, Briefcase, Brain, TrendingUp, Plus,
    ArrowRight, CheckCircle, Clock, Star, Zap
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const activityData = [
    { day: 'Mon', score: 62 }, { day: 'Tue', score: 68 }, { day: 'Wed', score: 71 },
    { day: 'Thu', score: 75 }, { day: 'Fri', score: 78 }, { day: 'Sat', score: 80 }, { day: 'Sun', score: 84 },
]

export default function DashboardHome() {
    const { user } = useAuthStore()
    const [resumes, setResumes] = useState([])
    const [applied, setApplied] = useState([])
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            resumeApi.list(),
            jobApi.applied(),
            interviewApi.sessions(),
        ]).then(([r, j, s]) => {
            setResumes(Array.isArray(r.data) ? r.data : [])
            setApplied(Array.isArray(j.data) ? j.data : [])
            setSessions(Array.isArray(s.data) ? s.data : [])
        }).finally(() => setLoading(false))
    }, [])

    const avgAts = 78 // placeholder from latest scans
    const stats = [
        { icon: FileText, label: 'Resumes', value: resumes.length, color: 'text-blue-400', bg: 'bg-blue-500/15', href: '/dashboard/resumes' },
        { icon: Target, label: 'Avg ATS Score', value: `${avgAts}%`, color: 'text-purple-400', bg: 'bg-purple-500/15', href: '/dashboard/ats' },
        { icon: Briefcase, label: 'Applied Jobs', value: applied.length, color: 'text-emerald-400', bg: 'bg-emerald-500/15', href: '/dashboard/applied' },
        { icon: Brain, label: 'Mock Interviews', value: sessions.length, color: 'text-orange-400', bg: 'bg-orange-500/15', href: '/dashboard/interview' },
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Good morning, <span className="gradient-text">{user?.firstName}</span> 👋
                    </h1>
                    <p className="text-dark-400 mt-1">Here&apos;s what&apos;s happening with your job search today.</p>
                </div>
                <Link to="/dashboard/resume/build" className="btn-primary gap-2 flex-shrink-0">
                    <Plus className="w-4 h-4" /> New Resume
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, label, value, color, bg, href }) => (
                    <Link key={label} to={href} className="stat-card hover:-translate-y-1 hover:shadow-glow transition-all duration-300 group">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{loading ? '—' : value}</div>
                            <div className="text-dark-400 text-sm">{label}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-dark-500 mt-auto opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ATS trend chart */}
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-white font-bold">ATS Score Trend</h2>
                            <p className="text-dark-400 text-sm">Your resume quality over the past week</p>
                        </div>
                        <span className="badge badge-success">↑ +22 pts</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[50, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#atsGrad)" dot={{ fill: '#6366f1', r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick actions */}
                <div className="card p-6">
                    <h2 className="text-white font-bold mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {[
                            { icon: FileText, label: 'Build New Resume', href: '/dashboard/resume/build', color: 'text-blue-400' },
                            { icon: Target, label: 'Scan ATS Score', href: '/dashboard/ats', color: 'text-purple-400' },
                            { icon: Zap, label: 'Match Job Description', href: '/dashboard/ats/jd-match', color: 'text-yellow-400' },
                            { icon: Brain, label: 'Practice Interview', href: '/dashboard/interview', color: 'text-orange-400' },
                            { icon: Briefcase, label: 'Browse Jobs', href: '/dashboard/jobs', color: 'text-emerald-400' },
                            { icon: TrendingUp, label: 'Career Analytics', href: '/dashboard/career', color: 'text-pink-400' },
                        ].map(({ icon: Icon, label, href, color }) => (
                            <Link key={href} to={href}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group cursor-pointer">
                                <Icon className={`w-4 h-4 ${color}`} />
                                <span className="text-dark-300 text-sm group-hover:text-white transition">{label}</span>
                                <ArrowRight className="w-3 h-3 text-dark-500 ml-auto opacity-0 group-hover:opacity-100 transition" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent resumes */}
            {resumes.length > 0 && (
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-bold">Recent Resumes</h2>
                        <Link to="/dashboard/resumes" className="text-primary-400 text-sm hover:text-primary-300">View all</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {resumes.slice(0, 3).map(resume => (
                            <Link key={resume.id} to={`/dashboard/resume/build/${resume.id}`}
                                className="glass rounded-xl p-4 hover:bg-white/8 transition group">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white text-sm font-medium truncate">{resume.title}</div>
                                        <div className="text-dark-400 text-xs mt-0.5">{resume.isDraft ? 'Draft' : 'Published'} · {resume.templateId}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Plan upgrade banner (if FREE) */}
            {user?.planType === 'FREE' && (
                <div className="relative card p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="w-5 h-5 text-amber-400" />
                                <span className="text-white font-bold">Upgrade to Pro</span>
                            </div>
                            <p className="text-dark-400 text-sm">Unlock unlimited resumes, full ATS analysis, all templates & AI features.</p>
                        </div>
                        <Link to="/pricing" className="btn-primary flex-shrink-0">Upgrade Now</Link>
                    </div>
                </div>
            )}
        </div>
    )
}
