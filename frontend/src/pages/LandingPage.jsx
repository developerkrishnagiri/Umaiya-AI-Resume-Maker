import { Link } from 'react-router-dom'
import { Sparkles, Target, Brain, Briefcase, CheckCircle, ArrowRight, Star, TrendingUp, Users, Award, Zap, FileText } from 'lucide-react'

const features = [
    { icon: FileText, title: 'AI Resume Builder', desc: 'Drag & drop builder with 10 premium templates and live preview.', color: 'from-blue-500 to-indigo-600' },
    { icon: Target, title: 'ATS Scanner', desc: 'Score your resume against any job description and fix weaknesses.', color: 'from-purple-500 to-violet-600' },
    { icon: Brain, title: 'AI Interview Prep', desc: 'Practice with AI mock interviews and get instant feedback.', color: 'from-pink-500 to-rose-600' },
    { icon: Briefcase, title: 'Smart Job Matching', desc: 'AI matches your profile to the best-fit jobs automatically.', color: 'from-orange-500 to-amber-600' },
    { icon: TrendingUp, title: 'Career Analytics', desc: 'Track applications, ATS scores, and career growth over time.', color: 'from-emerald-500 to-teal-600' },
    { icon: Zap, title: 'Cover Letter AI', desc: 'Generate personalized cover letters tailored to each job in seconds.', color: 'from-cyan-500 to-sky-600' },
]

const stats = [
    { label: 'Job Seekers', value: '50K+' },
    { label: 'Resume Created', value: '120K+' },
    { label: 'Interview Success Rate', value: '89%' },
    { label: 'Jobs Matched', value: '15K+' },
]

const testimonials = [
    { name: 'Sarah Chen', role: 'Software Engineer at Google', text: 'The AI resume builder helped me land my dream job at Google! The ATS score feature was a game-changer.', rating: 5 },
    { name: 'Marcus Johnson', role: 'Product Manager at Meta', text: 'Mock interviews with AI feedback prepared me so well. I felt confident in every round.', rating: 5 },
    { name: 'Priya Patel', role: 'Data Scientist at Amazon', text: 'The job matching algorithm found opportunities I never would have found on my own.', rating: 5 },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-dark-950 text-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/Logo.jpg" alt="Logo" className="w-9 h-9 rounded-xl object-contain shadow-glow" />
                        <span className="font-bold text-lg gradient-text">Umaiya AI Career Platform</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm text-dark-300">
                        <a href="#features" className="hover:text-white transition">Features</a>
                        <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
                        <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn-secondary btn-sm hidden sm:inline-flex">Sign In</Link>
                        <Link to="/register" className="btn-primary btn-sm">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/12 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute top-40 right-10 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-300 text-sm font-medium mb-6 animate-bounce-in">
                        <Sparkles className="w-4 h-4" />
                        Powered by GPT-4o · ATS Optimized
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
                        Land Your <span className="gradient-text">Dream Job</span> with AI
                    </h1>
                    <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-10 animate-fade-in">
                        Build ATS-optimized resumes, ace interviews with AI coaching, and get matched to the perfect job — all in one powerful career platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
                        <Link to="/register" className="btn-primary btn-lg gap-3 group">
                            Start For Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="btn-secondary btn-lg">Watch Demo</Link>
                    </div>
                    <p className="text-dark-500 text-sm mt-4">No credit card required · Free plan forever</p>
                </div>

                {/* Stats */}
                <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map(({ label, value }) => (
                        <div key={label} className="glass-card text-center p-5">
                            <div className="text-3xl font-black gradient-text mb-1">{value}</div>
                            <div className="text-dark-400 text-sm">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="badge badge-primary mx-auto mb-4">Features</div>
                        <h2 className="text-4xl font-bold mb-4">Everything You Need to <span className="gradient-text">Succeed</span></h2>
                        <p className="text-dark-400 max-w-xl mx-auto">A complete AI career toolkit built to help you stand out, get noticed, and land your next role faster.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="card-hover p-6 group cursor-pointer">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-6 bg-dark-900/30">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="badge badge-success mx-auto mb-4">How It Works</div>
                    <h2 className="text-4xl font-bold mb-16">Get hired in <span className="gradient-text">3 simple steps</span></h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Build Your Resume', desc: 'Use our drag & drop builder with AI suggestions to craft a perfect ATS-optimized resume in minutes.' },
                            { step: '02', title: 'Match & Apply', desc: 'Our AI engine matches you to relevant jobs and helps you tailor your resume for each application.' },
                            { step: '03', title: 'Ace the Interview', desc: 'Practice with AI mock interviews, get personalized coaching, and walk into every interview confident.' },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="relative p-6">
                                <div className="text-8xl font-black gradient-text opacity-20 absolute top-0 right-4 select-none">{step}</div>
                                <div className="relative">
                                    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                                    <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Loved by <span className="gradient-text">50,000+</span> professionals</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map(({ name, role, text, rating }) => (
                            <div key={name} className="card p-6">
                                <div className="flex mb-3">
                                    {Array.from({ length: rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-dark-300 text-sm leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                                        {name[0]}
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold text-sm">{name}</div>
                                        <div className="text-dark-400 text-xs">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="card p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 pointer-events-none" />
                        <div className="relative">
                            <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold mb-4">Ready to <span className="gradient-text">transform</span> your career?</h2>
                            <p className="text-dark-300 mb-8">Join 50,000+ professionals who landed their dream jobs with AI Career Platform.</p>
                            <Link to="/register" className="btn-primary btn-lg gap-3">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-6 text-center text-dark-500 text-sm">
                <p>© 2026 Umaiya AI Career Platform. Built with ❤️ to help you succeed.</p>
            </footer>
        </div>
    )
}
