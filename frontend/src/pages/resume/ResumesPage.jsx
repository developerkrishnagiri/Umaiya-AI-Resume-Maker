import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumeApi } from '../../api'
import toast from 'react-hot-toast'
import { Plus, FileText, Edit3, Trash2, Copy, Eye, Clock, Loader, Download } from 'lucide-react'

const templateColors = {
    professional: 'from-blue-500 to-indigo-600',
    modern: 'from-purple-500 to-violet-600',
    minimal: 'from-gray-500 to-slate-600',
    creative: 'from-pink-500 to-rose-600',
    corporate: 'from-emerald-500 to-teal-600',
    executive: 'from-amber-500 to-orange-600',
    tech: 'from-cyan-500 to-sky-600',
    elegant: 'from-violet-500 to-purple-600',
    compact: 'from-lime-500 to-green-600',
    ats: 'from-red-500 to-rose-600',
}

export default function ResumesPage() {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const navigate = useNavigate()

    const load = () => {
        resumeApi.list().then(r => setResumes(Array.isArray(r.data) ? r.data : [])).catch(() => setResumes([])).finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const createNew = async () => {
        try {
            const { data } = await resumeApi.create({ title: 'Untitled Resume', templateId: 'professional' })
            navigate(`/dashboard/resume/build/${data.id}`)
        } catch { toast.error('Failed to create resume') }
    }

    const duplicate = async (id, e) => {
        e.preventDefault()
        try {
            await resumeApi.duplicate(id)
            toast.success('Resume duplicated!')
            load()
        } catch { toast.error('Duplicate failed') }
    }

    const remove = async (id, e) => {
        e.preventDefault()
        if (!confirm('Delete this resume?')) return
        try {
            await resumeApi.delete(id)
            toast.success('Resume deleted')
            load()
        } catch { toast.error('Delete failed') }
    }

    const handleImport = async (file) => {
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'json') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Ensure it has required fields or title it if missing
                    data.title = `Imported: ${data.title || file.name}`;
                    const res = await resumeApi.create(data);
                    toast.success('JSON Resume imported!');
                    if (res.data && res.data.id) {
                        navigate(`/dashboard/resume/build/${res.data.id}`);
                    } else {
                        load();
                    }
                } catch (err) {
                    toast.error('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        } else if (['pdf', 'doc', 'docx'].includes(ext)) {
            setImporting(true);
            const loadToast = toast.loading(`Parsing ${ext.toUpperCase()}...`);
            try {
                const formData = new FormData();
                formData.append('file', file);
                const { data } = await resumeApi.importFile(formData);
                toast.success('Resume parsed and imported!', { id: loadToast });
                // Navigate to the newly created resume
                if (data && data.id) {
                    navigate(`/dashboard/resume/build/${data.id}`);
                } else {
                    load();
                }
            } catch (err) {
                toast.error('Failed to parse file. Please try JSON or manual entry.', { id: loadToast });
            } finally {
                setImporting(false);
            }
        } else {
            toast.error('Unsupported file format');
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Resumes</h1>
                    <p className="page-desc">Create and manage your professional resumes</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => document.getElementById('resume-import-input').click()} className="btn-secondary gap-2">
                        <Download className="w-4 h-4" /> Import
                    </button>
                    <button onClick={createNew} className="btn-primary gap-2">
                        <Plus className="w-4 h-4" /> New Resume
                    </button>
                    <input
                        type="file"
                        id="resume-import-input"
                        className="hidden"
                        accept=".json,.pdf,.doc,.docx"
                        onChange={e => handleImport(e.target.files[0])}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
            ) : resumes.length === 0 ? (
                <div className="card p-16 text-center">
                    <FileText className="w-14 h-14 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-bold mb-2">No resumes yet</h3>
                    <p className="text-dark-400 text-sm mb-6">Create your first AI-powered resume to get started</p>
                    <button onClick={createNew} className="btn-primary gap-2 mx-auto">
                        <Plus className="w-4 h-4" /> Create Resume
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Create new card */}
                    <button onClick={createNew}
                        className="card border-2 border-dashed border-white/15 hover:border-primary-500/50 p-8 flex flex-col items-center justify-center gap-3 text-center transition-all hover:bg-primary-500/5 group min-h-[200px]">
                        <div className="w-14 h-14 rounded-2xl bg-primary-500/15 flex items-center justify-center group-hover:bg-primary-500/25 transition">
                            <Plus className="w-7 h-7 text-primary-400" />
                        </div>
                        <span className="text-dark-300 font-medium group-hover:text-white transition">Create New Resume</span>
                    </button>

                    {resumes.map(resume => {
                        const color = templateColors[resume.templateId] || 'from-primary-500 to-accent-500'
                        return (
                            <div key={resume.id} className="card-hover group relative overflow-hidden">
                                {/* Preview area */}
                                <div className={`h-28 bg-gradient-to-br ${color} relative overflow-hidden`}>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                        <FileText className="w-16 h-16 text-white" />
                                    </div>
                                    <div className="absolute top-3 right-3 flex gap-1">
                                        <span className={`badge ${resume.isDraft ? 'badge-warning' : 'badge-success'}`}>
                                            {resume.isDraft ? 'Draft' : 'Ready'}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h3 className="text-white font-bold truncate mb-1">{resume.title}</h3>
                                    <p className="text-dark-400 text-xs mb-4 capitalize">
                                        {resume.templateId} template · Updated {new Date(resume.updatedAt || Date.now()).toLocaleDateString()}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link to={`/dashboard/resume/build/${resume.id}`} className="btn-primary btn-sm flex-1 gap-1.5">
                                            <Edit3 className="w-3 h-3" /> Edit
                                        </Link>
                                        <button onClick={(e) => duplicate(resume.id, e)} className="btn-secondary btn-sm px-3" title="Duplicate">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        <button onClick={(e) => remove(resume.id, e)} className="btn-ghost btn-sm px-3 hover:text-red-400" title="Delete">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
