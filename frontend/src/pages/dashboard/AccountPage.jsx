import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import { userApi, subscriptionApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { User, Lock, Bell, CreditCard, Loader, Eye, EyeOff, Save, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
]

export default function AccountPage() {
    const { user, logout } = useAuthStore()
    const [tab, setTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)

    const profileForm = useForm({ defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' } })
    const pwForm = useForm()

    const saveProfile = async (data) => {
        setLoading(true)
        try { await userApi.updateProfile(data); toast.success('Profile updated!') }
        catch { toast.error('Update failed') }
        finally { setLoading(false) }
    }

    const changePassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) return toast.error("Passwords don't match")
        setLoading(true)
        try { await userApi.changePassword(data); toast.success('Password changed!'); pwForm.reset() }
        catch { toast.error('Current password incorrect') }
        finally { setLoading(false) }
    }

    const cancelSubscription = async () => {
        if (!confirm('Cancel your subscription? You will keep access until the end of the billing period.')) return
        setLoading(true)
        try { await subscriptionApi.cancel(); toast.success('Subscription cancelled'); }
        catch { toast.error('Cancellation failed') }
        finally { setLoading(false) }
    }

    return (
        <div className="max-w-2xl animate-fade-in">
            <div className="mb-6">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-desc">Manage your profile, security, and subscription</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl mb-6 w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition',
                            tab === id ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow' : 'text-dark-400 hover:text-white')}>
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {tab === 'profile' && (
                <div className="card p-6 space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-glow">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg">{user?.firstName} {user?.lastName}</div>
                            <div className="text-dark-400 text-sm">{user?.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={clsx('badge text-xs', user?.planType === 'PRO' ? 'badge-primary' : user?.planType === 'ENTERPRISE' ? 'badge-warning' : 'badge-info')}>{user?.planType}</span>
                                <span className="badge badge-info text-xs">{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider" />

                    <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">First Name</label>
                                <input {...profileForm.register('firstName', { required: true })} className="input" />
                            </div>
                            <div>
                                <label className="input-label">Last Name</label>
                                <input {...profileForm.register('lastName', { required: true })} className="input" />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Phone</label>
                            <input {...profileForm.register('phone')} placeholder="+1 (555) 000-0000" className="input" />
                        </div>
                        <div>
                            <label className="input-label">Email (read-only)</label>
                            <input value={user?.email || ''} readOnly className="input opacity-50 cursor-not-allowed" />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary gap-2">
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </form>
                </div>
            )}

            {/* Password tab */}
            {tab === 'password' && (
                <div className="card p-6">
                    <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
                        {[
                            { name: 'currentPassword', label: 'Current Password' },
                            { name: 'newPassword', label: 'New Password' },
                            { name: 'confirmPassword', label: 'Confirm New Password' },
                        ].map(({ name, label }) => (
                            <div key={name}>
                                <label className="input-label">{label}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input {...pwForm.register(name, { required: true, minLength: name !== 'currentPassword' ? 8 : 1 })}
                                        type={showPw ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••" />
                                    {name === 'confirmPassword' && (
                                        <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary gap-2">
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Change Password
                        </button>
                    </form>
                </div>
            )}

            {/* Subscription tab */}
            {tab === 'subscription' && (
                <div className="space-y-4">
                    <div className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-white font-bold text-lg">{user?.planType} Plan</h2>
                                <p className="text-dark-400 text-sm mt-0.5">
                                    {user?.planType === 'FREE' ? 'Free forever — upgrade for more features' : 'Your subscription is active'}
                                </p>
                            </div>
                            <span className={clsx('badge', user?.planType === 'PRO' ? 'badge-primary' : user?.planType === 'ENTERPRISE' ? 'badge-warning' : 'badge-info')}>
                                {user?.planType}
                            </span>
                        </div>

                        {user?.planType !== 'FREE' && (
                            <div className="glass rounded-xl p-4 mb-4 space-y-1.5">
                                {user?.subscriptionExpiresAt && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-dark-400">Next billing date</span>
                                        <span className="text-white">{new Date(user.subscriptionExpiresAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Link to="/pricing" className="btn-primary gap-2 flex-1">
                                <CreditCard className="w-4 h-4" />
                                {user?.planType === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
                            </Link>
                            {user?.planType !== 'FREE' && (
                                <button onClick={cancelSubscription} disabled={loading} className="btn-secondary text-red-400 hover:text-red-300 gap-2">
                                    <Trash2 className="w-4 h-4" /> Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card p-5">
                        <h3 className="text-white font-bold mb-3">Danger Zone</h3>
                        <button onClick={() => { if (confirm('Are you sure you want to delete your account? This cannot be undone.')) toast.error('Contact support to delete your account') }}
                            className="btn-secondary text-red-400 hover:text-red-300 text-sm gap-2">
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
