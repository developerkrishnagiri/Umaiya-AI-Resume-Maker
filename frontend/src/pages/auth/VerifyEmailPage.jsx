import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../../api'
import toast from 'react-hot-toast'
import { Sparkles, CheckCircle, XCircle, Loader } from 'lucide-react'

export default function VerifyEmailPage() {
    const [params] = useSearchParams()
    const [status, setStatus] = useState('loading') // loading | success | error
    const token = params.get('token')

    useEffect(() => {
        if (!token) { setStatus('error'); return }
        authApi.verifyEmail({ token })
            .then(() => { setStatus('success'); toast.success('Email verified!') })
            .catch(() => setStatus('error'))
    }, [token])

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            <div className="card p-10 w-full max-w-md text-center animate-bounce-in">
                {status === 'loading' && <Loader className="w-12 h-12 text-primary-400 mx-auto animate-spin mb-4" />}
                {status === 'success' && <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />}
                {status === 'error' && <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />}
                <h2 className="text-xl font-bold text-white mb-2">
                    {status === 'loading' ? 'Verifying…' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
                </h2>
                <p className="text-dark-400 text-sm mb-6">
                    {status === 'loading' ? 'Please wait…' : status === 'success' ? 'Your account is now active. You can sign in.' : 'The link is invalid or expired. Request a new one.'}
                </p>
                {status !== 'loading' && (
                    <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
                )}
            </div>
        </div>
    )
}
