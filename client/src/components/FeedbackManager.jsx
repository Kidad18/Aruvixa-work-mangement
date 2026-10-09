import React, { useState, useEffect } from 'react';
import { 
  Lock, Send, Star, ShieldCheck, CheckCircle2, MessageSquareText, 
  AlertCircle, Sparkles, UserX, Eye, Inbox, Filter, Check 
} from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

export default function FeedbackManager({ currentUser }) {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'inbox' (if admin)
  
  // Feedback form state
  const [category, setCategory] = useState('General Suggestion');
  const [rating, setRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin Inbox state
  const [feedbacks, setFeedbacks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadingInbox, setLoadingInbox] = useState(false);

  useEffect(() => {
    if (currentUser?.is_admin && activeTab === 'inbox') {
      fetchAdminFeedback();
    }
  }, [activeTab, currentUser?.is_admin]);

  const fetchAdminFeedback = async () => {
    setLoadingInbox(true);
    try {
      const res = await fetch(`/api/feedback?access_code=${currentUser.access_code}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin feedback', err);
    } finally {
      setLoadingInbox(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError('Please enter your feedback thoughts.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          category,
          rating,
          is_anonymous: isAnonymous,
          content: content.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setSuccessMsg(data.message);
      setContent('');
      setIsAnonymous(false);
      setRating(5);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          access_code: currentUser.access_code
        })
      });

      if (res.ok) {
        setFeedbacks(feedbacks.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f));
      }
    } catch (err) {
      console.error('Failed to update feedback status', err);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => statusFilter === 'All' || f.status === statusFilter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Confidential Team Feedback</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Share honest suggestions, concerns, or company feedback. <span className="text-amber-400 font-semibold">Only Aruvixa Admins can view submitted feedback.</span>
          </p>
        </div>

        {/* Admin Switcher Tabs */}
        {currentUser?.is_admin && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'submit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inbox' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Admin Inbox</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Submit Feedback Form */}
      {activeTab === 'submit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-6">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Strict Privacy Guaranteed: Teammates cannot see other members' feedback. Only Admin can read submissions.</span>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs mb-6 font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            
            {/* Category Dropdown & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Feedback Topic / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
                >
                  <option value="General Suggestion">💡 General Suggestion</option>
                  <option value="Work Environment">🏢 Work Environment & Culture</option>
                  <option value="Process Improvement">⚡ Process & Work Improvement</option>
                  <option value="Management & Support">🤝 Management & Leadership</option>
                  <option value="Portal Features">🚀 Portal & Tool Improvements</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Overall Experience Rating
                </label>
                <div className="flex items-center gap-2 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-semibold ml-2">{rating}/5 Stars</span>
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Submit Anonymously?</span>
                  <span className="text-[11px] text-slate-400">Hide your name and email from the feedback submission</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 border-slate-700 bg-slate-900 cursor-pointer"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Feedback & Suggestions *
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts freely and constructively..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit Confidential Feedback</span>
            </button>

          </form>

        </div>
      )}

      {/* VIEW 2: Admin Feedback Inbox (STRICTLY ADMIN ONLY) */}
      {activeTab === 'inbox' && currentUser?.is_admin && (
        <div className="space-y-4">
          
          {/* Status Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-400" />
              <span>Admin Feedback Submissions ({feedbacks.length})</span>
            </h3>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="New">New Unread</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Feedback Cards */}
          <div className="space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No feedback submissions found under this filter.</p>
              </div>
            ) : (
              filteredFeedbacks.map(fb => (
                <div
                  key={fb.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{fb.sender_name}</span>
                        {Boolean(fb.is_anonymous) && (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded">
                            Anonymous
                          </span>
                        )}
                        <span className="text-slate-500 text-xs">
                          • {formatDistanceToNow(parseISO(fb.created_at))} ago
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                          {fb.category}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Change Selector */}
                    <select
                      value={fb.status}
                      onChange={(e) => handleUpdateStatus(fb.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        fb.status === 'New' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' :
                        fb.status === 'Reviewed' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
                    {fb.content}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
