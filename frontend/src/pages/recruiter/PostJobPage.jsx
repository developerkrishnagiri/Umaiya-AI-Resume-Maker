import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Briefcase, Save, Loader, Plus, Trash2, ArrowLeft } from 'lucide-react'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP']
const EXP_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Design', 'Data Science', 'Other']

export default function PostJobPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [requirements, setRequirements] = useState([''])
    const [benefits, setBenefits] = useState([''])
    const [keywords, setKeywords] = useState('')

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { status: 'ACTIVE', remote: false, salaryCurrency: 'USD', salaryPeriod: 'ANNUAL' }
    })

    useEffect(() => {
        if (id) {
            jobApi.get(id).then(r => {
                reset(r.data)
                setRequirements(r.data.requirements?.length ? r.data.requirements : [''])
                setBenefits(r.data.benefits?.length ? r.data.benefits : [''])
                setKeywords(r.data.keywords?.join(', ') || '')
            })
        }
    }, [id])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const payload = {
                ...data,
                requirements: requirements.filter(Boolean),
                benefits: benefits.filter(Boolean),
                keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
                salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
            }
            if (id) {
                await jobApi.update(id, payload)
                toast.success('Job updated!')
            } else {
                await jobApi.create(payload)
                toast.success('Job posted!')
            }
            navigate('/recruiter/jobs')
        } catch (e) {
            toast.error(e.response?.data?.message || 'Save failed')
        } finally { setSaving(false) }
    }

    const updateListItem = (setter, idx, val) => setter(p => { const n = [...p]; n[idx] = val; return n })
    const addListItem = (setter) => setter(p => [...p, ''])
    const removeListItem = (setter, idx) => setter(p => p.filter((_, i) => i !== idx))

    return (
        <div className="max-w-3xl animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn-ghost mb-6 gap-2"><ArrowLeft className="w-4 h-4" />Back</button>

            <div className="page-header">
                <div>
                    <h1 className="page-title">{id ? 'Edit Job' : 'Post a New Job'}</h1>
                    <p className="page-desc">Fill in the details to attract the best candidates</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Basic Info */}
                <div className="card p-6 space-y-4">
                    <h2 className="text-white font-bold">Job Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="input-label">Job Title *</label>
                            <input {...register('title', { required: 'Title is required' })} placeholder="e.g. Senior React Developer" className="input" />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="input-label">Company Name *</label>
                            <input {...register('company', { required: 'Company is required' })} placeholder="e.g. TechCorp Inc." className="input" />
                            {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company.message}</p>}
                        </div>
                        <div>
                            <label className="input-label">Location</label>
                            <input {...register('location')} placeholder="e.g. New York, NY" className="input" />
                        </div>
                        <div>
                            <label className="input-label">Industry</label>
                            <select {...register('industry')} className="select">
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Job Type</label>
                            <select {...register('jobType')} className="select">
                                {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Experience Level</label>
                            <select {...register('experienceLevel')} className="select">
                                {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Status</label>
                            <select {...register('status')} className="select">
                                <option value="ACTIVE">Active</option>
                                <option value="PAUSED">Paused</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <input type="checkbox" {...register('remote')} id="remote" className="w-4 h-4 accent-primary-500" />
                            <label htmlFor="remote" className="text-dark-300 text-sm cursor-pointer">Remote / Hybrid OK</label>
                        </div>
                    </div>
                </div>

                {/* Salary */}
                <div className="card p-6 space-y-4">
                    <h2 className="text-white font-bold">Salary Range <span className="text-dark-400 font-normal text-sm">(optional)</span></h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Min</label>
                            <input {...register('salaryMin')} type="number" placeholder="80000" className="input" />
                        </div>
                        <div>
                            <label className="input-label">Max</label>
                            <input {...register('salaryMax')} type="number" placeholder="120000" className="input" />
                        </div>
                        <div>
                            <label className="input-label">Currency</label>
                            <select {...register('salaryCurrency')} className="select">
                                <option value="USD">USD</option><option value="EUR">EUR</option>
                                <option value="GBP">GBP</option><option value="INR">INR</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card p-6 space-y-4">
                    <h2 className="text-white font-bold">Job Description *</h2>
                    <textarea {...register('description', { required: 'Description is required' })} rows={8}
                        placeholder="Describe the role, responsibilities, and what makes this a great opportunity…" className="textarea" />
                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>

                {/* Requirements */}
                <div className="card p-6 space-y-4">
                    <h2 className="text-white font-bold">Requirements</h2>
                    {requirements.map((req, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input value={req} onChange={e => updateListItem(setRequirements, idx, e.target.value)}
                                placeholder={`Requirement ${idx + 1}…`} className="input flex-1" />
                            <button type="button" onClick={() => removeListItem(setRequirements, idx)} className="btn-ghost px-2.5 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addListItem(setRequirements)} className="btn-secondary btn-sm gap-2"><Plus className="w-3.5 h-3.5" />Add Requirement</button>
                </div>

                {/* Benefits */}
                <div className="card p-6 space-y-4">
                    <h2 className="text-white font-bold">Benefits</h2>
                    {benefits.map((b, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input value={b} onChange={e => updateListItem(setBenefits, idx, e.target.value)}
                                placeholder={`Benefit ${idx + 1}…`} className="input flex-1" />
                            <button type="button" onClick={() => removeListItem(setBenefits, idx)} className="btn-ghost px-2.5 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addListItem(setBenefits)} className="btn-secondary btn-sm gap-2"><Plus className="w-3.5 h-3.5" />Add Benefit</button>
                </div>

                {/* Keywords */}
                <div className="card p-6 space-y-3">
                    <h2 className="text-white font-bold">Skills / Keywords</h2>
                    <p className="text-dark-400 text-xs">Comma-separated list of required skills (used for AI matching)</p>
                    <input value={keywords} onChange={e => setKeywords(e.target.value)}
                        placeholder="React, TypeScript, Node.js, AWS, Agile…" className="input" />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pb-8">
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : id ? 'Update Job' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    )
}
