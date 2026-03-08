import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { interviewApi } from '../../api'
import toast from 'react-hot-toast'
import { Brain, Play, Clock, Star, ChevronRight, BookOpen, MessageSquare, TrendingUp, Trophy, Loader, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES = [
    { id: 'behavioral', label: 'Behavioral', icon: '🧠', desc: 'STAR method, situational questions', color: 'from-blue-500 to-indigo-600' },
    { id: 'technical', label: 'Technical', icon: '💻', desc: 'Technology concepts and coding', color: 'from-purple-500 to-violet-600' },
    { id: 'hr', label: 'HR / Cultural', icon: '🤝', desc: 'Culture fit, motivation, salary', color: 'from-emerald-500 to-teal-600' },
    { id: 'situational', label: 'Situational', icon: '🎯', desc: 'Hypothetical scenario questions', color: 'from-orange-500 to-amber-600' },
]

const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function InterviewPrepPage() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)
    const [selected, setSelected] = useState({ category: 'behavioral', difficulty: 'medium' })
    const [hoveredSession, setHoveredSession] = useState(null)
    const navigate = useNavigate()

    const loadSessions = () => { interviewApi.sessions().then(r => setSessions(r.data || [])).finally(() => setLoading(false)) }
    useEffect(() => { loadSessions() }, [])

    const deleteSession = async (sessionId, e) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await interviewApi.deleteSession(sessionId)
            setSessions(prev => prev.filter(s => s.id !== sessionId))
            toast.success('Session deleted')
        } catch (err) {
            console.error('Delete failed:', err)
            toast.error(err?.response?.data?.message || 'Failed to delete session')
        }
    }

    const startSession = async () => {
        setStarting(true)
        try {
            const { data } = await interviewApi.startSession(selected)
            toast.success('Interview session started!')
            navigate('/dashboard/interview/mock', { state: { sessionId: data.id } })
        } catch { toast.error('Failed to start session') }
        finally { setStarting(false) }
    }

    const avgScore = sessions.length > 0
        ? (sessions.reduce((a, s) => a + (s.overallScore || 0), 0) / sessions.length).toFixed(1)
        : null

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Interview Prep</h1>
                    <p className="page-desc">Practice with AI-powered mock interviews and get real-time feedback</p>
                </div>
            </div>

            {/* Stats */}
            {sessions.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: MessageSquare, label: 'Sessions', value: sessions.length, color: 'text-blue-400', bg: 'bg-blue-500/15' },
                        { icon: Star, label: 'Avg Score', value: avgScore ? `${avgScore}/10` : '—', color: 'text-amber-400', bg: 'bg-amber-500/15' },
                        { icon: TrendingUp, label: 'Completed', value: sessions.filter(s => s.status === 'COMPLETED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="stat-card">
                            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
                            <div><div className="text-2xl font-bold text-white">{value}</div><div className="text-dark-400 text-sm">{label}</div></div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* New session */}
                <div className="card p-6 space-y-5">
                    <h2 className="text-white font-bold text-lg">Start New Session</h2>

                    <div>
                        <label className="input-label mb-3">Choose Category</label>
                        <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setSelected(p => ({ ...p, category: cat.id }))}
                                    className={clsx('p-3 rounded-xl border text-left transition',
                                        selected.category === cat.id
                                            ? 'border-primary-500 bg-primary-500/15'
                                            : 'border-white/10 hover:border-white/25 hover:bg-white/5')}>
                                    <span className="text-xl mb-1.5 block">{cat.icon}</span>
                                    <div className="text-white text-sm font-medium">{cat.label}</div>
                                    <div className="text-dark-400 text-xs mt-0.5">{cat.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="input-label mb-2">Difficulty</label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(d => (
                                <button key={d} onClick={() => setSelected(p => ({ ...p, difficulty: d }))}
                                    className={clsx('flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition',
                                        selected.difficulty === d
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                                            : 'border-white/10 text-dark-400 hover:text-white hover:border-white/25')}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={startSession} disabled={starting} className="btn-primary w-full gap-3 py-3">
                        {starting ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        {starting ? 'Starting…' : 'Start Interview Session'}
                    </button>
                </div>

                {/* Recent sessions */}
                <div className="card p-6">
                    <h2 className="text-white font-bold text-lg mb-4">Recent Sessions</h2>
                    {loading ? <div className="flex justify-center py-8"><Loader className="w-6 h-6 animate-spin text-primary-400" /></div>
                        : sessions.length === 0 ? (
                            <div className="text-center py-8">
                                <Brain className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                                <p className="text-dark-400 text-sm">No sessions yet. Start your first mock interview!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.slice(0, 6).map(session => (
                                    <div key={session.id}
                                        onMouseEnter={() => setHoveredSession(session.id)}
                                        onMouseLeave={() => setHoveredSession(null)}
                                        className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/8 transition text-left">
                                        <button onClick={() => navigate('/dashboard/interview/mock', { state: { sessionId: session.id } })}
                                            className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center flex-shrink-0 text-lg">
                                                {CATEGORIES.find(c => c.id === session.category)?.icon || '🎯'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-medium capitalize">{session.category} · {session.difficulty}</div>
                                                <div className="text-dark-400 text-xs">{new Date(session.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {session.overallScore != null && (
                                                    <div className={clsx('font-bold text-sm', session.overallScore >= 7 ? 'text-emerald-400' : session.overallScore >= 5 ? 'text-amber-400' : 'text-red-400')}>
                                                        {session.overallScore.toFixed(1)}/10
                                                    </div>
                                                )}
                                                <div className={clsx('badge text-xs', session.status === 'COMPLETED' ? 'badge-success' : 'badge-warning')}>
                                                    {session.status}
                                                </div>
                                            </div>
                                        </button>
                                        {hoveredSession === session.id && (
                                            <button onClick={(e) => deleteSession(session.id, e)}
                                                title="Delete session"
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-all flex-shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>

            {/* Tips */}
            <div className="card p-6">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary-400" />Interview Tips</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { tip: 'Use the STAR method', desc: 'Structure behavioral answers with Situation, Task, Action, and Result.' },
                        { tip: 'Research the company', desc: 'Know the company culture, mission, recent news, and job requirements.' },
                        { tip: 'Practice out loud', desc: 'Speaking your answers is different from thinking them. Practice daily.' },
                    ].map(({ tip, desc }) => (
                        <div key={tip} className="glass rounded-xl p-4">
                            <div className="text-primary-400 font-bold text-sm mb-1">✨ {tip}</div>
                            <p className="text-dark-400 text-xs leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
