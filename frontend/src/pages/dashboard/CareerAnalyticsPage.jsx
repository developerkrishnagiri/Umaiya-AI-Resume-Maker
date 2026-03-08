import { useEffect, useState } from 'react'
import { jobApi, resumeApi, atsApi, interviewApi } from '../../api'
import { TrendingUp, Briefcase, FileText, Target, Brain, BarChart3, Loader, Award } from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const APP_STATUS_COLORS = { APPLIED: '#6366f1', REVIEWING: '#f59e0b', SHORTLISTED: '#10b981', OFFERED: '#22c55e', REJECTED: '#ef4444' }

export default function CareerAnalyticsPage() {
    const [applied, setApplied] = useState([])
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([jobApi.applied(), resumeApi.list()])
            .then(([a, r]) => { setApplied(a.data || []); setResumes(r.data || []) })
            .finally(() => setLoading(false))
    }, [])

    // Application status breakdown
    const statusCounts = Object.entries(
        applied.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})
    ).map(([name, value]) => ({ name, value }))

    // Applications over time (last 8 weeks)
    const weeklyData = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (7 - i) * 7)
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const count = applied.filter(a => {
            const ad = new Date(a.appliedAt)
            const start = new Date(d); start.setDate(start.getDate() - 7)
            return ad >= start && ad <= d
        }).length
        return { week: label, applications: count }
    })

    const offerRate = applied.length > 0 ? Math.round(applied.filter(a => a.status === 'OFFERED').length / applied.length * 100) : 0
    const shortlistRate = applied.length > 0 ? Math.round(applied.filter(a => ['SHORTLISTED', 'INTERVIEW', 'OFFERED'].includes(a.status)).length / applied.length * 100) : 0

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">Career Analytics</h1><p className="page-desc">Track your job search performance over time</p></div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Briefcase, label: 'Total Applied', value: applied.length, color: 'text-blue-400', bg: 'bg-blue-500/15' },
                    { icon: Award, label: 'Shortlist Rate', value: `${shortlistRate}%`, color: 'text-purple-400', bg: 'bg-purple-500/15' },
                    { icon: TrendingUp, label: 'Offer Rate', value: `${offerRate}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                    { icon: FileText, label: 'Resumes', value: resumes.length, color: 'text-amber-400', bg: 'bg-amber-500/15' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
                        <div><div className="text-2xl font-bold text-white">{value}</div><div className="text-dark-400 text-sm">{label}</div></div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Applications over time */}
                <div className="lg:col-span-2 card p-6">
                    <h2 className="text-white font-bold mb-6">Applications Over Time</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="week" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                            <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} name="Applications" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status breakdown */}
                <div className="card p-6">
                    <h2 className="text-white font-bold mb-6">Application Status</h2>
                    {statusCounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-dark-500">
                            <BarChart3 className="w-10 h-10 mb-2" />
                            <p className="text-sm">No applications yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {statusCounts.map((entry, i) => (
                                        <Cell key={i} fill={APP_STATUS_COLORS[entry.name] || '#6366f1'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-dark-300 text-xs">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Application history table */}
            {applied.length > 0 && (
                <div className="card p-5">
                    <h2 className="text-white font-bold mb-4">Recent Applications</h2>
                    <div className="space-y-2">
                        {applied.slice(0, 8).map(app => (
                            <div key={app.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm font-medium truncate">{app.job?.title}</div>
                                    <div className="text-dark-400 text-xs">{app.job?.company} · {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</div>
                                </div>
                                <span className={`badge text-xs ${app.status === 'OFFERED' ? 'badge-success' : app.status === 'REJECTED' ? 'badge-danger' : app.status === 'SHORTLISTED' ? 'badge-primary' : 'badge-info'}`}>
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
