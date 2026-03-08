import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { interviewApi } from '../../api'
import toast from 'react-hot-toast'
import { Loader, Send, ChevronLeft, ChevronRight, CheckCircle, Star, Brain, BarChart3 } from 'lucide-react'
import clsx from 'clsx'

export default function MockInterviewPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [qIdx, setQIdx] = useState(0)
    const [answer, setAnswer] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const sessionId = location.state?.sessionId

    useEffect(() => {
        if (!sessionId) { navigate('/dashboard/interview'); return }
        interviewApi.getSession(sessionId).then(r => setSession(r.data)).finally(() => setLoading(false))
    }, [sessionId])

    const currentQ = session?.questionsAndAnswers?.[qIdx]
    const isCompleted = session?.status === 'COMPLETED'

    const submitAnswer = async () => {
        if (!answer.trim()) return toast.error('Please write an answer first')
        setSubmitting(true)
        try {
            const { data } = await interviewApi.submitAnswer(sessionId, { questionIndex: qIdx, answer })
            setSession(data)
            setAnswer('')
            if (qIdx < (session?.questionsAndAnswers?.length || 5) - 1) setQIdx(p => p + 1)
            toast.success('Answer submitted! AI evaluated your response.')
        } catch { toast.error('Submission failed') }
        finally { setSubmitting(false) }
    }

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader className="w-8 h-8 animate-spin text-primary-400" /></div>
    if (!session) return null

    const totalQ = session.questionsAndAnswers?.length || 0
    const answered = session.questionsAndAnswers?.filter(q => q.answer).length || 0

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white capitalize">{session.category} Interview</h1>
                    <p className="text-dark-400 text-sm">Question {Math.min(answered + 1, totalQ)} of {totalQ} · {session.difficulty}</p>
                </div>
                {!isCompleted && (
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {session.questionsAndAnswers?.map((_, i) => (
                                <button key={i} onClick={() => setQIdx(i)}
                                    className={clsx('w-2 h-2 rounded-full transition', i === qIdx ? 'bg-primary-500' : _.answer ? 'bg-emerald-500' : 'bg-dark-600')} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isCompleted ? (
                /* Results */
                <div className="space-y-5 animate-bounce-in">
                    <div className="card p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-white mb-1">Interview Complete!</h2>
                        <div className={clsx('text-5xl font-black mt-3',
                            session.overallScore >= 8 ? 'text-emerald-400' : session.overallScore >= 6 ? 'text-amber-400' : 'text-red-400')}>
                            {session.overallScore?.toFixed(1)}<span className="text-2xl text-dark-400">/10</span>
                        </div>
                        <p className="text-dark-400 mt-2">Overall Score</p>
                    </div>

                    {session.questionsAndAnswers?.map((qa, i) => (
                        <div key={i} className="card p-5">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-white font-semibold text-sm flex-1">{qa.question}</h3>
                                {qa.score != null && (
                                    <span className={clsx('badge ml-3 flex-shrink-0',
                                        qa.score >= 8 ? 'badge-success' : qa.score >= 6 ? 'badge-warning' : 'badge-danger')}>
                                        {Number(qa.score).toFixed(1)}/10
                                    </span>
                                )}
                            </div>
                            {qa.answer && <div className="glass rounded-xl p-3 mb-3"><p className="text-dark-300 text-sm">{qa.answer}</p></div>}
                            {qa.feedback && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                    <p className="text-emerald-300 text-xs font-medium mb-1">💡 AI Feedback</p>
                                    <p className="text-dark-300 text-sm">{qa.feedback}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="flex gap-3">
                        <button onClick={() => navigate('/dashboard/interview')} className="btn-secondary flex-1">Back to Prep</button>
                        <button onClick={() => navigate('/dashboard/interview', { state: { retry: true } })} className="btn-primary flex-1">New Session</button>
                    </div>
                </div>
            ) : (
                /* Active question */
                <div className="space-y-4">
                    <div className="card p-6">
                        <div className="flex items-start gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Brain className="w-4 h-4 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-xs text-dark-400 mb-1">Question {qIdx + 1}</p>
                                <p className="text-white text-lg font-semibold leading-relaxed">{currentQ?.question}</p>
                            </div>
                        </div>

                        {currentQ?.answer ? (
                            /* Already answered */
                            <div className="space-y-3">
                                <div className="glass rounded-xl p-4">
                                    <p className="text-xs text-dark-400 mb-2">Your Answer</p>
                                    <p className="text-dark-200 text-sm">{currentQ.answer}</p>
                                </div>
                                {currentQ.feedback && (
                                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-4 h-4 text-amber-400" />
                                            <span className="text-white text-sm font-semibold">AI Score: {Number(currentQ.score).toFixed(1)}/10</span>
                                        </div>
                                        <p className="text-dark-300 text-sm">{currentQ.feedback}</p>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button onClick={() => setQIdx(p => Math.max(0, p - 1))} disabled={qIdx === 0} className="btn-secondary btn-sm gap-1">
                                        <ChevronLeft className="w-4 h-4" /> Prev
                                    </button>
                                    <button onClick={() => setQIdx(p => Math.min(totalQ - 1, p + 1))} disabled={qIdx === totalQ - 1} className="btn-primary btn-sm gap-1 ml-auto">
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Answer input */
                            <div className="space-y-4">
                                <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                                    rows={6} placeholder="Type your answer here… Use specific examples from your experience (STAR method works great: Situation → Task → Action → Result)."
                                    className="textarea" />
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-dark-500 text-xs">{answer.length} characters</span>
                                    <button onClick={submitAnswer} disabled={submitting || !answer.trim()} className="btn-primary gap-2">
                                        {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {submitting ? 'Evaluating…' : 'Submit Answer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card p-4">
                        <p className="text-dark-400 text-xs mb-2">Session Progress</p>
                        <div className="ats-bar"><div className="ats-fill bg-primary-500" style={{ width: `${(answered / totalQ) * 100}%` }} /></div>
                        <p className="text-dark-400 text-xs mt-1">{answered} of {totalQ} questions answered</p>
                    </div>
                </div>
            )}
        </div>
    )
}
