import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeApi, atsApi } from '../../api'
import toast from 'react-hot-toast'
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    Save, Eye, EyeOff, Sparkles, Plus, Trash2, GripVertical,
    ChevronDown, ChevronUp, Loader, Wand2, Download, Printer, FileText, Code, FileJson
} from 'lucide-react'
import html2pdf from 'html2pdf.js'
import clsx from 'clsx'

const TEMPLATES = [
    { id: 'professional', name: 'Professional', color: 'from-blue-500 to-indigo-600' },
    { id: 'modern', name: 'Modern', color: 'from-purple-500 to-violet-600' },
    { id: 'dark-sidebar', name: 'Dark Sidebar', color: 'from-slate-800 to-slate-950' },
    { id: 'colored-sidebar', name: 'Colored Sidebar', color: 'from-blue-600 to-indigo-700' },
    { id: 'modern-header', name: 'Modern Header', color: 'from-gray-700 to-slate-900' },
    { id: 'split-right', name: 'Split Right', color: 'from-teal-600 to-emerald-700' },
    { id: 'navy-hex-sidebar', name: 'Navy Hex Sidebar', color: 'from-blue-900 to-indigo-950' },
    { id: 'grey-elegant', name: 'Grey Elegant', color: 'from-gray-400 to-gray-500' },
    { id: 'minimal', name: 'Minimal', color: 'from-gray-500 to-slate-600' },
    { id: 'creative', name: 'Creative', color: 'from-pink-500 to-rose-600' },
    { id: 'corporate', name: 'Corporate', color: 'from-emerald-500 to-teal-600' },
    { id: 'executive', name: 'Executive', color: 'from-amber-500 to-orange-600' },
    { id: 'tech', name: 'Tech', color: 'from-cyan-500 to-sky-600' },
    { id: 'elegant', name: 'Elegant', color: 'from-violet-500 to-purple-600' },
    { id: 'compact', name: 'Compact', color: 'from-lime-500 to-green-600' },
    { id: 'ats-optimized', name: 'ATS Optimized', color: 'from-red-500 to-rose-600' },
]

const SECTION_TYPES = [
    { id: 'summary', label: 'Professional Summary', icon: '📋' },
    { id: 'experience', label: 'Work Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
]

function SortableSection({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={clsx('transition-shadow', isDragging && 'z-50 shadow-glow')}
        >
            <div className="flex items-start gap-2">
                <button
                    {...attributes} {...listeners}
                    className="mt-4 p-1.5 text-dark-500 hover:text-dark-300 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    )
}

function PersonalInfoSection({ data, onChange }) {
    const fields = [
        { key: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
        { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
        { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
        { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
        { key: 'website', label: 'Website', placeholder: 'https://johndoe.com' },
        { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/johndoe' },
        { key: 'github', label: 'GitHub', placeholder: 'github.com/johndoe' },
    ]

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onChange('avatarUrl', reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 glass rounded-xl border border-white/5">
                <div className="w-16 h-16 rounded-full bg-dark-700 border-2 border-primary-500/30 overflow-hidden flex items-center justify-center shrink-0">
                    {data.avatarUrl ? (
                        <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl">📷</span>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium text-white mb-1 block">Profile Picture (Optional)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-dark-400 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-primary-500/20 file:text-primary-300 hover:file:bg-primary-500/30" />
                    <button onClick={() => onChange('avatarUrl', '')} className="text-xs text-red-400 hover:text-red-300 ml-3">Remove</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map(({ key, label, placeholder, type = 'text' }) => (
                    <div key={key}>
                        <label className="input-label">{label}</label>
                        <input
                            type={type}
                            value={data[key] || ''}
                            onChange={e => onChange(key, e.target.value)}
                            placeholder={placeholder}
                            className="input"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ExperienceSection({ items = [], onChange }) {
    const addItem = () => onChange([...items, { id: Date.now().toString(), company: '', title: '', startDate: '', endDate: '', current: false, description: '', bullets: [''] }])
    const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))
    const updateItem = (idx, key, val) => {
        const updated = [...items]; updated[idx] = { ...updated[idx], [key]: val }; onChange(updated)
    }

    return (
        <div className="space-y-4">
            {items.map((exp, idx) => (
                <div key={exp.id || idx} className="glass rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <span className="text-dark-400 text-xs font-medium">Experience {idx + 1}</span>
                        <button onClick={() => removeItem(idx)} className="text-dark-500 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Job Title</label><input value={exp.title || ''} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Software Engineer" className="input" /></div>
                        <div><label className="input-label">Company</label><input value={exp.company || ''} onChange={e => updateItem(idx, 'company', e.target.value)} placeholder="Acme Corp" className="input" /></div>
                        <div><label className="input-label">Start Date</label><input value={exp.startDate || ''} onChange={e => updateItem(idx, 'startDate', e.target.value)} placeholder="Jan 2022" className="input" /></div>
                        <div><label className="input-label">End Date</label><input value={exp.endDate || ''} onChange={e => updateItem(idx, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} className="input" /></div>
                    </div>
                    <div>
                        <label className="input-label">Description / Bullets</label>
                        <textarea value={(exp.bullets || []).join('\n')} onChange={e => updateItem(idx, 'bullets', e.target.value.split('\n'))} rows={3} placeholder="• Led a team of 5 to deliver…" className="textarea" />
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="btn-secondary btn-sm w-full gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
        </div>
    )
}

function SkillsSection({ items = [], onChange }) {
    const [input, setInput] = useState('')
    const add = () => {
        if (input.trim()) { onChange([...items, { id: Date.now().toString(), name: input.trim(), level: 'INTERMEDIATE' }]); setInput('') }
    }
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {items.map((skill, idx) => (
                    <span key={skill.id || idx} className="badge badge-primary gap-1.5">
                        {skill.name}
                        <button onClick={() => onChange(items.filter((_, i) => i !== idx))} className="hover:text-red-300">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Type a skill and press Enter…" className="input flex-1" />
                <button onClick={add} className="btn-primary btn-sm px-4">Add</button>
            </div>
        </div>
    )
}

function ProjectsSection({ items = [], onChange }) {
    const addItem = () => onChange([...items, { id: Date.now().toString(), name: '', role: '', startDate: '', endDate: '', url: '', description: '' }])
    const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))
    const updateItem = (idx, key, val) => {
        const updated = [...items]; updated[idx] = { ...updated[idx], [key]: val }; onChange(updated)
    }

    return (
        <div className="space-y-4">
            {items.map((proj, idx) => (
                <div key={proj.id || idx} className="glass rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <span className="text-dark-400 text-xs font-medium">Project {idx + 1}</span>
                        <button onClick={() => removeItem(idx)} className="text-dark-500 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Project Name</label><input value={proj.name || ''} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="E-commerce App" className="input" /></div>
                        <div><label className="input-label">Role</label><input value={proj.role || ''} onChange={e => updateItem(idx, 'role', e.target.value)} placeholder="Lead Developer" className="input" /></div>
                        <div><label className="input-label">Start Date</label><input value={proj.startDate || ''} onChange={e => updateItem(idx, 'startDate', e.target.value)} placeholder="Jan 2022" className="input" /></div>
                        <div><label className="input-label">End Date</label><input value={proj.endDate || ''} onChange={e => updateItem(idx, 'endDate', e.target.value)} placeholder="Present" className="input" /></div>
                        <div className="col-span-2"><label className="input-label">URL</label><input value={proj.url || ''} onChange={e => updateItem(idx, 'url', e.target.value)} placeholder="https://..." className="input" /></div>
                    </div>
                    <div>
                        <label className="input-label">Description</label>
                        <textarea value={proj.description || ''} onChange={e => updateItem(idx, 'description', e.target.value)} rows={3} placeholder="Built a scalable…" className="textarea" />
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="btn-secondary btn-sm w-full gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
        </div>
    )
}

function CertificationsSection({ items = [], onChange }) {
    const addItem = () => onChange([...items, { id: Date.now().toString(), name: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '' }])
    const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))
    const updateItem = (idx, key, val) => {
        const updated = [...items]; updated[idx] = { ...updated[idx], [key]: val }; onChange(updated)
    }

    return (
        <div className="space-y-4">
            {items.map((cert, idx) => (
                <div key={cert.id || idx} className="glass rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <span className="text-dark-400 text-xs font-medium">Certification {idx + 1}</span>
                        <button onClick={() => removeItem(idx)} className="text-dark-500 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Certification Name</label><input value={cert.name || ''} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="AWS Certified..." className="input" /></div>
                        <div><label className="input-label">Issuer</label><input value={cert.issuer || ''} onChange={e => updateItem(idx, 'issuer', e.target.value)} placeholder="Amazon Web Services" className="input" /></div>
                        <div><label className="input-label">Issue Date</label><input value={cert.issueDate || ''} onChange={e => updateItem(idx, 'issueDate', e.target.value)} placeholder="Jan 2022" className="input" /></div>
                        <div><label className="input-label">Expiry Date</label><input value={cert.expiryDate || ''} onChange={e => updateItem(idx, 'expiryDate', e.target.value)} placeholder="Never" className="input" /></div>
                        <div className="col-span-2"><label className="input-label">Credential URL</label><input value={cert.credentialUrl || ''} onChange={e => updateItem(idx, 'credentialUrl', e.target.value)} placeholder="https://..." className="input" /></div>
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="btn-secondary btn-sm w-full gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
        </div>
    )
}

function LanguagesSection({ items = [], onChange }) {
    const addItem = () => onChange([...items, { id: Date.now().toString(), name: '', proficiency: 'PROFESSIONAL' }])
    const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))
    const updateItem = (idx, key, val) => {
        const updated = [...items]; updated[idx] = { ...updated[idx], [key]: val }; onChange(updated)
    }

    return (
        <div className="space-y-4">
            {items.map((lang, idx) => (
                <div key={lang.id || idx} className="glass rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <span className="text-dark-400 text-xs font-medium">Language {idx + 1}</span>
                        <button onClick={() => removeItem(idx)} className="text-dark-500 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Language</label><input value={lang.name || ''} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="English" className="input" /></div>
                        <div>
                            <label className="input-label">Proficiency</label>
                            <select value={lang.proficiency || 'PROFESSIONAL'} onChange={e => updateItem(idx, 'proficiency', e.target.value)} className="input bg-dark-800">
                                <option value="NATIVE">Native</option>
                                <option value="FLUENT">Fluent</option>
                                <option value="PROFESSIONAL">Professional</option>
                                <option value="CONVERSATIONAL">Conversational</option>
                                <option value="ELEMENTARY">Elementary</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="btn-secondary btn-sm w-full gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Language
            </button>
        </div>
    )
}

function SummarySection({ value, onChange, onAiGenerate, aiLoading }) {
    return (
        <div className="space-y-3">
            <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={4}
                placeholder="Write a compelling professional summary…" className="textarea" />
            <button onClick={onAiGenerate} disabled={aiLoading} className="btn-secondary btn-sm gap-2">
                {aiLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-purple-400" />}
                Generate with AI
            </button>
        </div>
    )
}

function ResumePreview({ resume }) {
    const templateStyles = {
        professional: { font: 'Arial, sans-serif', primary: 'text-blue-900', secondary: 'text-blue-700', border: 'border-blue-900', bg: 'bg-white' },
        modern: { font: 'Inter, sans-serif', primary: 'text-purple-900', secondary: 'text-purple-700', border: 'border-purple-300', bg: 'bg-slate-50' },
        'dark-sidebar': { font: 'Inter, sans-serif', primary: 'text-slate-800', secondary: 'text-slate-600', border: 'border-slate-300', bg: 'bg-white' },
        'colored-sidebar': { font: 'Arial, sans-serif', primary: 'text-blue-900', secondary: 'text-blue-700', border: 'border-blue-300', bg: 'bg-white' },
        'modern-header': { font: 'Inter, sans-serif', primary: 'text-gray-900', secondary: 'text-gray-600', border: 'border-slate-300', bg: 'bg-white' },
        'split-right': { font: 'Helvetica, sans-serif', primary: 'text-teal-900', secondary: 'text-teal-700', border: 'border-teal-300', bg: 'bg-white' },
        'navy-hex-sidebar': { font: 'Arial, sans-serif', primary: 'text-slate-900', secondary: 'text-slate-600', border: 'border-slate-300', bg: 'bg-white' },
        'grey-elegant': { font: 'Arial, sans-serif', primary: 'text-gray-800', secondary: 'text-gray-500', border: 'border-gray-300', bg: 'bg-white' },
        minimal: { font: 'sans-serif', primary: 'text-gray-900', secondary: 'text-gray-600', border: 'border-gray-200', bg: 'bg-white' },
        creative: { font: 'Georgia, serif', primary: 'text-pink-700', secondary: 'text-pink-600', border: 'border-pink-300', bg: 'bg-white' },
        corporate: { font: 'Helvetica, sans-serif', primary: 'text-emerald-900', secondary: 'text-emerald-700', border: 'border-emerald-800', bg: 'bg-white' },
        executive: { font: 'Times New Roman, serif', primary: 'text-amber-900', secondary: 'text-amber-700', border: 'border-amber-900', bg: 'bg-amber-50' },
        tech: { font: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', primary: 'text-cyan-900', secondary: 'text-cyan-700', border: 'border-cyan-500', bg: 'bg-white' },
        elegant: { font: 'Garamond, serif', primary: 'text-violet-900', secondary: 'text-violet-700', border: 'border-violet-300', bg: 'bg-gray-50' },
        compact: { font: 'Arial, sans-serif', primary: 'text-lime-900', secondary: 'text-lime-700', border: 'border-lime-700', bg: 'bg-white' },
        'ats-optimized': { font: 'Times New Roman, serif', primary: 'text-black', secondary: 'text-black', border: 'border-black', bg: 'bg-white' }
    };
    const t = templateStyles[resume.templateId] || templateStyles.professional;

    const SectionHeader = ({ title }) => (
        <h2 className={`text-xs font-bold uppercase tracking-widest ${t.primary} border-b ${t.border} pb-1 mb-2 mt-4`}>
            {title}
        </h2>
    );

    const renderSections = (sectionIds) => {
        return sectionIds.map(sectionId => {
            switch (sectionId) {
                case 'summary':
                    return resume.summary ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Summary" />
                            <p className="text-gray-700 leading-relaxed text-xs text-justify">{resume.summary}</p>
                        </div>
                    ) : null;
                case 'skills':
                    return resume.skills?.length > 0 ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Skills" />
                            <p className="text-gray-700 text-xs">{resume.skills.map(s => s.name).join(' · ')}</p>
                        </div>
                    ) : null;
                case 'experience':
                    return resume.experiences?.length > 0 ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Experience" />
                            {resume.experiences.map((exp, i) => (
                                <div key={i} className="mb-3">
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span className={`font-bold text-xs ${t.primary} break-words`}>{exp.title}</span>
                                        <span className={`text-gray-500 font-medium text-[11px] ${t.primary} whitespace-nowrap shrink-0`}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ' – ' + (exp.current ? 'Present' : '')}</span>
                                    </div>
                                    <div className="text-gray-600 font-medium mb-1 text-xs">{exp.company} {exp.location && `· ${exp.location}`}</div>
                                    {exp.bullets?.filter(Boolean).map((b, j) => (
                                        <p key={j} className="text-gray-700 mt-0.5 text-xs text-justify">• {b}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : null;
                case 'education':
                    return resume.educations?.length > 0 ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Education" />
                            {resume.educations.map((edu, i) => (
                                <div key={i} className="mb-2">
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span className={`font-bold text-xs ${t.primary} break-words`}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</span>
                                        <span className={`text-gray-500 font-medium text-[11px] ${t.primary} whitespace-nowrap shrink-0`}>{edu.endDate}</span>
                                    </div>
                                    <div className="text-gray-600 text-xs">{edu.institution}</div>
                                </div>
                            ))}
                        </div>
                    ) : null;
                case 'projects':
                    return resume.projects?.length > 0 ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Projects" />
                            {resume.projects.map((proj, i) => (
                                <div key={i} className="mb-3">
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span className={`font-bold text-xs ${t.primary} break-words`}>{proj.name} {proj.role && `| ${proj.role}`}</span>
                                        <span className={`text-gray-500 font-medium text-[11px] ${t.primary} whitespace-nowrap shrink-0`}>{proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ''}</span>
                                    </div>
                                    {proj.url && <div className="text-blue-600 text-[11px] mb-1"><a href={proj.url}>{proj.url}</a></div>}
                                    <p className="text-gray-700 mt-0.5 text-xs text-justify">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : null;
                case 'certifications':
                    return resume.certifications?.length > 0 ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Certifications" />
                            <div className="grid grid-cols-2 gap-2">
                                {resume.certifications.map((cert, i) => (
                                    <div key={i} className="mb-1">
                                        <div className={`font-bold text-xs ${t.primary}`}>{cert.name}</div>
                                        <div className="text-gray-600 text-xs">{cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null;
                case 'languages':
                    return resume.languages?.length > 0 ? (
                        <div key={sectionId} className="mb-3">
                            <SectionHeader title="Languages" />
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {resume.languages.map((lang, i) => (
                                    <div key={i} className="text-xs">
                                        <span className={`font-bold ${t.primary}`}>{lang.name}</span>
                                        {lang.proficiency && <span className="text-gray-500"> - {lang.proficiency}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null;
                default: return null;
            }
        });
    };

    const sections = resume.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'];

    if (resume.templateId === 'modern' || resume.templateId === 'dark-sidebar' || resume.templateId === 'colored-sidebar') {
        const isDark = resume.templateId === 'dark-sidebar';
        const isColored = resume.templateId === 'colored-sidebar';
        const leftSections = sections.filter(s => ['skills', 'languages', 'certifications'].includes(s));
        const rightSections = sections.filter(s => !['skills', 'languages', 'certifications'].includes(s));
        return (
            <div className={`${t.bg} text-gray-900 rounded-xl shadow-2xl text-xs min-h-[11in] w-full flex overflow-hidden`} style={{ fontFamily: t.font }}>
                {/* Left Sidebar */}
                <div className={`w-[40%] p-5 border-r ${isDark ? 'bg-slate-900 text-white border-slate-800 [&_.text-gray-700]:text-slate-300 [&_.text-gray-600]:text-slate-400 [&_.text-gray-500]:text-slate-400 [&_h2]:text-white [&_h2]:border-slate-700 [&_.text-slate-800]:text-white' : isColored ? 'bg-blue-800 text-white border-blue-900 [&_.text-gray-700]:text-blue-100 [&_.text-gray-600]:text-blue-200 [&_.text-gray-500]:text-blue-300 [&_h2]:text-white [&_h2]:border-blue-700 [&_.text-blue-900]:text-white' : 'bg-slate-100 border-slate-200'}`}>
                    {resume.avatarUrl && (
                        <div className="mb-6 flex justify-center">
                            <img src={resume.avatarUrl} alt="Avatar" className={`w-32 h-32 rounded-full object-cover border-4 ${isDark ? 'border-slate-800' : isColored ? 'border-blue-700' : 'border-white'} shadow-sm`} />
                        </div>
                    )}
                    <div className="mb-6 w-full overflow-hidden" style={{ fontSize: `${resume.personalFontSize || 10}px` }}>
                        <h1 className={`font-black ${isDark || isColored ? 'text-white' : t.primary} mb-1 break-words leading-tight`} style={{ fontSize: `${(resume.personalFontSize || 10) * 1.5}px` }} title={resume.fullName || 'Your Name'}>{resume.fullName || 'Your Name'}</h1>
                        <div className="space-y-1 mt-3 w-full">
                            {resume.email && <div className={`${isDark ? 'text-slate-300' : isColored ? 'text-blue-200' : 'text-gray-600'} break-words`} title={resume.email}>{resume.email}</div>}
                            {resume.phone && <div className={`${isDark ? 'text-slate-300' : isColored ? 'text-blue-200' : 'text-gray-600'} whitespace-nowrap overflow-hidden text-ellipsis`}>{resume.phone}</div>}
                            {resume.location && <div className={`${isDark ? 'text-slate-300' : isColored ? 'text-blue-200' : 'text-gray-600'} whitespace-nowrap overflow-hidden text-ellipsis`} title={resume.location}>{resume.location}</div>}
                            <div className="space-y-1 mt-2 tracking-wide w-full">
                                {resume.linkedin && <a href={`https://${resume.linkedin}`} className={`block ${isDark ? 'text-indigo-300' : isColored ? 'text-blue-100' : t.secondary} whitespace-nowrap overflow-hidden text-ellipsis`} title={resume.linkedin}>{resume.linkedin}</a>}
                                {resume.github && <a href={`https://${resume.github}`} className={`block ${isDark ? 'text-indigo-300' : isColored ? 'text-blue-100' : t.secondary} whitespace-nowrap overflow-hidden text-ellipsis`} title={resume.github}>{resume.github}</a>}
                                {resume.website && <a href={`https://${resume.website}`} className={`block ${isDark ? 'text-indigo-300' : isColored ? 'text-blue-100' : t.secondary} whitespace-nowrap overflow-hidden text-ellipsis`} title={resume.website}>{resume.website}</a>}
                            </div>
                        </div>
                    </div>
                    {renderSections(leftSections)}
                </div>
                {/* Right Content */}
                <div className="w-[60%] p-8">
                    {renderSections(rightSections)}
                </div>
            </div>
        )
    }

    if (resume.templateId === 'modern-header') {
        const topSections = sections.filter(s => s === 'summary');
        const bottomSections = sections.filter(s => s !== 'summary');

        return (
            <div className={`${t.bg} text-gray-900 rounded-xl shadow-2xl text-xs min-h-[11in] w-full flex flex-col overflow-hidden`} style={{ fontFamily: t.font }}>
                {/* Dark Bold Header */}
                <div className="bg-slate-900 text-white p-10 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    {resume.avatarUrl && (
                        <img src={resume.avatarUrl} alt="Avatar" className="w-28 h-28 rounded-xl object-cover border-4 border-slate-800 shadow-xl relative z-10" />
                    )}
                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-4xl font-black uppercase tracking-wider mb-3 leading-tight text-white">{resume.fullName || 'Your Name'}</h1>

                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-slate-300 font-medium tracking-wide" style={{ fontSize: `${resume.personalFontSize || 11}px` }}>
                            {resume.email && <span className="break-words">{resume.email}</span>}
                            {resume.phone && <span>{resume.phone}</span>}
                            {resume.location && <span className="break-words">{resume.location}</span>}
                            {resume.linkedin && <a href={`https://${resume.linkedin}`} className="text-white underline decoration-slate-600 underline-offset-2 break-words">{resume.linkedin}</a>}
                            {resume.github && <a href={`https://${resume.github}`} className="text-white underline decoration-slate-600 underline-offset-2 break-words">{resume.github}</a>}
                            {resume.website && <a href={`https://${resume.website}`} className="text-white underline decoration-slate-600 underline-offset-2 break-words">{resume.website}</a>}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-10 pt-8 flex-1">
                    {renderSections(topSections)}
                    <div className="columns-1 md:columns-2 gap-8 mt-6">
                        {renderSections(bottomSections)}
                    </div>
                    <div className="clear-both"></div>
                </div>
            </div>
        )
    }

    if (resume.templateId === 'split-right') {
        const leftSections = sections.filter(s => !['skills', 'languages', 'certifications'].includes(s));
        const rightSections = sections.filter(s => ['skills', 'languages', 'certifications'].includes(s));
        return (
            <div className={`${t.bg} text-gray-900 rounded-xl shadow-2xl text-xs min-h-[11in] w-full flex overflow-hidden`} style={{ fontFamily: t.font }}>
                {/* Left Main Content */}
                <div className="w-2/3 p-8 border-r border-slate-100 bg-white">
                    <div className="mb-8 border-b-2 border-slate-100 pb-6 text-center md:text-left">
                        <h1 className={`text-3xl font-bold ${t.primary} mb-2 tracking-tight`}>{resume.fullName || 'Your Name'}</h1>
                        <p className={`text-[13px] font-medium ${t.secondary} max-w-md`}>
                            {[resume.email, resume.phone, resume.location].filter(Boolean).join('  •  ')}
                        </p>
                    </div>
                    {renderSections(leftSections)}
                </div>

                {/* Right Darker Sidebar */}
                <div className="w-1/3 bg-slate-50 p-6 shadow-inner">
                    {resume.avatarUrl && (
                        <div className="mb-8 flex justify-center">
                            <img src={resume.avatarUrl} alt="Avatar" className="w-36 h-36 rounded-2xl object-cover shadow-md border-2 border-white" />
                        </div>
                    )}

                    {(resume.linkedin || resume.github || resume.website) && (
                        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <h2 className="font-bold uppercase tracking-widest text-dark-500 mb-3" style={{ fontSize: `${(resume.personalFontSize || 10) * 0.9}px` }}>Links</h2>
                            <div className="space-y-2" style={{ fontSize: `${resume.personalFontSize || 11}px` }}>
                                {resume.linkedin && <a href={`https://${resume.linkedin}`} className={`block ${t.secondary} font-medium break-words`}>{resume.linkedin}</a>}
                                {resume.github && <a href={`https://${resume.github}`} className={`block ${t.secondary} font-medium break-words`}>{resume.github}</a>}
                                {resume.website && <a href={`https://${resume.website}`} className={`block ${t.secondary} font-medium break-words`}>{resume.website}</a>}
                            </div>
                        </div>
                    )}

                    {renderSections(rightSections)}
                </div>
            </div>
        )
    }

    if (resume.templateId === 'navy-hex-sidebar') {
        const leftSections = sections.filter(s => ['skills', 'languages', 'certifications'].includes(s));
        const rightSections = sections.filter(s => !['skills', 'languages', 'certifications'].includes(s));
        return (
            <div className={`${t.bg} text-gray-900 rounded-xl shadow-2xl text-xs min-h-[11in] w-full flex overflow-hidden`} style={{ fontFamily: t.font }}>
                {/* Left Navy Sidebar */}
                <div className="w-[40%] bg-blue-950 text-white p-5 border-r border-blue-900 [&_.text-gray-700]:text-blue-200 [&_.text-gray-600]:text-blue-300 [&_.text-gray-500]:text-blue-400 [&_h2]:text-white [&_h2]:border-blue-800 [&_.text-slate-900]:text-white relative">
                    {resume.avatarUrl && (
                        <div className="mb-8 flex justify-center mt-4">
                            {/* Hexagon style shape, approximating with specific border radius and clip-path for modern look */}
                            <div className="w-32 h-32 relative">
                                <div className="absolute inset-0 bg-blue-800 transform rotate-45 rounded-xl opacity-75 shadow-lg"></div>
                                <img src={resume.avatarUrl} alt="Avatar" className="absolute inset-0 w-full h-full object-cover rounded-[2rem] border-2 border-white/20 z-10 shadow-inner" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                            </div>
                        </div>
                    )}
                    <div className="mb-8 text-left mt-6 w-full" style={{ fontSize: `${resume.personalFontSize || 10}px` }}>
                        <h1 className="font-black text-white mb-2 uppercase tracking-wide leading-tight break-words" style={{ fontSize: `${(resume.personalFontSize || 10) * 1.5}px` }} title={resume.fullName || 'Your Name'}>{resume.fullName || 'Your Name'}</h1>
                        <div className="space-y-2 mt-4 border-t border-white/10 pt-4 flex flex-col items-start w-full">
                            {resume.email && <div className="text-blue-200 flex items-start gap-2 w-full" title={resume.email}><span className="text-blue-400 opacity-50 shrink-0 mt-0.5">✉</span> <span className="break-all leading-normal">{resume.email}</span></div>}
                            {resume.phone && <div className="text-blue-200 flex items-start gap-2 w-full"><span className="text-blue-400 opacity-50 shrink-0 mt-0.5">☎</span> <span className="break-all leading-normal">{resume.phone}</span></div>}
                            {resume.location && <div className="text-blue-200 flex items-start gap-2 w-full" title={resume.location}><span className="text-blue-400 opacity-50 shrink-0 mt-0.5">📍</span> <span className="break-all leading-normal">{resume.location}</span></div>}
                        </div>
                        <div className="space-y-2 mt-4 pt-4 border-t border-white/10 flex flex-col items-start w-full">
                            {resume.linkedin && <a href={`https://${resume.linkedin}`} target="_blank" rel="noreferrer" className="text-blue-300 block hover:text-white transition-colors w-full text-left break-all leading-normal font-medium" title={resume.linkedin}>🔗 {resume.linkedin}</a>}
                            {resume.website && <a href={`https://${resume.website}`} target="_blank" rel="noreferrer" className="text-blue-300 block hover:text-white transition-colors w-full text-left break-all leading-normal font-medium" title={resume.website}>🌐 {resume.website}</a>}
                        </div>
                    </div>
                    {renderSections(leftSections)}
                </div>
                {/* Right Content */}
                <div className="w-[60%] p-8 bg-slate-50 relative">
                    {renderSections(rightSections)}
                </div>
            </div>
        )
    }

    if (resume.templateId === 'grey-elegant') {
        const headerSections = sections.filter(s => s === 'summary');
        const leftSections = sections.filter(s => ['skills', 'languages', 'certifications'].includes(s) && s !== 'summary');
        const rightSections = sections.filter(s => !['skills', 'languages', 'certifications'].includes(s) && s !== 'summary');
        return (
            <div className={`${t.bg} text-gray-900 rounded-xl shadow-2xl text-xs min-h-[11in] w-full flex flex-col overflow-hidden`} style={{ fontFamily: t.font }}>
                {/* Header block with split color */}
                <div className="flex w-full min-h-[140px]">
                    <div className="w-1/3 bg-gray-200 p-6 flex flex-col justify-center items-center relative z-10">
                        {resume.avatarUrl && (
                            <img src={resume.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md absolute -bottom-12" />
                        )}
                    </div>
                    <div className="w-2/3 bg-gray-100 p-8 flex flex-col justify-center border-b border-gray-200">
                        <h1 className="text-[28px] font-bold text-gray-800 tracking-tight uppercase mb-1">{resume.fullName || 'Your Name'}</h1>
                        <div className="flex flex-wrap gap-x-4 text-gray-600 text-[11px] font-semibold">
                            {resume.email && <span>{resume.email}</span>}
                            {resume.phone && <span>{resume.phone}</span>}
                            {resume.location && <span>{resume.location}</span>}
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex w-full flex-1">
                    {/* Left Grey Column */}
                    <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 pt-16">
                        {(resume.linkedin || resume.github || resume.website) && (
                            <div className="mb-6">
                                <h2 className={`text-[10px] font-bold uppercase tracking-widest ${t.primary} border-b ${t.border} pb-1 mb-3`}>Contact</h2>
                                <div className="space-y-2">
                                    {resume.linkedin && <a href={`https://${resume.linkedin}`} className="text-gray-600 block text-xs underline decoration-gray-300">{resume.linkedin}</a>}
                                    {resume.github && <a href={`https://${resume.github}`} className="text-gray-600 block text-xs underline decoration-gray-300">{resume.github}</a>}
                                    {resume.website && <a href={`https://${resume.website}`} className="text-gray-600 block text-xs underline decoration-gray-300">{resume.website}</a>}
                                </div>
                            </div>
                        )}
                        {renderSections(leftSections)}
                    </div>
                    {/* Right Main Column */}
                    <div className="w-2/3 p-8 pt-6">
                        {renderSections(headerSections)}
                        <div className="mt-2">
                            {renderSections(rightSections)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`${t.bg} text-gray-900 p-8 rounded-xl shadow-2xl text-xs min-h-[11in] w-full`} style={{ fontFamily: t.font }}>
            {/* Header */}
            <div className={`flex items-center gap-6 border-b-2 ${t.border} pb-4 mb-4`}>
                {resume.avatarUrl && (
                    <img src={resume.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover shrink-0 border border-gray-200" />
                )}
                <div className={`${resume.avatarUrl ? 'text-left' : 'text-center flex-1'}`}>
                    <h1 className={`text-2xl font-bold ${t.primary}`}>{resume.fullName || 'Your Name'}</h1>
                    <p className="text-gray-600 text-xs mt-1">
                        {[resume.email, resume.phone, resume.location].filter(Boolean).join(' · ')}
                    </p>
                    <div className={`flex ${resume.avatarUrl ? 'justify-start' : 'justify-center'} gap-3 mt-1 text-xs`}>
                        {resume.linkedin && <a href={`https://${resume.linkedin}`} className={t.secondary}>{resume.linkedin}</a>}
                        {resume.github && <a href={`https://${resume.github}`} className={t.secondary}>{resume.github}</a>}
                        {resume.website && <a href={`https://${resume.website}`} className={t.secondary}>{resume.website}</a>}
                    </div>
                </div>
            </div>

            {/* Sections */}
            {renderSections(sections)}
        </div>
    )
}

export default function ResumeBuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [resume, setResume] = useState({ title: 'Untitled Resume', templateId: 'professional', personalFontSize: 10, experiences: [], educations: [], skills: [], projects: [], certifications: [], languages: [] })
    const [sections, setSections] = useState(['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'])
    const [preview, setPreview] = useState(true)
    const [saving, setSaving] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [activeSection, setActiveSection] = useState('personal')
    const [templateOpen, setTemplateOpen] = useState(false)
    const [exportOpen, setExportOpen] = useState(false)

    const handleExport = (format) => {
        let blob;
        // Extremely safe filename generation
        let safeName = 'resume';
        if (resume.title && resume.title.trim() && !resume.title.match(/^[0-9a-f-]{36}$/i) && resume.title !== 'Untitled Resume') {
            // Prioritize custom title if provided
            safeName = resume.title.trim();
        } else if (resume.fullName && resume.fullName.trim()) {
            // Fallback to full name if title is default
            safeName = resume.fullName.trim();
        } else if (resume.title && resume.title.trim() && !resume.title.match(/^[0-9a-f-]{36}$/i)) {
            // Fallback to 'Untitled Resume' if full name is missing
            safeName = resume.title.trim();
        }

        let baseName = safeName.replace(/[^a-z0-9\s-]/gi, '_').replace(/\s+/g, '-').toLowerCase();
        let ext = '';

        if (format === 'json') {
            blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
            ext = '.json';
        } else if (format === 'html') {
            const resumeHtml = document.getElementById('resume-preview-container')?.innerHTML || '';
            const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><script src="https://cdn.tailwindcss.com"></script></head><body style="padding: 2rem; background: #f1f5f9; display: flex; justify-content: center;">${resumeHtml}</body></html>`;
            blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
            ext = '.html';
        } else if (format === 'word') {
            const resumeHtml = document.getElementById('resume-preview-container')?.innerHTML || '';
            const fullHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>${baseName}</title>
    <style>
        body { font-family: sans-serif; font-size: 11pt; line-height: 1.2; }
    </style>
</head>
<body>
    ${resumeHtml}
</body>
</html>`;
            // Standard Word MIME trigger
            blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
            ext = '.doc';
        } else if (format === 'pdf') {
            const element = document.getElementById('resume-preview-container');
            if (element) {
                try {
                    const finalFileName = `${baseName || 'resume'}.pdf`;
                    const opt = {
                        margin: [10, 10, 10, 10],
                        filename: finalFileName,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
                        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait', compress: true }
                    };
                    // Explicitly pass filename to .save() for better browser compatibility
                    html2pdf().from(element).set(opt).save(finalFileName).catch(err => {
                        console.error('PDF generation error:', err);
                        toast.error('PDF export failed. Use "Print -> Save as PDF" instead.');
                    });
                } catch (e) {
                    toast.error('Failed to capture resume for PDF.');
                }
            }
            setExportOpen(false);
            return;
        } else if (format === 'print') {
            if (!preview) setPreview(true);
            setTimeout(() => {
                window.print();
            }, 300);
            setExportOpen(false);
            return;
        }

        if (blob) {
            const finalFileName = `${baseName}${ext}`;
            console.log(`Downloading ${finalFileName}, size: ${blob.size} bytes`);

            if (blob.size < 100) {
                toast.error('Export failed: File content is empty.');
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const dl = document.createElement('a');

            dl.href = url;
            dl.download = finalFileName;

            // Required for some browsers to trigger the download correctly
            document.body.appendChild(dl);
            dl.click();

            // Clean up - increased to 10s to be extremely safe for slow systems
            setTimeout(() => {
                if (document.body.contains(dl)) {
                    document.body.removeChild(dl);
                }
                window.URL.revokeObjectURL(url);
            }, 10000);
        }

        setExportOpen(false);
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        if (id) {
            resumeApi.get(id).then(r => {
                setResume(r.data)
                if (r.data.sectionOrder) setSections(r.data.sectionOrder)
            }).catch(() => toast.error('Failed to load resume'))
        }
    }, [id])

    // Auto-save every 30s
    useEffect(() => {
        if (!id) return
        const timer = setInterval(() => saveResume(true), 30000)
        return () => clearInterval(timer)
    }, [id, resume])

    const saveResume = async (auto = false) => {
        setSaving(true)
        try {
            const payload = { ...resume, sectionOrder: sections }
            // Auto-update title to full name if they never changed it manually from "Untitled Resume"
            if (payload.title === 'Untitled Resume' && payload.fullName && payload.fullName.trim()) {
                payload.title = payload.fullName.trim();
                setResume(p => ({ ...p, title: payload.title }));
            }
            if (id) {
                await resumeApi.update(id, payload)
            } else {
                const { data } = await resumeApi.create(payload)
                navigate(`/dashboard/resume/build/${data.id}`, { replace: true })
            }
            if (!auto) toast.success('Resume saved!')
        } catch { if (!auto) toast.error('Save failed') }
        finally { setSaving(false) }
    }

    const update = (key, value) => {
        setResume(p => {
            const next = { ...p, [key]: value }
            if (key === 'fullName' && (p.title === 'Untitled Resume' || p.title === (p.fullName || ''))) {
                next.title = value || 'Untitled Resume'
            }
            return next
        })
    }

    const aiGenerateSummary = async () => {
        setAiLoading(true)
        try {
            const ctx = `Name: ${resume.fullName}, Skills: ${resume.skills?.map(s => s.name).join(', ')}, Title: ${resume.experiences?.[0]?.title || ''}`
            const { data } = await atsApi.aiImprove(ctx, 'summary')
            update('summary', data.improved)
        } catch { toast.error('AI generation failed') }
        finally { setAiLoading(false) }
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            setSections(items => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)))
        }
    }

    const navItems = [
        { id: 'personal', label: '👤 Personal' },
        ...SECTION_TYPES.map(s => ({ id: s.id, label: `${s.icon} ${s.label.split(' ')[0]}` })),
    ]

    return (
        <div className="animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
                <div>
                    <input value={resume.title} onChange={e => update('title', e.target.value)}
                        className="bg-transparent text-2xl font-bold text-white border-none outline-none focus:border-b focus:border-primary-500 placeholder-dark-500"
                        placeholder="Resume Title" />
                    <p className="text-dark-400 text-xs mt-0.5">{saving ? 'Saving…' : 'Auto-saved'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setTemplateOpen(p => !p)} className="btn-secondary btn-sm gap-1.5">
                        🎨 Templates
                    </button>
                    <div className="relative">
                        <button onClick={() => setExportOpen(p => !p)} className="btn-secondary btn-sm gap-1.5">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                        {exportOpen && (
                            <div className="absolute top-full mt-2 w-40 right-0 py-2 glass-dark rounded-xl border border-white/10 shadow-xl z-50 animate-slide-up flex flex-col gap-1">
                                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> PDF (.pdf)
                                </button>
                                <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                                    <Printer className="w-4 h-4" /> Print
                                </button>
                                <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Word (.doc)
                                </button>
                                <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                                    <Code className="w-4 h-4" /> HTML
                                </button>
                                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                                    <FileJson className="w-4 h-4" /> JSON
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 h-full">
                        <span className="text-[10px] text-dark-400 font-medium uppercase tracking-wider whitespace-nowrap">Sidebar Info Font</span>
                        <input
                            type="range" min="6" max="16" step="0.5"
                            value={resume.personalFontSize || 10}
                            onChange={e => update('personalFontSize', parseFloat(e.target.value))}
                            className="w-24 accent-primary-500 h-1"
                        />
                        <span className="text-xs text-white min-w-[2rem] font-mono">{resume.personalFontSize || 10}px</span>
                    </div>

                    <button onClick={() => setPreview(p => !p)} className="btn-secondary btn-sm gap-1.5 h-full">
                        {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {preview ? 'Hide' : 'Preview'}
                    </button>
                    <button onClick={() => saveResume()} disabled={saving} className="btn-primary btn-sm gap-1.5">
                        {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                    </button>
                </div>
            </div>

            {/* Template picker */}
            {templateOpen && (
                <div className="card p-4 mb-4 animate-slide-up print:hidden">
                    <p className="text-dark-400 text-xs mb-3">Select a template</p>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATES.map(t => (
                            <button key={t.id} onClick={() => { update('templateId', t.id); setTemplateOpen(false) }}
                                className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition',
                                    resume.templateId === t.id
                                        ? 'border-primary-500 bg-primary-500/15 text-white'
                                        : 'border-white/10 text-dark-300 hover:border-white/25 hover:text-white')}>
                                <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${t.color}`} />
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={clsx('grid gap-6 print:block', preview ? 'lg:grid-cols-2' : 'grid-cols-1')}>
                {/* Editor */}
                <div className="space-y-4 print:hidden">
                    {/* Section nav */}
                    <div className="flex flex-wrap gap-1.5">
                        {navItems.map(({ id: nid, label }) => (
                            <button key={nid} onClick={() => setActiveSection(nid)}
                                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition',
                                    activeSection === nid ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'text-dark-400 hover:text-white hover:bg-white/5')}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Personal info */}
                    {activeSection === 'personal' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">👤 Personal Information</h3>
                            <PersonalInfoSection data={resume} onChange={(k, v) => update(k, v)} />
                        </div>
                    )}

                    {/* Summary */}
                    {activeSection === 'summary' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">📋 Professional Summary</h3>
                            <SummarySection value={resume.summary} onChange={v => update('summary', v)} onAiGenerate={aiGenerateSummary} aiLoading={aiLoading} />
                        </div>
                    )}

                    {/* Experience */}
                    {activeSection === 'experience' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4">💼 Work Experience</h3>
                            <ExperienceSection items={resume.experiences} onChange={v => update('experiences', v)} />
                        </div>
                    )}

                    {/* Skills */}
                    {activeSection === 'skills' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4">⚡ Skills</h3>
                            <SkillsSection items={resume.skills} onChange={v => update('skills', v)} />
                        </div>
                    )}

                    {/* Education */}
                    {activeSection === 'education' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4">🎓 Education</h3>
                            {(resume.educations || []).map((edu, idx) => (
                                <div key={idx} className="glass rounded-xl p-4 mb-3 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-dark-400 text-xs">Education {idx + 1}</span>
                                        <button onClick={() => update('educations', resume.educations.filter((_, i) => i !== idx))} className="text-dark-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            ['institution', 'University', 'MIT'],
                                            ['degree', 'Degree', 'B.S. Computer Science'],
                                            ['startDate', 'Start', '2018'],
                                            ['endDate', 'End', '2022'],
                                        ].map(([k, label, ph]) => (
                                            <div key={k}>
                                                <label className="input-label">{label}</label>
                                                <input value={edu[k] || ''} onChange={e => { const u = [...resume.educations]; u[idx] = { ...u[idx], [k]: e.target.value }; update('educations', u) }} placeholder={ph} className="input" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => update('educations', [...(resume.educations || []), { institution: '', degree: '', startDate: '', endDate: '' }])} className="btn-secondary btn-sm w-full gap-2">
                                <Plus className="w-3.5 h-3.5" /> Add Education
                            </button>
                        </div>
                    )}

                    {/* Projects */}
                    {activeSection === 'projects' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4">🚀 Projects</h3>
                            <ProjectsSection items={resume.projects} onChange={v => update('projects', v)} />
                        </div>
                    )}

                    {/* Certifications */}
                    {activeSection === 'certifications' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4">🏆 Certifications</h3>
                            <CertificationsSection items={resume.certifications} onChange={v => update('certifications', v)} />
                        </div>
                    )}

                    {/* Languages */}
                    {activeSection === 'languages' && (
                        <div className="card p-5">
                            <h3 className="text-white font-semibold mb-4">🌍 Languages</h3>
                            <LanguagesSection items={resume.languages} onChange={v => update('languages', v)} />
                        </div>
                    )}

                    {/* Section order */}
                    <div className="card p-5">
                        <h3 className="text-white font-semibold mb-3 text-sm">📦 Section Order (drag to reorder)</h3>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                                {sections.map(sectionId => {
                                    const sec = SECTION_TYPES.find(s => s.id === sectionId)
                                    return sec ? (
                                        <SortableSection key={sectionId} id={sectionId}>
                                            <div className="glass rounded-lg px-4 py-2.5 mb-2 flex items-center gap-3">
                                                <span className="text-base">{sec.icon}</span>
                                                <span className="text-dark-300 text-sm">{sec.label}</span>
                                            </div>
                                        </SortableSection>
                                    ) : null
                                })}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Live Preview */}
                {(preview || true) && ( // we always render preview but it might be hidden, actually preview var controls it. So just let it be blocked in print
                    <div className={clsx("lg:sticky lg:top-20 lg:self-start print:block print:w-full", !preview && "hidden print:block")}>
                        <div className="card p-4 print:p-0 print:shadow-none print:bg-transparent print:border-none">
                            <div className="flex items-center justify-between mb-3 print:hidden">
                                <span className="text-dark-400 text-xs font-medium">Live Preview · {resume.templateId}</span>
                                <span className="badge badge-success text-xs">Real-time</span>
                            </div>
                            <div className="overflow-auto max-h-[75vh] print:max-h-none print:overflow-visible" id="resume-preview-container">
                                <ResumePreview resume={resume} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
