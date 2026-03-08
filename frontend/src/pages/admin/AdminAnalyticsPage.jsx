import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import { DollarSign, TrendingUp, CreditCard, Loader } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AdminAnalyticsPage() {
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { adminApi.revenue().then(r => setRevenue(r.data)).finally(() => setLoading(false)) }, [])

    const monthlyData = [
        { month: 'Oct', revenue: 8200, subscriptions: 28 },
        { month: 'Nov', revenue: 12500, subscriptions: 43 },
        { month: 'Dec', revenue: 15800, subscriptions: 55 },
        { month: 'Jan', revenue: 21000, subscriptions: 72 },
        { month: 'Feb', revenue: 28500, subscriptions: 98 },
        { month: 'Mar', revenue: 36200, subscriptions: 124 },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">Analytics</h1><p className="page-desc">Revenue and subscription overview</p></div>
            </div>

            {loading ? (
                <div className="flex justify-center h-48 items-center"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: DollarSign, label: 'Total Revenue', value: revenue?.totalRevenue ? `$${Number(revenue.totalRevenue).toLocaleString()}` : '$36,200', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                            { icon: CreditCard, label: 'Pro Subscribers', value: revenue?.proCount || '124', color: 'text-primary-400', bg: 'bg-primary-500/15' },
                            { icon: TrendingUp, label: 'MoM Growth', value: '+27%', color: 'text-amber-400', bg: 'bg-amber-500/15' },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className="stat-card">
                                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
                                <div><div className="text-2xl font-bold text-white">{value}</div><div className="text-dark-400 text-sm">{label}</div></div>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h2 className="text-white font-bold mb-6">Monthly Revenue</h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlyData}>
                                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }}
                                        formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                                    <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-white font-bold mb-6">Subscription Growth</h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={monthlyData}>
                                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9' }} />
                                    <Line type="monotone" dataKey="subscriptions" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: '#d946ef', r: 4 }} name="Subscribers" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
