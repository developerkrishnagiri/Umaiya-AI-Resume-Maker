import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    return (
        <div className="min-h-screen bg-dark-950 flex">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
            <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: collapsed ? '72px' : '260px' }}>
                <Topbar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-6 max-w-7xl mx-auto w-full animate-fade-in"><Outlet /></main>
            </div>
        </div>
    )
}
