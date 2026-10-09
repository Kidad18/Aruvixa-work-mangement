import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Calendar, Clock, AlertCircle, CheckCircle2, 
  Hourglass, Flame, MessageSquare, MoreVertical, Edit2, Trash2, User,
  ChevronDown, ShieldAlert, ArrowRight
} from 'lucide-react';
import { formatDistanceToNow, isAfter, parseISO, format } from 'date-fns';

export default function TaskBoard({ 
  tasks, 
  members, 
  currentUser, 
  onTaskStatusChange, 
  onOpenAssignModal, 
  onSelectTask, 
  onDeleteTask 
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'kanban'

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase())) ||
      (task.role_required && task.role_required.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'All' || task.assigned_to === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Deadline calculator helper
  const getDeadlineBadge = (dueDateStr, status) => {
    if (!dueDateStr) return null;
    const dueDate = parseISO(dueDateStr);
    const now = new Date();

    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }

    const isOverdue = !isAfter(dueDate, now);

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded-md animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Overdue ({formatDistanceToNow(dueDate)} ago)
        </span>
      );
    }

    const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft <= 24) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3" />
          Due in {formatDistanceToNow(dueDate)}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
        <Calendar className="w-3 h-3 text-slate-400" />
        Due {format(dueDate, 'MMM d, h:mm a')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-800 text-slate-400 border border-slate-700">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Control Bar: Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, roles, titles..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Teammates</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
            ))}
          </select>

          {/* Assign Work Button */}
          {currentUser?.is_admin && (
            <button
              onClick={onOpenAssignModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer ml-auto lg:ml-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Work</span>
            </button>
          )}

        </div>

      </div>

      {/* Task Count Summary */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredTasks.length}</span> work items
        </p>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <Hourglass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No work items match your current filter settings. Try clearing your search query or assign new work.
          </p>
        </div>
      )}

      {/* Task Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition duration-200 group relative"
          >
            <div>
              {/* Header: Priority & Status Dropdown */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  {task.role_required && (
                    <span className="text-[10px] font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded truncate max-w-[130px]">
                      {task.role_required}
                    </span>
                  )}
                </div>

                {/* Status Change Selector */}
                <select
                  value={task.status}
                  onChange={(e) => onTaskStatusChange(task.id, e.target.value)}
                  className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : task.status === 'In Progress'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : task.status === 'In Review'
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Title & Description */}
              <h3
                onClick={() => onSelectTask(task)}
                className="text-base font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-2"
              >
                {task.title}
              </h3>
              
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {task.description || 'No detailed instructions specified.'}
              </p>
            </div>

            {/* Footer Details: Deadline & Assignee */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
              
              {/* Deadline & Time allocation */}
              <div className="flex items-center justify-between text-xs">
                <div>{getDeadlineBadge(task.due_date, task.status)}</div>
                {task.estimated_hours && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                    Est: {task.estimated_hours}h
                  </span>
                )}
              </div>

              {/* Assignee & Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                {task.assignee_name ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                      style={{ backgroundColor: task.assignee_avatar || '#4F46E5' }}
                    >
                      {task.assignee_name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                      {task.assignee_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Unassigned
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectTask(task)}
                    className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-md transition flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {currentUser?.is_admin && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete Task"
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
