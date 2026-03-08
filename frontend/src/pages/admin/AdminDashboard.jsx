import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import { Users, Briefcase, DollarSign, FileText, TrendingUp, BarChart3, Loader } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PIE_COLORS = ['#6366f1', '#d946ef', '#10b981', '#f59e0b']

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { adminApi.stats().then(r => setStats(r.data)).finally(() => setLoading(false)) }, [])

    const pieData = stats ? [
        { name: 'Job Seekers', value: Number(stats.totalJobSeekers) || 0 },
        { name: 'Recruiters', value: Number(stats.totalRecruiters) || 0 },
    ] : []

    const trendData = [
        { month: 'Oct', users: 1200, revenue: 8200 },
        { month: 'Nov', users: 1800, revenue: 12500 },
        { month: 'Dec', users: 2100, revenue: 15800 },
        { month: 'Jan', users: 2800, revenue: 21000 },
        { month: 'Feb', users: 3400, revenue: 28500 },
        { month: 'Mar', users: 4100, revenue: 36200 },
    ]

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>

    const statCards = [
        { icon: Users, label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '—', color: 'text-blue-400', bg: 'bg-blue-500/15', sub: `${stats?.totalJobSeekers} seekers · ${stats?.totalRecruiters} recruiters` },
        { icon: Briefcase, label: 'Active Jobs', value: stats?.activeJobs?.toLocaleString() || '—', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
        { icon: TrendingUp, label: 'Total Applications', value: stats?.totalApplications?.toLocaleString() || '—', color: 'text-purple-400', bg: 'bg-purple-500/15' },
        { icon: DollarSign, label: 'Total Revenue', value: stats?.totalRevenue ? `$${Number(stats.totalRevenue).toLocaleString()}` : '$0', color: 'text-amber-400', bg: 'bg-amber-500/15' },
        { icon: FileText, label: 'Total Resumes', value: stats?.totalResumes?.toLocaleString() || '—', color: 'text-pink-400', bg: 'bg-pink-500/15' },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">Admin Dashboard</h1><p className="page-desc">Platform overview and analytics</p></div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map(({ icon: Icon, label, value, color, bg, sub }) => (
                    <div key={label} className="stat-card">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
                        <div>
                            <div className="text-2xl font-bold text-white">{value}</div>
                            <div className="text-dark-400 text-sm">{label}</div>
                            {sub && <div className="text-dark-500 text-xs mt-0.5">{sub}</div>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Growth chart */}
                <div className="lg:col-span-2 card p-6">
                    <h2 className="text-white font-bold mb-6">Platform Growth</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} /><stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                            <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={2} fill="url(#userGrad)" />
                            <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#d946ef" strokeWidth={2} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* User breakdown pie */}
                <div className="card p-6">
                    <h2 className="text-white font-bold mb-6">User Breakdown</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-dark-300 text-xs">{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
