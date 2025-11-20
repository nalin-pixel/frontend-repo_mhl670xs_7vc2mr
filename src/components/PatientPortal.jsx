import React, { useState, useRef, useEffect } from 'react'
import { Mic, Image as ImageIcon, Type, Globe2, Volume2, Upload } from 'lucide-react'

const languages = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
]

function useTTS() {
  const cache = useRef(new Map())
  return async (text, lang) => {
    const key = `${lang}:::${text}`
    if (cache.current.has(key)) {
      const url = cache.current.get(key)
      const audio = new Audio(url)
      audio.play()
      return
    }
    const base = import.meta.env.VITE_BACKEND_URL || ''
    const res = await fetch(`${base}/api/tts?` + new URLSearchParams({ text, lang }))
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    cache.current.set(key, url)
    const audio = new Audio(url)
    audio.play()
  }
}

export default function PatientPortal() {
  const [lang, setLang] = useState(languages[0].code)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const speak = useTTS()

  const analyzeText = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const base = import.meta.env.VITE_BACKEND_URL || ''
      const res = await fetch(`${base}/api/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: symptoms, language: lang })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')
      setResult(data)
      await speak(`Category ${data.category}. Severity ${data.severity}. ${data.recommendation}`, lang)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const onUploadImage = async (file) => {
    setLoading(true); setError(''); setResult(null)
    try {
      const base = import.meta.env.VITE_BACKEND_URL || ''
      const form = new FormData()
      form.append('file', file)
      form.append('language', lang)
      form.append('symptoms', symptoms)
      const res = await fetch(`${base}/api/analyze/image`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')
      setResult(data)
      await speak(`Category ${data.category}. Severity ${data.severity}. ${data.recommendation}`, lang)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const onUploadAudio = async (file) => {
    setLoading(true); setError(''); setResult(null)
    try {
      const base = import.meta.env.VITE_BACKEND_URL || ''
      const form = new FormData()
      form.append('file', file)
      form.append('language', lang)
      form.append('symptoms', symptoms)
      const res = await fetch(`${base}/api/analyze/audio`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')
      setResult(data)
      await speak(`Category ${data.category}. Severity ${data.severity}. ${data.recommendation}`, lang)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="relative w-full h-[420px]">
        {/* Spline hero */}
        <div className="absolute inset-0">
          <iframe src="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode" title="CureSight 3D" style={{ width: '100%', height: '100%', border: 0 }} />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center bg-gradient-to-b from-slate-950/0 via-slate-950/30 to-slate-950 pointer-events-none">
          <div className="text-center px-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">CureSight</h1>
            <p className="text-slate-300 mt-3 text-lg">Minimal symptom checker for everyone</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="w-6 h-6" />
            <select value={lang} onChange={(e)=>setLang(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-lg">
              {languages.map(l=> <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={analyzeText} className="flex flex-col items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center min-h-[140px]">
            <Type className="w-10 h-10" />
            <span className="text-xl">Analyze Text</span>
          </button>
          <label className="flex flex-col items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center min-h-[140px] cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={e=> e.target.files[0] && onUploadImage(e.target.files[0])} />
            <ImageIcon className="w-10 h-10" />
            <span className="text-xl">Upload Prescription</span>
          </label>
          <label className="flex flex-col items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center min-h-[140px] cursor-pointer">
            <input type="file" accept="audio/*" className="hidden" onChange={e=> e.target.files[0] && onUploadAudio(e.target.files[0])} />
            <Mic className="w-10 h-10" />
            <span className="text-xl">Upload Voice</span>
          </label>
        </div>

        <textarea value={symptoms} onChange={(e)=>setSymptoms(e.target.value)} placeholder="Type your symptoms here..." className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-lg min-h-[120px]" />

        {loading && <div className="text-center text-slate-300">Analyzing...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}

        {result && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Result</h3>
              <button onClick={()=> speak(`Category ${result.category}. Severity ${result.severity}. ${result.recommendation}`, lang)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2">
                <Volume2 className="w-5 h-5" /> Speak
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-800/50 rounded-xl p-4"><div className="text-slate-400">Category</div><div className="text-xl">{result.category}</div></div>
              <div className="bg-slate-800/50 rounded-xl p-4"><div className="text-slate-400">Severity</div><div className="text-xl">{result.severity}</div></div>
              <div className="bg-slate-800/50 rounded-xl p-4 md:col-span-1 col-span-1"><div className="text-slate-400">Reason</div><div className="text-sm">{result.reason || '—'}</div></div>
            </div>
            <div className="mt-4 text-lg text-slate-200">{result.recommendation}</div>
          </div>
        )}
      </div>

      <div className="mt-auto text-center text-slate-500 p-6">Not for emergencies. Always consult a qualified physician.</div>
    </div>
  )
}
