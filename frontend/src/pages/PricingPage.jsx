import { Link, useNavigate } from 'react-router-dom'
import { subscriptionApi } from '../api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react'
import clsx from 'clsx'

const PLANS = [
    {
        id: 'FREE',
        name: 'Free',
        icon: Sparkles,
        price: { monthly: 0, annually: 0 },
        color: 'from-gray-500 to-slate-600',
        badge: null,
        features: [
            '1 active resume',
            '3 ATS scans/month',
            '5 job applications/month',
            '3 mock interviews/month',
            'Basic templates (3)',
            'Email support',
        ],
        notIncluded: [
            'AI cover letter generator',
            'JD match analysis',
            'Premium templates',
            'Career analytics',
            'Priority support',
        ],
    },
    {
        id: 'PRO',
        name: 'Pro',
        icon: Zap,
        price: { monthly: 29, annually: 19 },
        color: 'from-primary-500 to-accent-500',
        badge: 'Most Popular',
        features: [
            'Unlimited resumes',
            'Unlimited ATS scans',
            'Unlimited job applications',
            'Unlimited mock interviews',
            'All 10 premium templates',
            'AI cover letter generator',
            'JD match analysis',
            'Career analytics dashboard',
            'Resume download (PDF)',
            'Priority email support',
        ],
        notIncluded: [],
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        icon: Crown,
        price: { monthly: 99, annually: 79 },
        color: 'from-amber-500 to-orange-600',
        badge: 'Best Value',
        features: [
            'Everything in Pro',
            'Recruiter dashboard access',
            'Unlimited job postings',
            'AI candidate ranking',
            'Team management',
            'API access',
            'White-label options',
            'Dedicated account manager',
            'SSO / SAML integration',
            '99.9% SLA guarantee',
        ],
        notIncluded: [],
    },
]

export default function PricingPage() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [annual, setAnnual] = useState(true)
    const [loading, setLoading] = useState('')

    const subscribe = async (planId) => {
        if (!user) { navigate('/register'); return }
        if (planId === 'FREE') return
        setLoading(planId)
        try {
            const { data } = await subscriptionApi.checkout(planId, annual ? 'ANNUAL' : 'MONTHLY')
            if (data.url) window.location.href = data.url
            else toast.success('Plan subscribed!')
        } catch { toast.error('Checkout failed') }
        finally { setLoading('') }
    }

    return (
        <div className="min-h-screen bg-dark-950 text-white py-20 px-6">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-14">
                    <div className="badge badge-primary mx-auto mb-4">Pricing</div>
                    <h1 className="text-5xl font-black mb-4">
                        Simple, <span className="gradient-text">transparent</span> pricing
                    </h1>
                    <p className="text-dark-300 max-w-xl mx-auto">Start free. Upgrade when you need more power. No hidden fees.</p>

                    {/* Toggle */}
                    <div className="inline-flex items-center gap-3 mt-8 p-1 bg-dark-800/50 rounded-full border border-white/10">
                        <button onClick={() => setAnnual(false)} className={clsx('px-5 py-2 rounded-full text-sm font-medium transition', !annual ? 'bg-white text-dark-900' : 'text-dark-400 hover:text-white')}>Monthly</button>
                        <button onClick={() => setAnnual(true)} className={clsx('px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2', annual ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' : 'text-dark-400 hover:text-white')}>
                            Annual <span className="badge badge-success !text-xs">Save 35%</span>
                        </button>
                    </div>
                </div>

                {/* Plan cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {PLANS.map(({ id, name, icon: Icon, price, color, badge, features, notIncluded }) => {
                        const isCurrentPlan = user?.planType === id
                        const displayPrice = annual ? price.annually : price.monthly
                        return (
                            <div key={id} className={clsx('card relative overflow-hidden flex flex-col', id === 'PRO' && 'ring-2 ring-primary-500/50 shadow-glow scale-105')}>
                                {badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className={clsx('badge', id === 'PRO' ? 'badge-primary' : 'badge-warning')}>{badge}</span>
                                    </div>
                                )}
                                {/* Gradient accent at top */}
                                <div className={`h-1.5 bg-gradient-to-r ${color} rounded-t-xl -mt-0.5`} />

                                <div className="p-7 flex-1 flex flex-col">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-4xl font-black gradient-text">${displayPrice}</span>
                                        {displayPrice > 0 && <span className="text-dark-400 pb-1">/mo{annual && ', billed annually'}</span>}
                                        {displayPrice === 0 && <span className="text-dark-400 pb-1"> forever</span>}
                                    </div>

                                    <ul className="space-y-2.5 mb-6 flex-1">
                                        {features.map(f => (
                                            <li key={f} className="flex items-start gap-2.5 text-dark-200 text-sm">
                                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                        {notIncluded.map(f => (
                                            <li key={f} className="flex items-start gap-2.5 text-dark-500 text-sm line-through">
                                                <Check className="w-4 h-4 text-dark-600 mt-0.5 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => subscribe(id)}
                                        disabled={isCurrentPlan || !!loading}
                                        className={clsx('w-full py-3 rounded-xl font-semibold text-sm transition',
                                            isCurrentPlan ? 'bg-dark-700 text-dark-400 cursor-not-allowed' :
                                                id === 'PRO' ? 'btn-primary' : id === 'FREE' ? 'btn-secondary' : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 active:scale-95'
                                        )}
                                    >
                                        {loading === id ? 'Redirecting…' : isCurrentPlan ? 'Current Plan' : id === 'FREE' ? 'Get Started Free' : `Upgrade to ${name}`}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* FAQ teaser */}
                <div className="text-center mt-14">
                    <p className="text-dark-400 text-sm">
                        Questions? Email us at{' '}
                        <a href="mailto:support@aicareer.com" className="text-primary-400 hover:text-primary-300">support@aicareer.com</a>
                    </p>
                    <p className="text-dark-500 text-xs mt-2">All plans include a 14-day money-back guarantee. Cancel anytime.</p>
                </div>
            </div>
        </div>
    )
}
