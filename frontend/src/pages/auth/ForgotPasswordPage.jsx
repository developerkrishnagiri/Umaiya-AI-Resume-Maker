import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '../../api'
import { Sparkles, Mail, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await authApi.forgotPassword(data)
            setSent(true)
            toast.success('Check your email for a reset link!')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <img src="/Logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-glow mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">{sent ? 'Email sent!' : 'Forgot password?'}</h1>
                    <p className="text-dark-400 mt-1 text-sm">{sent ? "We've sent a reset link to your email." : "Enter your email and we'll send you a reset link."}</p>
                </div>

                <div className="card p-8">
                    {!sent ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="input-label">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                                    <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                                        type="email" placeholder="you@example.com" className="input pl-10" />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                                {loading ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-dark-300 text-sm">Didn't receive it? Check your spam folder or try again in a few minutes.</p>
                        </div>
                    )}

                    <Link to="/login" className="flex items-center justify-center gap-2 text-dark-400 hover:text-white transition text-sm mt-6">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}
