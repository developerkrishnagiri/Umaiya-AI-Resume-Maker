import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobApi, resumeApi } from '../../api'
import toast from 'react-hot-toast'
import { MapPin, Briefcase, DollarSign, Globe, Clock, Users, Bookmark, Send, ArrowLeft, Building, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [resumeId, setResumeId] = useState('')
    const [coverLetter, setCoverLetter] = useState('')

    useEffect(() => {
        Promise.all([jobApi.get(id), resumeApi.list()])
            .then(([j, r]) => {
                setJob(j.data)
                setResumes(r.data || [])
                setResumeId(r.data?.[0]?.id || '')
            })
            .finally(() => setLoading(false))
    }, [id])

    const apply = async () => {
        setApplying(true)
        try {
            await jobApi.apply(id, { resumeId, coverLetter })
            setApplied(true)
            toast.success('Application submitted! 🎉')
        } catch (e) {
            toast.error(e.response?.data?.message || 'Application failed')
        } finally { setApplying(false) }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>
    if (!job) return <div className="text-center text-dark-400 py-20">Job not found</div>

    return (
        <div className="max-w-4xl animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn-ghost mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="card p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-primary-300 font-bold text-xl flex-shrink-0">
                                {job.company?.[0]}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                                <p className="text-dark-400 mt-0.5">{job.company} · {job.industry}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {job.location && <span className="badge badge-info gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                            {job.jobType && <span className="badge badge-primary">{job.jobType.replace('_', ' ')}</span>}
                            {job.remote && <span className="badge badge-success gap-1"><Globe className="w-3 h-3" />Remote</span>}
                            {job.experienceLevel && <span className="badge badge-warning">{job.experienceLevel}</span>}
                        </div>

                        {(job.salaryMin || job.salaryMax) && (
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-6">
                                <DollarSign className="w-4 h-4" />
                                {job.salaryMin && `$${(job.salaryMin / 1000).toFixed(0)}k`}{job.salaryMax && ` – $${(job.salaryMax / 1000).toFixed(0)}k`} / year
                            </div>
                        )}

                        <div className="divider" />

                        <h2 className="text-white font-bold mb-3">About the Role</h2>
                        <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>

                        {job.requirements?.length > 0 && (
                            <>
                                <h2 className="text-white font-bold mt-6 mb-3">Requirements</h2>
                                <ul className="space-y-2">
                                    {job.requirements.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                                            <span className="text-primary-400 mt-0.5">✓</span>{r}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {job.benefits?.length > 0 && (
                            <>
                                <h2 className="text-white font-bold mt-6 mb-3">Benefits</h2>
                                <ul className="space-y-2">
                                    {job.benefits.map((b, i) => (
                                        <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                                            <span className="text-emerald-400 mt-0.5">🎁</span>{b}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {job.keywords?.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-white font-bold mb-3">Skills Required</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.keywords.map(k => <span key={k} className="badge badge-primary">{k}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Apply panel */}
                <div className="space-y-4">
                    <div className="card p-5 lg:sticky lg:top-20">
                        <div className="text-xs text-dark-400 mb-4 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'recently'}
                            <span className="ml-auto flex items-center gap-1 text-dark-500"><Users className="w-3.5 h-3.5" />{job.applicationCount || 0} applied</span>
                        </div>

                        {applied ? (
                            <div className="text-center py-4">
                                <span className="text-4xl">🎉</span>
                                <p className="text-emerald-400 font-bold mt-2">Applied!</p>
                                <p className="text-dark-400 text-xs mt-1">We&apos;ll notify you of updates</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">Select Resume</label>
                                    <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="select">
                                        {resumes.length === 0 ? <option>No resumes — create one first</option> : resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Cover Letter (optional)</label>
                                    <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} placeholder="Why are you a great fit for this role?" className="textarea text-xs" />
                                </div>
                                <button onClick={apply} disabled={applying || resumes.length === 0} className="btn-primary w-full gap-2 py-3">
                                    {applying ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {applying ? 'Submitting…' : 'Apply Now'}
                                </button>
                                <button className="btn-secondary w-full gap-2"><Bookmark className="w-4 h-4" />Save Job</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
