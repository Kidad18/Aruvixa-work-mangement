import React, { useState } from 'react';
import { 
  Users, UserPlus, KeyRound, Copy, Check, RefreshCw, ShieldCheck, 
  UserCheck, Mail, Briefcase, Trash2, Edit2, AlertCircle, Sparkles, Crown, FolderKanban
} from 'lucide-react';

export default function TeammatesManager({ members, teams = [], onAddMember, onRegenerateCode, onDeleteMember }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // New member form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [teamId, setTeamId] = useState('');
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarColor, setAvatarColor] = useState('#4F46E5');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const copyToClipboard = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('Teammate Name and Role are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onAddMember({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        team_id: teamId || null,
        is_team_leader: isTeamLeader,
        is_admin: isAdmin,
        avatar_color: avatarColor
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setRole('');
      setTeamId('');
      setIsTeamLeader(false);
      setIsAdmin(false);
    } catch (err) {
      setError(err.message || 'Failed to add teammate');
    } finally {
      setSubmitting(false);
    }
  };

  const presetRoles = [
    'Senior Full Stack Engineer',
    'Lead UI/UX Designer',
    'Backend Systems Engineer',
    'Frontend Developer',
    'QA & Automation Lead',
    'DevOps Engineer',
    'Product Manager',
    'Technical Content Lead'
  ];

  const presetColors = [
    '#4F46E5', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#3B82F6', '#EF4444', '#14B8A6'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Aruvixa Team Roster & Unique Access Codes</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage teammate roles, assigned teams, team leaders, and unique 6-character access codes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Teammate</span>
        </button>
      </div>

      {/* Teammates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map(member => (
          <div
            key={member.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative group hover:border-slate-700 transition"
          >
            <div>
              {/* Header: Avatar, Name, Admin/Leader Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-md relative"
                    style={{ backgroundColor: member.avatar_color || '#4F46E5' }}
                  >
                    {member.name.charAt(0)}
                    {Boolean(member.is_team_leader) && (
                      <Crown className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-base font-bold text-white">{member.name}</h3>
                      {member.is_admin ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : Boolean(member.is_team_leader) ? (
                        <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Leader
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-medium uppercase">
                          Member
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-indigo-300 font-medium mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{member.role}</span>
                    </div>
                  </div>
                </div>

                {/* Delete Member (Don't allow deleting admin) */}
                {!member.is_admin && (
                  <button
                    onClick={() => onDeleteMember(member.id)}
                    title="Remove Teammate"
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Team Info & Email */}
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                {member.team_name && (
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-200">{member.team_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>

            {/* Access Code Box */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Unique Access Code
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-lg tracking-widest">
                    {member.access_code}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(member.id, member.access_code)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === member.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Regenerate Code Button */}
                  <button
                    onClick={() => onRegenerateCode(member.id)}
                    title="Regenerate Access Code"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Task Workload Summary */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Workload:</span>
                <span className="font-semibold text-slate-200">
                  {member.completed_tasks || 0} / {member.total_assigned_tasks || 0} tasks completed
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add Teammate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>Add New Aruvixa Teammate</span>
            </h3>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vikram@aruvixa.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Role / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead UI/UX Designer"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                />
                {/* Preset Role Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {presetRoles.slice(0, 5).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded transition cursor-pointer"
                    >
                      + {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign Team Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Assign Team
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- No Team Assigned --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Team Leader & Admin Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <input
                    type="checkbox"
                    id="isLeaderCheckbox"
                    checked={isTeamLeader}
                    onChange={(e) => setIsTeamLeader(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="isLeaderCheckbox" className="text-xs text-slate-300 cursor-pointer">
                    <span className="font-bold text-amber-400 block flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> Team Leader Role
                    </span>
                    Grants supervisory visibility over team's tasks and workload
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <input
                    type="checkbox"
                    id="isAdminCheckbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="isAdminCheckbox" className="text-xs text-slate-300 cursor-pointer">
                    <span className="font-bold text-white block">Admin / Manager Access</span>
                    Can create tasks, teams, manage roles, and issue access codes
                  </label>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-7 h-7 rounded-full transition cursor-pointer ${
                        avatarColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Code & Save</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
