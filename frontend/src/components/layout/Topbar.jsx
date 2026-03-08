import { Bell, Search, Menu, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick }) {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [dark, setDark] = useState(true)

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark')
        setDark(p => !p)
    }

    return (
        <header className="sticky top-0 z-30 h-16 bg-dark-950/80 backdrop-blur-xl border-b border-white/10 flex items-center px-6 gap-4">
            {/* Mobile menu */}
            <button
                onClick={onMenuClick}
                className="md:hidden btn-ghost p-2 rounded-lg"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md hidden sm:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                    <input
                        className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition"
                        placeholder="Search jobs, resumes…"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
                {/* Theme toggle */}
                <button onClick={toggleTheme} className="btn-ghost p-2 rounded-xl">
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notifications */}
                <button className="btn-ghost p-2 rounded-xl relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-dark-950" />
                </button>

                {/* Avatar */}
                <button
                    onClick={() => navigate('/dashboard/account')}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs hover:ring-2 hover:ring-primary-500/50 transition"
                >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                </button>
            </div>
        </header>
    )
}
