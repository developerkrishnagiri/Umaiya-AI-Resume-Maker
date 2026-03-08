import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'
import { Briefcase, Search, Trash2, Loader, MapPin, Users, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)

    const load = (p = 0) => {
        setLoading(true)
        adminApi.jobs({ page: p, size: 20 })
            .then(r => { setJobs(r.data?.content || []); setTotal(r.data?.totalElements || 0); setPage(p) })
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const deleteJob = async (id) => {
        if (!confirm('Delete this job?')) return
        try { await adminApi.deleteJob(id); toast.success('Job deleted'); load(page) }
        catch { toast.error('Failed') }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">Job Management</h1><p className="page-desc">{total} total jobs</p></div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/10">
                            <tr>
                                {['Job', 'Company', 'Status', 'Applications', 'Posted', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-dark-400 font-medium text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center"><Loader className="w-6 h-6 animate-spin text-primary-400 mx-auto" /></td></tr>
                            ) : jobs.map(job => (
                                <tr key={job.id} className="hover:bg-white/3 transition">
                                    <td className="px-4 py-3">
                                        <div className="text-white font-medium">{job.title}</div>
                                        <div className="text-dark-400 text-xs flex items-center gap-1 mt-0.5 capitalize">
                                            {job.location && <><MapPin className="w-2.5 h-2.5" />{job.location}</>}
                                            {job.jobType && <> · {job.jobType.replace('_', ' ')}</>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-dark-300">{job.company}</td>
                                    <td className="px-4 py-3">
                                        <span className={clsx('badge text-xs', job.status === 'ACTIVE' ? 'badge-success' : job.status === 'PAUSED' ? 'badge-warning' : 'badge-danger')}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-dark-300 flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />{job.applicationCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-dark-400 text-xs">
                                        {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => deleteJob(job.id)} className="btn-ghost p-1.5 rounded-lg hover:text-red-400">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {total > 20 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-white/10">
                        <span className="text-dark-400 text-xs">Page {page + 1} of {Math.ceil(total / 20)}</span>
                        <div className="flex gap-2">
                            <button onClick={() => load(page - 1)} disabled={page === 0} className="btn-secondary btn-sm">Previous</button>
                            <button onClick={() => load(page + 1)} disabled={(page + 1) * 20 >= total} className="btn-secondary btn-sm">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
