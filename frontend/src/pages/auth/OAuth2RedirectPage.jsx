import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function OAuth2RedirectPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { loginWithOAuth } = useAuthStore()

    useEffect(() => {
        const token = searchParams.get('token')
        const refreshToken = searchParams.get('refreshToken')
        const error = searchParams.get('error')

        if (error) {
            toast.error('OAuth sign-in failed. Please try again.')
            navigate('/login')
            return
        }

        if (token) {
            loginWithOAuth(token, refreshToken)
                .then((user) => {
                    toast.success(`Welcome, ${user.firstName}! 🎉`)
                    if (user.role === 'ADMIN') navigate('/admin')
                    else if (user.role === 'RECRUITER') navigate('/recruiter')
                    else navigate('/dashboard')
                })
                .catch(() => {
                    toast.error('Authentication failed. Please try again.')
                    navigate('/login')
                })
        } else {
            navigate('/login')
        }
    }, [])

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="text-center">
                <img src="/Logo.jpg" alt="Logo" className="w-16 h-16 rounded-2xl object-contain mx-auto mb-4 shadow-glow animate-pulse" />
                <p className="text-white font-semibold text-lg">Signing you in…</p>
                <p className="text-dark-400 text-sm mt-1">Please wait while we set up your account</p>
            </div>
        </div>
    )
}
