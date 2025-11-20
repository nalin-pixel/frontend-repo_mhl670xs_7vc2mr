import React, { useEffect, useState } from 'react'
import { Shield, LogIn, FileText, Settings, Save } from 'lucide-react'

const base = import.meta.env.VITE_BACKEND_URL || ''

export default function AdminPortal() {
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('curesight')
  const [items, setItems] = useState([])
  const [rules, setRules] = useState({ red_flags: [] })
  const [content, setContent] = useState({})
  const [note, setNote] = useState('')
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [error, setError] = useState('')

  const login = async () => {
    setError('')
    const res = await fetch(`${base}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
    const data = await res.json()
    if (!res.ok) { setError(data.detail || 'Login failed'); return }
    setToken(data.token)
    loadAll(data.token)
  }

  const loadAll = async (tk = token) => {
    const logsRes = await fetch(`${base}/api/admin/logs?token=${tk}`)
    const logsData = await logsRes.json()
    if (logsRes.ok) setItems(logsData.items || [])
    const r = await fetch(`${base}/api/admin/rules?token=${tk}`)
    if (r.ok) setRules(await r.json())
    const c = await fetch(`${base}/api/admin/content?token=${tk}`)
    if (c.ok) setContent(await c.json())
  }

  const saveRules = async () => {
    const res = await fetch(`${base}/api/admin/rules?token=${token}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rules) })
    if (res.ok) loadAll()
  }

  const saveContent = async () => {
    const res = await fetch(`${base}/api/admin/content?token=${token}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) })
    if (res.ok) loadAll()
  }

  const addNote = async () => {
    if (!selectedQuery) return
    const res = await fetch(`${base}/api/admin/notes?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query_id: selectedQuery._id, note }) })
    if (res.ok) { setNote(''); alert('Note saved') }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-xl font-semibold"><Shield className="w-6 h-6"/> Admin Login</div>
          {error && <div className="text-red-400">{error}</div>}
          <input className="w-full bg-slate-800 rounded-xl px-3 py-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="w-full bg-slate-800 rounded-xl px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={login} className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2 inline-flex items-center justify-center gap-2"><LogIn className="w-5 h-5"/> Login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 text-lg font-semibold"><FileText className="w-5 h-5"/> Recent Queries</div>
              <button onClick={()=>loadAll()} className="text-sm px-3 py-1 bg-slate-800 rounded-lg">Refresh</button>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-2">
              {items.map(it => (
                <div key={it._id} onClick={()=>setSelectedQuery(it)} className={`p-3 rounded-xl border ${selectedQuery?._id===it._id?'border-blue-500 bg-slate-800':'border-slate-700 bg-slate-900 hover:bg-slate-800'}`}>
                  <div className="text-sm text-slate-400">{it.input_type} • {new Date(it.created_at).toLocaleString?.() || ''}</div>
                  <div className="text-slate-200 line-clamp-2">{it.symptom_text || '—'}</div>
                  {it.ocr_text && <div className="text-xs text-slate-400 line-clamp-2">Rx: {it.ocr_text}</div>}
                  {it.analysis && <div className="text-xs text-slate-300">{it.analysis.category} / {it.analysis.severity}</div>}
                </div>
              ))}
            </div>
          </div>

          {selectedQuery && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="text-lg font-semibold">Add Doctor Note</div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full bg-slate-800 rounded-xl p-3 min-h-[100px]" placeholder="Your note..."/>
              <button onClick={addNote} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2"><Save className="w-5 h-5"/> Save</button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="inline-flex items-center gap-2 font-semibold"><Settings className="w-5 h-5"/> Red-flag Rules</div>
            <textarea className="w-full bg-slate-800 rounded-xl p-3 min-h-[140px]" value={JSON.stringify(rules, null, 2)} onChange={e=>{ try { setRules(JSON.parse(e.target.value)) } catch {} }} />
            <button onClick={saveRules} className="bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2">Save Rules</button>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="inline-flex items-center gap-2 font-semibold"><Settings className="w-5 h-5"/> Guidance Content</div>
            <textarea className="w-full bg-slate-800 rounded-xl p-3 min-h-[220px]" value={JSON.stringify(content, null, 2)} onChange={e=>{ try { setContent(JSON.parse(e.target.value)) } catch {} }} />
            <button onClick={saveContent} className="bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2">Save Content</button>
          </div>
        </div>
      </div>
    </div>
  )
}
