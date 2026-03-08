import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobApi, adminApi } from '../../api'
import toast from 'react-hot-toast'
import { Briefcase, Plus, Users, Eye, Edit, Trash2, BarChart3, Loader, MapPin, Globe, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function RecruiterDashboard() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => { jobApi.myJobs().then(r => setJobs(r.data || [])).finally(() => setLoading(false)) }
    useEffect(() => { load() }, [])

    const deleteJob = async (id) => {
        if (!confirm('Delete this job?')) return
        try { await jobApi.delete(id); toast.success('Job deleted'); load() } catch { toast.error('Delete failed') }
    }

    const totalApplicants = jobs.reduce((a, j) => a + (j.applicationCount || 0), 0)
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Recruiter Dashboard</h1>
                    <p className="page-desc">Manage your job postings and candidates</p>
                </div>
                <Link to="/recruiter/post-job" className="btn-primary gap-2"><Plus className="w-4 h-4" />Post Job</Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Briefcase, label: 'Total Jobs', value: jobs.length, color: 'text-blue-400', bg: 'bg-blue-500/15' },
                    { icon: Briefcase, label: 'Active Jobs', value: activeJobs, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                    { icon: Users, label: 'Total Applicants', value: totalApplicants, color: 'text-purple-400', bg: 'bg-purple-500/15' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
                        <div><div className="text-2xl font-bold text-white">{loading ? '—' : value}</div><div className="text-dark-400 text-sm">{label}</div></div>
                    </div>
                ))}
            </div>

            {/* Jobs table */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold">My Job Postings</h2>
                    <Link to="/recruiter/post-job" className="btn-secondary btn-sm gap-2"><Plus className="w-3.5 h-3.5" />Post New</Link>
                </div>

                {loading ? <div className="flex justify-center py-10"><Loader className="w-6 h-6 animate-spin text-primary-400" /></div>
                    : jobs.length === 0 ? (
                        <div className="text-center py-10">
                            <Briefcase className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                            <p className="text-dark-400 text-sm">No jobs posted yet. <Link to="/recruiter/post-job" className="text-primary-400">Post your first job</Link></p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map(job => (
                                <div key={job.id} className="glass rounded-xl p-4 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-white font-semibold text-sm truncate">{job.title}</h3>
                                            <span className={`badge text-xs ${job.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{job.status}</span>
                                        </div>
                                        <div className="text-dark-400 text-xs flex items-center gap-3">
                                            <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{job.location || 'Remote'}</span>
                                            <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{job.applicationCount || 0} applicants</span>
                                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : ''}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link to={`/recruiter/candidates/${job.id}`} className="btn-secondary btn-sm gap-1.5"><Users className="w-3.5 h-3.5" />Candidates</Link>
                                        <Link to={`/recruiter/post-job/${job.id}`} className="btn-secondary btn-sm px-2.5"><Edit className="w-3.5 h-3.5" /></Link>
                                        <button onClick={() => deleteJob(job.id)} className="btn-ghost btn-sm px-2.5 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    )
}
