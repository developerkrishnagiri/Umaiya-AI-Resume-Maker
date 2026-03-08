import { useEffect, useState } from 'react'
import { jobApi } from '../../api'
import { Link } from 'react-router-dom'
import { Bookmark, MapPin, DollarSign, Globe, Loader, Briefcase, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SavedJobsPage() {
    const [saved, setSaved] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => { jobApi.saved().then(r => setSaved(r.data || [])).finally(() => setLoading(false)) }
    useEffect(() => { load() }, [])

    const unsave = async (jobId) => {
        try { await jobApi.unsave(jobId); setSaved(p => p.filter(s => s.job?.id !== jobId)); toast.success('Removed') }
        catch { toast.error('Failed') }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">Saved Jobs</h1><p className="page-desc">{saved.length} saved opportunities</p></div>
                <Link to="/dashboard/jobs" className="btn-primary gap-2"><Briefcase className="w-4 h-4" />Browse Jobs</Link>
            </div>
            {loading ? <div className="flex justify-center h-48 items-center"><Loader className="w-8 h-8 text-primary-400 animate-spin" /></div>
                : saved.length === 0 ? (
                    <div className="card p-16 text-center"><Bookmark className="w-14 h-14 text-dark-600 mx-auto mb-4" /><h3 className="text-white font-bold text-lg mb-2">No saved jobs</h3><p className="text-dark-400 text-sm">Bookmark jobs you&apos;re interested in to review them later.</p></div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {saved.map(({ id, job }) => job && (
                            <div key={id} className="card-hover p-5 group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-primary-300 font-bold flex-shrink-0">{job.company?.[0]}</div>
                                    <button onClick={() => unsave(job.id)} className="text-dark-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <h3 className="text-white font-bold mb-0.5">{job.title}</h3>
                                <p className="text-dark-400 text-sm mb-3">{job.company}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.location && <span className="badge badge-info gap-1"><MapPin className="w-2.5 h-2.5" />{job.location}</span>}
                                    {job.remote && <span className="badge badge-success gap-1"><Globe className="w-2.5 h-2.5" />Remote</span>}
                                </div>
                                <Link to={`/dashboard/jobs/${job.id}`} className="btn-primary btn-sm w-full">View & Apply</Link>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
