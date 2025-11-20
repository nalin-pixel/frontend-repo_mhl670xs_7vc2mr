import React from 'react'
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom'
import PatientPortal from './components/PatientPortal'
import AdminPortal from './components/AdminPortal'

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="relative w-full h-[460px]">
        <div className="absolute inset-0">
          <iframe src="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode" title="CureSight 3D" style={{ width: '100%', height: '100%', border: 0 }} />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center bg-gradient-to-b from-slate-950/0 via-slate-950/30 to-slate-950 pointer-events-none">
          <div className="text-center px-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">CureSight</h1>
            <p className="text-slate-300 mt-3 text-lg">Patients and doctors connected by clarity</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <Link to="/patient" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-lg">Patient Portal</Link>
              <Link to="/admin" className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-lg">Doctor/Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  )
}
