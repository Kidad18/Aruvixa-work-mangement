import React, { useState } from 'react';
import { 
  Users, Crown, Plus, ShieldCheck, UserCheck, Briefcase, 
  Trash2, Edit2, AlertCircle, Sparkles, FolderKanban, CheckCircle2, User, KeyRound
} from 'lucide-react';

export default function TeamsManager({ teams, members, currentUser, onAddTeam, onUpdateTeam, onDeleteTeam }) {
  const isAdmin = currentUser?.is_admin || false;
  const isLeader = currentUser?.is_team_leader && !isAdmin;
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingTeam(null);
    setName('');
    setDescription('');
    setLeaderId('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setName(team.name || '');
    setDescription(team.description || '');
    setLeaderId(team.leader_id || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingTeam) {
        await onUpdateTeam(editingTeam.id, {
          name: name.trim(),
          description: description.trim(),
          leader_id: leaderId || null
        });
      } else {
        await onAddTeam({
          name: name.trim(),
          description: description.trim(),
          leader_id: leaderId || null
        });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Aruvixa Teams & Team Leaders</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create specialized teams, assign Team Leaders, and group work items for maximum productivity.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Team</span>
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => {
          const totalTasks = team.total_tasks || 0;
          const completedTasks = team.completed_tasks || 0;
          const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div
              key={team.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-slate-700 transition space-y-5"
            >
              <div>
                {/* Team Title & Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{team.name}</span>
                      <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                        {team.total_members || 0} Members
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {team.description || 'No description provided.'}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(team)}
                        title="Edit Team & Leader"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTeam(team.id)}
                        title="Delete Team"
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Leader Banner */}
                <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Team Leader
                      </span>
                      <span className="text-xs font-bold text-white">
                        {team.leader_name || 'No Leader Assigned'}
                      </span>
                      {team.leader_role && (
                        <span className="text-[11px] text-slate-400 block">{team.leader_role}</span>
                      )}
                    </div>
                  </div>

                  {team.leader_code && (
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg">
                      {team.leader_code}
                    </span>
                  )}
                </div>

                {/* Team Members List */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Team Roster ({team.members ? team.members.length : 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {team.members && team.members.length > 0 ? (
                      team.members.map(m => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                            style={{ backgroundColor: m.avatar_color || '#4F46E5' }}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-200">{m.name}</span>
                          {Boolean(m.is_team_leader) && (
                            <Crown className="w-3 h-3 text-amber-400 ml-0.5" />
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs italic text-slate-500">No teammates assigned yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Team Work Completion</span>
                  <span className="font-bold text-indigo-400">{completedTasks}/{totalTasks} Tasks ({percent}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Team */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              <span>{editingTeam ? 'Edit Team & Leader' : 'Create New Team'}</span>
            </h3>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frontend Core & Mobile"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Team Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this team focuses on..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Assign Team Leader Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase mb-1 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Assign Team Leader *</span>
                </label>
                <select
                  value={leaderId}
                  onChange={(e) => setLeaderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
                >
                  <option value="">-- Select Team Leader --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      👑 {m.name} ({m.role}) - Code: {m.access_code}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  The Team Leader will receive supervisory privileges over tasks assigned to this team.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  <span>Save Team & Assign Leader</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
