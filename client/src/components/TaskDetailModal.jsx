import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Calendar, User, MessageSquare, Send, 
  AlertCircle, Briefcase, FileText, CheckSquare, Sparkles 
} from 'lucide-react';
import { formatDistanceToNow, parseISO, format, isAfter } from 'date-fns';

export default function TaskDetailModal({ task, currentUser, onClose, onUpdateStatus }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (task?.id) {
      fetchComments();
    }
  }, [task?.id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: currentUser?.id || 'mem_guest',
          member_name: currentUser?.name || 'Teammate',
          comment: newComment.trim()
        })
      });

      if (res.ok) {
        const added = await res.json();
        setComments([...comments, added]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!task) return null;

  const dueDate = parseISO(task.due_date);
  const now = new Date();
  const isOverdue = !isAfter(dueDate, now) && task.status !== 'Completed';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                task.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {task.priority} Priority
              </span>

              {task.role_required && (
                <span className="text-[10px] text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded font-medium">
                  {task.role_required}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white leading-snug">{task.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status & Deadline Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Status</span>
              <select
                value={task.status}
                onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Completion Deadline</span>
              <div className="flex items-center gap-2 pt-1 text-xs">
                {isOverdue ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 animate-pulse" />
                    Overdue ({formatDistanceToNow(dueDate)} ago)
                  </span>
                ) : (
                  <span className="text-slate-200 font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {format(dueDate, 'PPP p')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Work Instructions & Description</span>
            </h4>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No detailed instructions added.'}
            </div>
          </div>

          {/* Assignee & Timing Info */}
          <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Assigned Teammate:</span>
              <span className="font-bold text-white">{task.assignee_name || 'Unassigned'}</span>
            </div>
            {task.estimated_hours && (
              <div className="flex items-center gap-1 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Est: {task.estimated_hours} Hours</span>
              </div>
            )}
          </div>

          {/* Activity / Comments Section */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Work Updates & Team Discussion ({comments.length})</span>
            </h4>

            {/* Comments List */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs italic text-slate-500">No updates or comments posted yet.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{c.member_name}</span>
                      <span className="text-[10px] text-slate-500">
                        {formatDistanceToNow(parseISO(c.created_at))} ago
                      </span>
                    </div>
                    <p className="text-slate-300">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post work update or question..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
