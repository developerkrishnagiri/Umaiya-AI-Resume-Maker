import { useState, useEffect } from 'react'
import { resumeApi, atsApi } from '../../api'
import toast from 'react-hot-toast'
import { FileText, Loader, Copy, Wand2, Download } from 'lucide-react'

export default function CoverLetterPage() {
    const [resumes, setResumes] = useState([])
    const [resumeId, setResumeId] = useState('')
    const [jd, setJd] = useState('')
    const [letter, setLetter] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => { resumeApi.list().then(r => { setResumes(r.data || []); setResumeId(r.data?.[0]?.id || '') }) }, [])

    const generate = async () => {
        if (!resumeId || !jd.trim()) return toast.error('Select a resume and paste a job description')
        setLoading(true)
        try {
            const { data } = await atsApi.coverLetter(resumeId, jd)
            setLetter(data.coverLetter)
            toast.success('Cover letter generated!')
        } catch { toast.error('Generation failed') }
        finally { setLoading(false) }
    }

    const copy = () => { navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 2000) }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Cover Letter Generator</h1>
                    <p className="page-desc">Generate personalized cover letters tailored to any job</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="card p-5">
                        <label className="input-label mb-2">Select Resume</label>
                        <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="select">
                            {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                        </select>
                    </div>
                    <div className="card p-5">
                        <label className="input-label mb-2">Job Description</label>
                        <textarea value={jd} onChange={e => setJd(e.target.value)} rows={10}
                            placeholder="Paste the job description here…" className="textarea" />
                    </div>
                    <button onClick={generate} disabled={loading} className="btn-primary w-full gap-3 btn-lg">
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {loading ? 'Generating…' : 'Generate Cover Letter'}
                    </button>
                </div>

                <div className="card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">Generated Cover Letter</h3>
                        {letter && (
                            <div className="flex gap-2">
                                <button onClick={copy} className="btn-secondary btn-sm gap-1.5">
                                    {copied ? <><Copy className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                                </button>
                                <button onClick={() => { const a = document.createElement('a'); a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(letter); a.download = 'cover-letter.txt'; a.click() }} className="btn-secondary btn-sm gap-1.5">
                                    <Download className="w-3 h-3" /> Download
                                </button>
                            </div>
                        )}
                    </div>
                    {letter ? (
                        <textarea value={letter} onChange={e => setLetter(e.target.value)} className="textarea flex-1 text-sm leading-relaxed" rows={20} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                            <FileText className="w-14 h-14 text-dark-600 mb-4" />
                            <p className="text-dark-400 text-sm">Your AI-generated cover letter will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
