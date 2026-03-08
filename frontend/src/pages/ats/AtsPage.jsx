import { useEffect, useState } from 'react'
import { resumeApi, atsApi } from '../../api'
import toast from 'react-hot-toast'
import { Target, Loader, Zap, ChevronDown, CheckCircle, XCircle, AlertCircle, Wand2, FileText, Plus } from 'lucide-react'
import clsx from 'clsx'

function ScoreCircle({ score, size = 'lg' }) {
    const pct = Math.min(Math.max(score || 0, 0), 100)
    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
    const r = size === 'lg' ? 52 : 36
    const stroke = 8
    const circumference = 2 * Math.PI * r
    const dashOffset = circumference - (pct / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size === 'lg' ? 128 : 90} height={size === 'lg' ? 128 : 90} className="-rotate-90">
                <circle cx={size === 'lg' ? 64 : 45} cy={size === 'lg' ? 64 : 45} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
                <circle cx={size === 'lg' ? 64 : 45} cy={size === 'lg' ? 64 : 45} r={r} fill="none" stroke={color}
                    strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
            </svg>
            <span className="absolute text-center">
                <span className={clsx('font-black text-white', size === 'lg' ? 'text-2xl' : 'text-lg')}>{Math.round(pct)}</span>
                <span className="block text-dark-400 text-xs">/ 100</span>
            </span>
        </div>
    )
}

function ScoreBar({ label, value }) {
    const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500'
    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="text-dark-300">{label}</span>
                <span className="text-white font-semibold">{Math.round(value || 0)}%</span>
            </div>
            <div className="ats-bar">
                <div className={clsx('ats-fill', color)} style={{ width: `${value || 0}%` }} />
            </div>
        </div>
    )
}

export default function AtsPage() {
    const [resumes, setResumes] = useState([])
    const [selectedResume, setSelectedResume] = useState('')
    const [result, setResult] = useState(null)
    const [history, setHistory] = useState([])
    const [scanning, setScanning] = useState(false)
    const [improving, setImproving] = useState(null)

    useEffect(() => {
        resumeApi.list().then(r => { setResumes(r.data || []); if (r.data?.[0]) setSelectedResume(r.data[0].id) })
    }, [])

    useEffect(() => {
        if (selectedResume) {
            atsApi.history(selectedResume).then(r => setHistory(r.data || []))
        }
    }, [selectedResume])

    const scan = async () => {
        if (!selectedResume) return toast.error('Select a resume first')
        setScanning(true)
        try {
            const { data } = await atsApi.scan(selectedResume, null)
            setResult(data)
            setHistory(p => [data, ...p])
            toast.success(`ATS Score: ${Math.round(data.overallScore)}%`)
        } catch { toast.error('Scan failed') }
        finally { setScanning(false) }
    }

    const improveText = async (text, idx) => {
        setImproving(idx)
        try {
            const { data } = await atsApi.aiImprove(text, 'bullet')
            toast.success('Improved! Copy and paste into your resume.')
            console.log('Improved:', data.improved)
        } finally { setImproving(null) }
    }

    const addKeyword = async (keyword) => {
        if (!selectedResume) return;
        const loadingToast = toast.loading(`Adding "${keyword}"...`);
        try {
            const { data: resume } = await resumeApi.get(selectedResume);
            const skills = resume.skills || [];

            if (!skills.find(s => s.name.toLowerCase() === keyword.toLowerCase())) {
                const updatedSkills = [...skills, { id: Date.now().toString(), name: keyword, level: 'INTERMEDIATE' }];
                await resumeApi.update(selectedResume, { ...resume, skills: updatedSkills });

                if (result) {
                    setResult({
                        ...result,
                        matchedKeywords: [...(result.matchedKeywords || []), keyword],
                        missingKeywords: (result.missingKeywords || []).filter(k => k !== keyword)
                    });
                }
                toast.success(`Added ${keyword} to your resume!`, { id: loadingToast });
            } else {
                toast.error(`${keyword} already exists`, { id: loadingToast });
            }
        } catch (err) {
            toast.error('Failed to add keyword', { id: loadingToast });
        }
    }

    const score = result?.overallScore || 0

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">ATS Resume Scanner</h1>
                    <p className="page-desc">Analyze your resume against ATS systems and get AI-powered improvement suggestions</p>
                </div>
            </div>

            {/* Scanner card */}
            <div className="card p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                        <label className="input-label">Select Resume to Scan</label>
                        <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)} className="select max-w-sm">
                            {resumes.length === 0 && <option>No resumes found</option>}
                            {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                        </select>
                    </div>
                    <button onClick={scan} disabled={scanning || !selectedResume} className="btn-primary btn-lg gap-3 mt-4 md:mt-6">
                        {scanning ? <Loader className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                        {scanning ? 'Scanning…' : 'Scan Now'}
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-5 animate-slide-up">
                    {/* Overall score */}
                    <div className="card p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="text-center">
                            <ScoreCircle score={result.overallScore} size="lg" />
                            <p className="text-white font-bold mt-2">Overall ATS Score</p>
                            <p className={clsx('text-sm', result.overallScore >= 80 ? 'text-emerald-400' : result.overallScore >= 60 ? 'text-amber-400' : 'text-red-400')}>
                                {result.overallScore >= 80 ? '🎉 Excellent!' : result.overallScore >= 60 ? '⚡ Good, keep improving' : '⚠️ Needs improvement'}
                            </p>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <ScoreBar label="Keyword Match" value={result.keywordScore} />
                            <ScoreBar label="Section Score" value={result.sectionScore} />
                            <ScoreBar label="Formatting" value={result.formattingScore} />
                            <ScoreBar label="Readability" value={result.readabilityScore} />
                            <ScoreBar label="Experience Relevance" value={result.experienceScore} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Matched keywords */}
                        <div className="card p-5">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Matched Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {(result.matchedKeywords || []).map(k => (
                                    <span key={k} className="badge badge-success">{k}</span>
                                ))}
                            </div>
                        </div>

                        {/* Missing keywords */}
                        <div className="card p-5">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Missing Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {(result.missingKeywords || []).map(k => (
                                    <button
                                        key={k}
                                        onClick={() => addKeyword(k)}
                                        className="badge badge-danger hover:bg-red-500/30 transition-all cursor-pointer group flex items-center gap-1.5"
                                        title={`Click to add "${k}" to your resume`}
                                    >
                                        {k}
                                        <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                                {(result.missingKeywords || []).length === 0 && <p className="text-emerald-400 text-sm italic font-medium">✨ No missing keywords!</p>}
                            </div>
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div className="card p-5">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-400" /> AI Improvement Suggestions</h3>
                        <div className="space-y-3">
                            {(result.suggestions || []).map((sug, idx) => (
                                <div key={idx} className="glass rounded-xl p-4 flex items-start gap-3">
                                    <span className="text-amber-400 mt-0.5">💡</span>
                                    <div className="flex-1">
                                        <p className="text-dark-200 text-sm">{sug}</p>
                                        <button onClick={() => improveText(sug, idx)} disabled={improving === idx} className="btn-secondary btn-sm mt-2 gap-1.5">
                                            {improving === idx ? <Loader className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-purple-400" />}
                                            Rewrite with AI
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formatting warnings */}
                    {result.formattingWarnings?.length > 0 && (
                        <div className="card p-5">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-400" /> Formatting Warnings</h3>
                            <ul className="space-y-2">
                                {result.formattingWarnings.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-dark-300 text-sm">
                                        <span className="text-orange-400 mt-0.5">⚠</span> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Scan history */}
            {!result && history.length > 0 && (
                <div className="card p-5">
                    <h3 className="text-white font-bold mb-4">Scan History</h3>
                    <div className="space-y-3">
                        {history.map(h => (
                            <button key={h.id} onClick={() => setResult(h)}
                                className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/8 transition text-left">
                                <ScoreCircle score={h.overallScore} size="sm" />
                                <div>
                                    <div className="text-white font-semibold">{Math.round(h.overallScore)}% overall score</div>
                                    <div className="text-dark-400 text-xs">{new Date(h.createdAt).toLocaleDateString()} · {h.scanType}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!result && history.length === 0 && !scanning && (
                <div className="card p-16 text-center">
                    <Target className="w-14 h-14 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No scans yet</h3>
                    <p className="text-dark-400 text-sm">Select a resume above and click &ldquo;Scan Now&rdquo; to see your ATS score</p>
                </div>
            )}
        </div>
    )
}
