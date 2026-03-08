import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobApi } from '../../api'
import toast from 'react-hot-toast'
import { Briefcase, Plus, Edit, Trash2, Users, Loader, MapPin, Clock, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function MyJobsPage() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => jobApi.myJobs().then(r => setJobs(r.data || [])).finally(() => setLoading(false))
    useEffect(() => { load() }, [])

    const deleteJob = async (id) => {
        if (!confirm('Delete this job posting?')) return
        try { await jobApi.delete(id); toast.success('Job removed'); load() }
        catch { toast.error('Delete failed') }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">My Job Postings</h1><p className="page-desc">{jobs.length} total postings</p></div>
                <Link to="/recruiter/post-job" className="btn-primary gap-2"><Plus className="w-4 h-4" />Post Job</Link>
            </div>

            {loading ? <div className="flex justify-center h-48 items-center"><Loader className="w-8 h-8 text-primary-400 animate-spin" /></div>
                : jobs.length === 0 ? (
                    <div className="card p-16 text-center">
                        <Briefcase className="w-14 h-14 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">No jobs posted</h3>
                        <Link to="/recruiter/post-job" className="btn-primary inline-flex mt-2 gap-2"><Plus className="w-4 h-4" />Post Your First Job</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map(job => (
                            <div key={job.id} className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-primary-300 font-bold flex-shrink-0">
                                    {job.company?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-semibold truncate">{job.title}</h3>
                                        <span className={clsx('badge text-xs', job.status === 'ACTIVE' ? 'badge-success' : job.status === 'PAUSED' ? 'badge-warning' : 'badge-danger')}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="text-dark-400 text-xs flex flex-wrap gap-3">
                                        <span>{job.company}</span>
                                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{job.location}</span>}
                                        <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{job.applicationCount || 0} applicants</span>
                                        {job.createdAt && <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link to={`/recruiter/candidates/${job.id}`} className="btn-secondary btn-sm gap-1.5">
                                        <Users className="w-3.5 h-3.5" />{job.applicationCount || 0}
                                    </Link>
                                    <Link to={`/recruiter/post-job/${job.id}`} className="btn-secondary btn-sm px-3"><Edit className="w-3.5 h-3.5" /></Link>
                                    <button onClick={() => deleteJob(job.id)} className="btn-ghost btn-sm px-3 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
