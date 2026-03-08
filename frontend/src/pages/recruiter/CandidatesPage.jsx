import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { jobApi } from '../../api'
import toast from 'react-hot-toast'
import { Users, Loader, FileText, Mail, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const STATUSES = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED']
const STATUS_STYLES = { APPLIED: 'badge-info', REVIEWING: 'badge-warning', SHORTLISTED: 'badge-primary', INTERVIEW: 'badge-primary', OFFERED: 'badge-success', REJECTED: 'badge-danger' }

export default function CandidatesPage() {
    const { jobId } = useParams()
    const [candidates, setCandidates] = useState([])
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            jobApi.candidates(jobId, { page: 0, size: 50 }),
            jobApi.get(jobId),
        ]).then(([c, j]) => {
            setCandidates(c.data?.content || [])
            setJob(j.data)
        }).finally(() => setLoading(false))
    }, [jobId])

    const updateStatus = async (appId, status) => {
        try {
            await jobApi.updateAppStatus(appId, { status })
            setCandidates(p => p.map(c => c.id === appId ? { ...c, status } : c))
            toast.success(`Status updated to ${status}`)
        } catch { toast.error('Update failed') }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Candidates</h1>
                    <p className="page-desc">{job?.title} at {job?.company} · {candidates.length} applicants</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center h-48 items-center"><Loader className="w-8 h-8 text-primary-400 animate-spin" /></div>
            ) : candidates.length === 0 ? (
                <div className="card p-16 text-center">
                    <Users className="w-14 h-14 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">No applications yet</h3>
                    <p className="text-dark-400 text-sm">Candidates who apply to this job will appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {candidates.map(app => (
                        <div key={app.id} className="card p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {app.user?.firstName?.[0]}{app.user?.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold">{app.user?.firstName} {app.user?.lastName}</h3>
                                <div className="text-dark-400 text-xs flex items-center gap-3 mt-0.5">
                                    <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{app.user?.email}</span>
                                    {app.appliedAt && <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>}
                                </div>
                                {app.coverLetter && (
                                    <p className="text-dark-400 text-xs mt-1 line-clamp-2">{app.coverLetter}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                {app.matchScore != null && (
                                    <div className="text-center">
                                        <div className={clsx('font-bold text-sm', app.matchScore >= 80 ? 'text-emerald-400' : app.matchScore >= 60 ? 'text-amber-400' : 'text-red-400')}>
                                            {Math.round(app.matchScore)}%
                                        </div>
                                        <div className="text-dark-500 text-xs">Match</div>
                                    </div>
                                )}
                                <select
                                    value={app.status}
                                    onChange={e => updateStatus(app.id, e.target.value)}
                                    className={clsx('badge cursor-pointer bg-transparent border focus:outline-none', STATUS_STYLES[app.status] || 'badge-info')}
                                >
                                    {STATUSES.map(s => <option key={s} value={s} className="bg-dark-800 text-white">{s}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
