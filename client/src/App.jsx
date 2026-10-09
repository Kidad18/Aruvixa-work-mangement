import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import StatsOverview from './components/StatsOverview';
import TaskBoard from './components/TaskBoard';
import TeammatesManager from './components/TeammatesManager';
import TeamsManager from './components/TeamsManager';
import ChatRoom from './components/ChatRoom';
import FeedbackManager from './components/FeedbackManager';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aruvixa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load data on user login
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, membersRes, teamsRes, statsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/members'),
        fetch('/api/teams'),
        fetch('/api/stats')
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('aruvixa_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aruvixa_user');
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        await loadData();
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleCreateTask = async (taskData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create task');
    }

    await loadData();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) {
      await loadData();
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    }
  };

  const handleAddMember = async (memberData) => {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add member');
    }

    await loadData();
  };

  const handleRegenerateCode = async (memberId) => {
    const res = await fetch(`/api/members/${memberId}/generate-code`, { method: 'POST' });
    if (res.ok) {
      await loadData();
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this teammate?')) return;

    const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
    if (res.ok) {
      await loadData();
    }
  };

  // Teams CRUD Handlers
  const handleAddTeam = async (teamData) => {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create team');
    }

    await loadData();
  };

  const handleUpdateTeam = async (teamId, teamData) => {
    const res = await fetch(`/api/teams/${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update team');
    }

    await loadData();
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? Members will be unassigned.')) return;

    const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
    if (res.ok) {
      await loadData();
    }
  };

  // Filter tasks for "My Tasks" tab
  const myTasks = tasks.filter(t => t.assigned_to === currentUser?.id);

  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAssignModal={() => setShowAssignModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <StatsOverview stats={stats} members={members} />
        )}

        {/* All Tasks Tab */}
        {activeTab === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            members={members}
            currentUser={currentUser}
            onTaskStatusChange={handleTaskStatusChange}
            onOpenAssignModal={() => setShowAssignModal(true)}
            onSelectTask={setSelectedTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {/* My Tasks Tab */}
        {activeTab === 'my-tasks' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white">My Assigned Work ({myTasks.length})</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tasks assigned specifically to you ({currentUser.name}) under your role as <span className="text-indigo-400 font-semibold">{currentUser.role}</span>.
              </p>
            </div>

            <TaskBoard
              tasks={myTasks}
              members={members}
              currentUser={currentUser}
              onTaskStatusChange={handleTaskStatusChange}
              onOpenAssignModal={() => setShowAssignModal(true)}
              onSelectTask={setSelectedTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )}

        {/* Team Chat Tab */}
        {activeTab === 'chat' && (
          <ChatRoom currentUser={currentUser} teams={teams} />
        )}

        {/* Confidential Feedback Tab */}
        {activeTab === 'feedback' && (
          <FeedbackManager currentUser={currentUser} />
        )}

        {/* Teams & Leaders Tab */}
        {activeTab === 'teams' && (currentUser.is_admin || currentUser.is_team_leader) && (
          <TeamsManager
            teams={teams}
            members={members}
            onAddTeam={handleAddTeam}
            onUpdateTeam={handleUpdateTeam}
            onDeleteTeam={handleDeleteTeam}
          />
        )}

        {/* Teammates & Access Codes Tab */}
        {activeTab === 'teammates' && currentUser.is_admin && (
          <TeammatesManager
            members={members}
            teams={teams}
            onAddMember={handleAddMember}
            onRegenerateCode={handleRegenerateCode}
            onDeleteMember={handleDeleteMember}
          />
        )}

      </main>

      {/* Assign Work Modal */}
      {showAssignModal && (
        <TaskModal
          members={members}
          teams={teams}
          currentUser={currentUser}
          onClose={() => setShowAssignModal(false)}
          onSubmitTask={handleCreateTask}
        />
      )}

      {/* Task Detail & Comments Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleTaskStatusChange}
        />
      )}

    </div>
  );
}
