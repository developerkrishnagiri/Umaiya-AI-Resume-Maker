import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import {
    LayoutDashboard, FileText, Target, Briefcase, Send, Bookmark,
    Brain, BarChart3, LogOut, Settings, ChevronLeft, ChevronRight,
    Sparkles, X, Menu, User
} from 'lucide-react'
import clsx from 'clsx'

const seeker_links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/resumes', icon: FileText, label: 'My Resumes' },
    { to: '/dashboard/ats', icon: Target, label: 'ATS Scanner' },
    { to: '/dashboard/ats/jd-match', icon: Sparkles, label: 'JD Matching' },
    { to: '/dashboard/cover-letter', icon: FileText, label: 'Cover Letter' },
    { to: '/dashboard/jobs', icon: Briefcase, label: 'Job Portal' },
    { to: '/dashboard/applied', icon: Send, label: 'Applied Jobs' },
    { to: '/dashboard/saved', icon: Bookmark, label: 'Saved Jobs' },
    { to: '/dashboard/interview', icon: Brain, label: 'Interview Prep' },
    { to: '/dashboard/career', icon: BarChart3, label: 'Career Analytics' },
]

const recruiter_links = [
    { to: '/recruiter', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
    { to: '/recruiter/post-job', icon: Send, label: 'Post Job' },
]

const admin_links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: User, label: 'Users' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const getLinks = () => {
        if (user?.role === 'ADMIN') return admin_links
        if (user?.role === 'RECRUITER') return recruiter_links
        return seeker_links
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={clsx(
                "flex items-center gap-3 p-5 border-b border-white/10",
                collapsed && "justify-center"
            )}>
                <img src="/Logo.jpg" alt="Logo" className="w-9 h-9 rounded-xl object-contain flex-shrink-0 shadow-glow" />
                {!collapsed && (
                    <div>
                        <div className="text-white font-bold text-sm leading-none">Umaiya AI</div>
                        <div className="text-dark-400 text-xs mt-0.5">Career Platform</div>
                    </div>
                )}
                {/* Mobile close */}
                <button
                    onClick={onMobileClose}
                    className="ml-auto md:hidden text-dark-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
                {/* Desktop collapse */}
                <button
                    onClick={onToggle}
                    className={clsx(
                        "hidden md:flex ml-auto text-dark-400 hover:text-white bg-white/5 rounded-lg p-1 transition",
                        collapsed && "mx-auto"
                    )}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* User info */}
            {!collapsed && user && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white text-sm font-medium truncate">{user.firstName} {user.lastName}</div>
                            <div className="text-dark-400 text-xs truncate">{user.role}</div>
                        </div>
                        <span className={clsx(
                            'badge text-xs flex-shrink-0',
                            user.planType === 'PRO' ? 'badge-primary' :
                                user.planType === 'ENTERPRISE' ? 'badge-warning' : 'badge-info'
                        )}>
                            {user.planType}
                        </span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {getLinks().map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onMobileClose}
                        className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
                        title={collapsed ? label : undefined}
                    >
                        <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                        {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom actions */}
            <div className="p-3 space-y-1 border-t border-white/10">
                <NavLink
                    to={user?.role === 'RECRUITER' ? '/dashboard' : '/recruiter'}
                    className="sidebar-link text-xs"
                    title="Switch view"
                    onClick={onMobileClose}
                >
                    <LayoutDashboard className="flex-shrink-0" size={16} />
                    {!collapsed && (
                        <span>{user?.role === 'RECRUITER' ? 'Seeker View' : user?.role === 'ADMIN' ? 'Admin' : 'Recruiter View'}</span>
                    )}
                </NavLink>
                <button onClick={() => { navigate('/dashboard/account'); onMobileClose?.() }} className="sidebar-link w-full text-left">
                    <Settings className="flex-shrink-0" size={16} />
                    {!collapsed && <span>Settings</span>}
                </button>
                <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut className="flex-shrink-0" size={16} />
                    {!collapsed && <span>Log out</span>}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={clsx(
                    'sidebar transition-all duration-300 hidden md:flex flex-col',
                    collapsed ? 'w-[72px]' : 'w-[var(--sidebar-width)]'
                )}
                style={{ '--sidebar-width': collapsed ? '72px' : '260px' }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
                    <aside className="fixed left-0 top-0 h-full w-72 sidebar flex flex-col">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    )
}
