import { useState, useEffect } from 'react'
import { resumeApi, atsApi } from '../../api'
import toast from 'react-hot-toast'
import { Zap, Loader, Copy, CheckCircle, FileText } from 'lucide-react'

export default function JdMatchPage() {
    const [resumes, setResumes] = useState([])
    const [resumeId, setResumeId] = useState('')
    const [jd, setJd] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => { resumeApi.list().then(r => { setResumes(r.data || []); setResumeId(r.data?.[0]?.id || '') }) }, [])

    const analyze = async () => {
        if (!resumeId || !jd.trim()) return toast.error('Select a resume and paste a job description')
        setLoading(true)
        try {
            const { data } = await atsApi.scan(resumeId, jd)
            setResult(data)
            toast.success(`JD Match Score: ${Math.round(data.overallScore)}%`)
        } catch { toast.error('Analysis failed') }
        finally { setLoading(false) }
    }

    const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">JD Matching</h1>
                    <p className="page-desc">Paste a job description and see how well your resume matches</p>
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
                        <textarea value={jd} onChange={e => setJd(e.target.value)} rows={12}
                            placeholder="Paste the full job description here… Include requirements, responsibilities, and qualifications for the most accurate match."
                            className="textarea" />
                    </div>
                    <button onClick={analyze} disabled={loading} className="btn-primary w-full gap-3 btn-lg">
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        {loading ? 'Analyzing…' : 'Analyze Match'}
                    </button>
                </div>

                {result ? (
                    <div className="space-y-4 animate-slide-up">
                        <div className="card p-6 text-center">
                            <div className={`text-6xl font-black mb-2 ${result.overallScore >= 80 ? 'text-emerald-400' : result.overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                {Math.round(result.overallScore)}%
                            </div>
                            <p className="text-dark-300 text-sm">JD Match Score</p>
                            <p className={`text-sm font-medium mt-1 ${result.overallScore >= 80 ? 'text-emerald-400' : result.overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                {result.overallScore >= 80 ? '🎉 Strong match — apply now!' : result.overallScore >= 60 ? '⚡ Good match — a few tweaks needed' : '⚠️ Weak match — significant improvements needed'}
                            </p>
                        </div>

                        <div className="card p-5">
                            <h3 className="text-white font-bold mb-3">✅ Matched ({result.matchedKeywords?.length || 0})</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.matchedKeywords?.map(k => <span key={k} className="badge badge-success">{k}</span>)}
                            </div>
                        </div>

                        <div className="card p-5">
                            <h3 className="text-white font-bold mb-3">❌ Missing ({result.missingKeywords?.length || 0})</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.missingKeywords?.map(k => <span key={k} className="badge badge-danger">{k}</span>)}
                            </div>
                        </div>

                        <div className="card p-5">
                            <h3 className="text-white font-bold mb-3">💡 How to Improve</h3>
                            <ul className="space-y-2">
                                {result.suggestions?.map((s, i) => <li key={i} className="text-dark-300 text-sm flex gap-2"><span className="text-amber-400 flex-shrink-0">•</span>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="card p-16 text-center flex flex-col items-center justify-center">
                        <Zap className="w-14 h-14 text-dark-600 mb-4" />
                        <p className="text-dark-400">Paste a job description and click Analyze to see your match score</p>
                    </div>
                )}
            </div>
        </div>
    )
}
