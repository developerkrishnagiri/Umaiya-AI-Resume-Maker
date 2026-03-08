import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'
import { Search, Users, Loader, Shield, Trash2, Power } from 'lucide-react'
import clsx from 'clsx'

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)

    const load = (p = 0, q = search) => {
        setLoading(true)
        adminApi.users({ search: q || undefined, page: p, size: 20 })
            .then(r => { setUsers(r.data?.content || []); setTotal(r.data?.totalElements || 0); setPage(p) })
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const changeRole = async (id, role) => {
        try { await adminApi.changeRole(id, role); toast.success('Role updated'); load(page) }
        catch { toast.error('Failed') }
    }

    const toggleActive = async (id) => {
        try { await adminApi.toggleActive(id); toast.success('Status updated'); load(page) }
        catch { toast.error('Failed') }
    }

    const deleteUser = async (id) => {
        if (!confirm('Permanently delete this user?')) return
        try { await adminApi.deleteUser(id); toast.success('User deleted'); load(page) }
        catch { toast.error('Failed') }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div><h1 className="page-title">User Management</h1><p className="page-desc">{total} total users</p></div>
            </div>

            <div className="card p-4 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(0, search)}
                        placeholder="Search by name or email…" className="input pl-9" />
                </div>
                <button onClick={() => load(0, search)} className="btn-primary px-6">Search</button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/10">
                            <tr>
                                {['User', 'Email', 'Role', 'Plan', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-dark-400 font-medium text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12"><Loader className="w-6 h-6 animate-spin text-primary-400 mx-auto" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-dark-400">No users found</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-white/3 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </div>
                                            <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-dark-300">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <select value={user.role} onChange={e => changeRole(user.id, e.target.value)}
                                            className="text-xs bg-dark-800 border border-white/15 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary-500">
                                            {['JOBSEEKER', 'RECRUITER', 'ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={clsx('badge text-xs',
                                            user.planType === 'PRO' ? 'badge-primary' : user.planType === 'ENTERPRISE' ? 'badge-warning' : 'badge-info')}>
                                            {user.planType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={clsx('badge text-xs', user.active ? 'badge-success' : 'badge-danger')}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => toggleActive(user.id)} className="btn-ghost p-1.5 rounded-lg" title="Toggle status">
                                                <Power className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => deleteUser(user.id)} className="btn-ghost p-1.5 rounded-lg hover:text-red-400" title="Delete">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {total > 20 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-white/10">
                        <span className="text-dark-400 text-xs">Page {page + 1} of {Math.ceil(total / 20)}</span>
                        <div className="flex gap-2">
                            <button onClick={() => load(page - 1)} disabled={page === 0} className="btn-secondary btn-sm">Previous</button>
                            <button onClick={() => load(page + 1)} disabled={(page + 1) * 20 >= total} className="btn-secondary btn-sm">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
