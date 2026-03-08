import { useEffect, useState } from 'react'
import { jobApi } from '../../api'
import { Link } from 'react-router-dom'
import { Send, Clock, MapPin, Briefcase, Loader, CheckCircle, XCircle, Eye } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
    APPLIED: 'badge-info',
    REVIEWING: 'badge-warning',
    SHORTLISTED: 'badge-primary',
    INTERVIEW: 'badge-primary',
    OFFERED: 'badge-success',
    REJECTED: 'badge-danger',
}

export default function AppliedJobsPage() {
    const [applied, setApplied] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { jobApi.applied().then(r => setApplied(r.data || [])).finally(() => setLoading(false)) }, [])

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">Applied Jobs</h1><p className="page-desc">Track all your job applications</p></div>
                <Link to="/dashboard/jobs" className="btn-primary gap-2"><Briefcase className="w-4 h-4" />Browse Jobs</Link>
            </div>

            {loading ? <div className="flex justify-center h-48 items-center"><Loader className="w-8 h-8 text-primary-400 animate-spin" /></div>
                : applied.length === 0 ? (
                    <div className="card p-16 text-center"><Send className="w-14 h-14 text-dark-600 mx-auto mb-4" /><h3 className="text-white font-bold text-lg mb-2">No applications yet</h3><p className="text-dark-400 text-sm">Browse jobs and start applying!</p></div>
                ) : (
                    <div className="space-y-3">
                        {applied.map(app => (
                            <div key={app.id} className="card-hover p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-primary-300 font-bold text-sm flex-shrink-0">
                                    {app.job?.company?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate">{app.job?.title}</h3>
                                    <p className="text-dark-400 text-xs">{app.job?.company} · {app.job?.location}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={clsx('badge', STATUS_STYLES[app.status] || 'badge-info')}>{app.status}</span>
                                    <span className="text-dark-500 text-xs">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</span>
                                    <Link to={`/dashboard/jobs/${app.job?.id}`} className="btn-ghost p-2 rounded-xl"><Eye className="w-4 h-4" /></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
