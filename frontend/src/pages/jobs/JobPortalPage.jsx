import { useEffect, useState } from 'react'
import { jobApi } from '../../api'
import toast from 'react-hot-toast'
import { Search, MapPin, Briefcase, DollarSign, Bookmark, Filter, Loader, Clock, Building, Globe, ExternalLink, Database, Wifi } from 'lucide-react'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const JOB_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP']
const INDUSTRIES = ['', 'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Design', 'Data Science']

export default function JobPortalPage() {
    const [jobs, setJobs] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [saved, setSaved] = useState(new Set())
    const [filters, setFilters] = useState({ keyword: '', location: '', jobType: '', industry: '' })
    const [showFilters, setShowFilters] = useState(false)
    const [source, setSource] = useState('external') // 'internal' | 'external'

    const search = async (p = 0) => {
        setLoading(true)
        try {
            if (source === 'external') {
                const { data } = await jobApi.externalSearch({
                    keyword: filters.keyword,
                    location: filters.location,
                    page: p,
                    size: 20
                })
                setJobs(data.jobs || [])
                setTotal(data.total || 0)
            } else {
                const { data } = await jobApi.search({ ...filters, page: p, size: 12 })
                setJobs((data.content || []).map(j => ({ ...j, external: false, source: 'Platform' })))
                setTotal(data.totalElements || 0)
            }
            setPage(p)
        } catch {
            toast.error('Failed to load jobs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { search() }, [source])

    const toggleSave = async (id, e) => {
        e.preventDefault()
        e.stopPropagation()
        if (id.toString().startsWith('remotive_') || id.toString().startsWith('adzuna_')) {
            toast.error('Cannot save external jobs')
            return
        }
        try {
            if (saved.has(id)) { await jobApi.unsave(id); setSaved(p => { const n = new Set(p); n.delete(id); return n }) }
            else { await jobApi.save(id); setSaved(p => new Set([...p, id])) }
        } catch { toast.error('Failed') }
    }

    const salaryText = (job) => {
        if (job.salary && typeof job.salary === 'string' && job.salary.trim()) return job.salary
        if (!job.salaryMin && !job.salaryMax) return null
        const fmt = n => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
        if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`
        if (job.salaryMin) return `${fmt(job.salaryMin)}+`
        return `Up to ${fmt(job.salaryMax)}`
    }

    const openExternal = (job) => {
        if (job.url) {
            window.open(job.url, '_blank', 'noopener,noreferrer')
        }
    }

    const sourceColor = (src) => {
        switch (src) {
            case 'Remotive': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'Adzuna': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default: return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Job Portal</h1>
                    <p className="page-desc">{total.toLocaleString()} jobs found · Search real jobs from across the web</p>
                </div>
            </div>

            {/* Source tabs */}
            <div className="flex gap-2">
                <button onClick={() => setSource('external')}
                    className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border',
                        source === 'external'
                            ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                            : 'border-white/10 text-dark-400 hover:text-white hover:border-white/25')}>
                    <Wifi className="w-4 h-4" /> External Jobs
                    <span className="text-xs opacity-60">(Remotive, Adzuna)</span>
                </button>
                <button onClick={() => setSource('internal')}
                    className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border',
                        source === 'internal'
                            ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                            : 'border-white/10 text-dark-400 hover:text-white hover:border-white/25')}>
                    <Database className="w-4 h-4" /> Platform Jobs
                </button>
            </div>

            {/* Search bar */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input value={filters.keyword} onChange={e => setFilters(p => ({ ...p, keyword: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && search()}
                            placeholder="Job title, company, or keyword…" className="input pl-9" />
                    </div>
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && search()}
                            placeholder="Location or Remote…" className="input pl-9" />
                    </div>
                    <div className="flex gap-2">
                        {source === 'internal' && (
                            <button onClick={() => setShowFilters(p => !p)} className="btn-secondary gap-2">
                                <Filter className="w-4 h-4" /> Filters
                            </button>
                        )}
                        <button onClick={() => search(0)} className="btn-primary gap-2 px-6">
                            <Search className="w-4 h-4" /> Search
                        </button>
                    </div>
                </div>

                {showFilters && source === 'internal' && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10 animate-slide-up">
                        <div>
                            <label className="input-label">Job Type</label>
                            <select value={filters.jobType} onChange={e => setFilters(p => ({ ...p, jobType: e.target.value }))} className="select">
                                {JOB_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Industry</label>
                            <select value={filters.industry} onChange={e => setFilters(p => ({ ...p, industry: e.target.value }))} className="select">
                                {INDUSTRIES.map(t => <option key={t} value={t}>{t || 'All Industries'}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Job grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader className="w-8 h-8 text-primary-400 animate-spin" /></div>
            ) : jobs.length === 0 ? (
                <div className="card p-16 text-center">
                    <Briefcase className="w-14 h-14 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">No jobs found</h3>
                    <p className="text-dark-400 text-sm">Try adjusting your search filters or switch to {source === 'external' ? 'Platform' : 'External'} jobs</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map(job => (
                        <div key={job.id}
                            onClick={() => job.external ? openExternal(job) : null}
                            className={clsx('card-hover p-5 group cursor-pointer', job.external && 'relative')}>

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {job.companyLogo ? (
                                        <img src={job.companyLogo} alt={job.company}
                                            className="w-10 h-10 rounded-xl object-cover bg-white/10 flex-shrink-0"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                                    ) : null}
                                    <div className={clsx("w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-primary-300 font-bold text-sm flex-shrink-0",
                                        job.companyLogo && 'hidden')}>
                                        {job.company?.[0] || 'C'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {job.source && (
                                        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-medium', sourceColor(job.source))}>
                                            {job.source}
                                        </span>
                                    )}
                                    {!job.external && (
                                        <button onClick={(e) => toggleSave(job.id, e)} className="text-dark-500 hover:text-amber-400 transition">
                                            <Bookmark className={clsx('w-4 h-4', saved.has(job.id) && 'fill-amber-400 text-amber-400')} />
                                        </button>
                                    )}
                                    {job.external && (
                                        <ExternalLink className="w-3.5 h-3.5 text-dark-500 group-hover:text-primary-400 transition" />
                                    )}
                                </div>
                            </div>

                            <h3 className="text-white font-bold mb-0.5 group-hover:text-primary-300 transition line-clamp-2">{job.title}</h3>
                            <p className="text-dark-400 text-sm mb-3">{job.company}</p>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {job.location && <span className="badge badge-info gap-1"><MapPin className="w-2.5 h-2.5" />{job.location.length > 30 ? job.location.substring(0, 30) + '…' : job.location}</span>}
                                {job.jobType && <span className="badge badge-primary">{job.jobType.replace('_', ' ')}</span>}
                                {job.remote && <span className="badge badge-success gap-1"><Globe className="w-2.5 h-2.5" />Remote</span>}
                            </div>

                            {job.tags && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {job.tags.slice(0, 4).map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-dark-400 border border-white/5">{tag}</span>
                                    ))}
                                    {job.tags.length > 4 && <span className="text-[10px] text-dark-500">+{job.tags.length - 4}</span>}
                                </div>
                            )}

                            {salaryText(job) && (
                                <p className="text-emerald-400 text-sm font-semibold mb-3 flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />{salaryText(job)}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <p className="text-dark-500 text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {job.publishedAt || job.createdAt
                                        ? formatDistanceToNow(new Date(job.publishedAt || job.createdAt), { addSuffix: true })
                                        : 'Recently'}
                                </p>
                                {job.category && (
                                    <span className="text-dark-400 text-xs">{job.category}</span>
                                )}
                                {!job.external && (
                                    <span className="text-dark-400 text-xs">{job.applicationCount || 0} applicants</span>
                                )}
                            </div>

                            {job.external && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openExternal(job) }}
                                        className="w-full btn-primary btn-sm gap-2 text-xs py-2">
                                        <ExternalLink className="w-3 h-3" /> Apply on {job.source}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2 pt-4">
                    <button onClick={() => search(page - 1)} disabled={page === 0} className="btn-secondary btn-sm">Previous</button>
                    <span className="btn-ghost btn-sm">Page {page + 1} of {Math.ceil(total / 20)}</span>
                    <button onClick={() => search(page + 1)} disabled={(page + 1) * 20 >= total} className="btn-secondary btn-sm">Next</button>
                </div>
            )}
        </div>
    )
}
