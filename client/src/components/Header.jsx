import React, { useState } from 'react';
import { 
  Building2, Copy, Check, LogOut, ShieldCheck, UserCheck, 
  LayoutDashboard, CheckSquare, Users, User, Plus, FolderKanban, Crown, MessageSquare, Lock 
} from 'lucide-react';

export default function Header({ user, activeTab, setActiveTab, onLogout, onOpenAssignModal }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (user?.access_code) {
      navigator.clipboard.writeText(user.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Aruvixa</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Team & Work Command Center</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>All Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'my-tasks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Tasks</span>
            </button>

            {/* Team Chat Tab */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Team Chat</span>
            </button>

            {/* Teams & Leaders Tab */}
            {(user?.is_admin || user?.is_team_leader) && (
              <button
                onClick={() => setActiveTab('teams')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'teams'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Teams & Leaders</span>
              </button>
            )}

            {/* Teammates & Access Codes Tab */}
            {user?.is_admin && (
              <button
                onClick={() => setActiveTab('teammates')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'teammates'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Teammates & Codes</span>
              </button>
            )}

            {/* Confidential Feedback Tab */}
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/*  Action Button for Assigning Work */}
            {user?.is_admin && (
              <button
                onClick={onOpenAssignModal}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium rounded-lg shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Work</span>
              </button>
            )}

            {/* Access Code Pill */}
            <div className="flex items-center bg-slate-950/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 mr-1.5 hidden sm:inline">Code:</span>
              <span className="font-mono font-bold text-amber-400 tracking-wider mr-2">{user?.access_code}</span>
              <button
                onClick={copyCode}
                title="Copy Unique Code"
                className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* User Info Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-inner relative"
                style={{ backgroundColor: user?.avatar_color || '#4F46E5' }}
              >
                {user?.name?.charAt(0) || 'U'}
                {user?.is_team_leader && (
                  <Crown className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
                )}
              </div>

              <div className="hidden lg:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white leading-tight">{user?.name}</span>
                  {user?.is_admin ? (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold uppercase">
                      Admin
                    </span>
                  ) : user?.is_team_leader ? (
                    <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                      Leader
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[9px] font-medium uppercase">
                      Member
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {user?.team_name ? `${user.team_name} • ${user.role}` : user?.role}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
