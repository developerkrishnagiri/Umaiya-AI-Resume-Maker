import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Sparkles, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const token = params.get('token') || ''
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async ({ newPassword }) => {
        setLoading(true)
        try {
            await authApi.resetPassword({ token, newPassword })
            toast.success('Password reset! You can now sign in.')
            navigate('/login')
        } catch { toast.error('Reset link invalid or expired.') }
        finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <img src="/Logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-glow mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Set new password</h1>
                    <p className="text-dark-400 mt-1 text-sm">Choose a strong password for your account</p>
                </div>
                <div className="card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="input-label">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                                <input {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })}
                                    type={showPw ? 'text' : 'password'} placeholder="New password" className="input pl-10 pr-10" />
                                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                            {loading ? 'Resetting…' : 'Reset Password'}
                        </button>
                    </form>
                    <Link to="/login" className="block text-center text-dark-400 hover:text-white transition text-sm mt-6">Back to login</Link>
                </div>
            </div>
        </div>
    )
}
