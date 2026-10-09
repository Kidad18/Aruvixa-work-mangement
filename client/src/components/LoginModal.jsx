import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Sparkles, AlertCircle, Building2, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoginModal({ onLogin }) {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoCodes, setShowDemoCodes] = useState(true);
  const [demoExpanded, setDemoExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.showDemoCodes !== undefined) {
          setShowDemoCodes(data.showDemoCodes);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Please enter your unique access code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCode = (code) => {
    setAccessCode(code);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
        
        {/* Glow effect behind header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Aruvixa Company Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Work Assignment, Role & Deadline Management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Teammate Unique Access Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="e.g. Enter Your Unique Code"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-center tracking-widest uppercase font-semibold text-lg"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Access Teammate Portal</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Optional Collapsible Demo Access Codes */}
        {showDemoCodes && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setDemoExpanded(!demoExpanded)}
              className="w-full flex items-center justify-between text-xs text-slate-400 font-medium hover:text-slate-200 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Quick Demo Access Codes
              </span>
              {demoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {demoExpanded && (
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <button
                  onClick={() => fillDemoCode('ARU-ADMIN')}
                  className="p-2 bg-indigo-950/60 border border-indigo-700/50 hover:bg-indigo-900/60 text-indigo-300 rounded-lg text-left transition font-mono flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-white">ARU-ADMIN</span>
                  <span className="text-[10px] text-indigo-400/80">Admin / Manager</span>
                </button>
                <button
                  onClick={() => fillDemoCode('ARU-1024')}
                  className="p-2 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left transition font-mono flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-white">ARU-1024</span>
                  <span className="text-[10px] text-slate-400">Sethu (Developer)</span>
                </button>
                <button
                  onClick={() => fillDemoCode('ARU-2048')}
                  className="p-2 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left transition font-mono flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-white">ARU-2048</span>
                  <span className="text-[10px] text-slate-400">Priya (Designer)</span>
                </button>
                <button
                  onClick={() => fillDemoCode('ARU-4096')}
                  className="p-2 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 rounded-lg text-left transition font-mono flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-white">ARU-4096</span>
                  <span className="text-[10px] text-slate-400">Rahul (Backend)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
