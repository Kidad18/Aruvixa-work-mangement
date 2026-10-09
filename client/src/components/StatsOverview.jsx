import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Flame, Users, CheckSquare, Zap, Crown, FolderKanban } from 'lucide-react';

export default function StatsOverview({ stats, members }) {
  if (!stats) return null;

  const completionPercentage = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalTasks}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Across {stats.totalMembers} members in {stats.totalTeams || 4} teams
          </p>
        </div>

        {/* Completed Work */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Work</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.completedTasks}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Completion Rate</span>
              <span className="font-semibold text-emerald-400">{completionPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* In Progress / Active */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{stats.inProgressTasks}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {stats.pendingTasks} pending in pipeline
          </p>
        </div>

        {/* Overdue / Urgent Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue & Urgent</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-extrabold text-rose-500">{stats.overdueTasks}</h3>
                <span className="text-xs text-rose-400/80 font-medium">Overdue</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-rose-400/90 mt-3 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            {stats.urgentTasks} tasks flagged as Urgent priority
          </p>
        </div>

      </div>

      {/* Team Capacity & Roster Snapshot */}
      {members && members.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Teammates Workload & Assigned Teams</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => {
              const totalAssigned = member.total_assigned_tasks || 0;
              const completed = member.completed_tasks || 0;
              const percent = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

              return (
                <div key={member.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3 relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md relative"
                    style={{ backgroundColor: member.avatar_color || '#4F46E5' }}
                  >
                    {member.name.charAt(0)}
                    {Boolean(member.is_team_leader) && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate flex items-center gap-1">
                        <span>{member.name}</span>
                        {Boolean(member.is_team_leader) && (
                          <span className="text-[10px] text-amber-400 font-bold">(Leader)</span>
                        )}
                      </h4>
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        {member.access_code}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-300/80 font-medium truncate mt-0.5">
                      {member.team_name ? `${member.team_name} • ${member.role}` : member.role}
                    </p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>{completed}/{totalAssigned} Tasks Done</span>
                        <span className="font-semibold text-slate-300">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
