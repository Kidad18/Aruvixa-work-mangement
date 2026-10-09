const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('../server/db');

const app = express();

app.use(cors());
app.use(express.json());

// Helper function to generate Unique Access Code (e.g. ARU-4921)
function generateAccessCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'ARU-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper: ensure a team leader can only create tasks for their own team
function authorizeTaskCreation(creatorId, targetTeamId) {
  const creator = db.prepare('SELECT * FROM members WHERE id = ?').get(creatorId);
  if (!creator) return; // allow if creator unknown (seeded tasks)
  if (creator.is_admin) return; // admin can do anything
  if (creator.is_team_leader) {
    if (!targetTeamId) {
      throw { status: 403, message: 'Team leaders must assign tasks to their own team.' };
    }
    if (creator.team_id !== targetTeamId) {
      throw { status: 403, message: 'You can only create tasks for the team you lead.' };
    }
  }
}

// Helper: block team leaders from creating/editing/deleting teams
function blockTeamLeaderFromTeamMgmt(accessCode) {
  const envAdmin = (process.env.ADMIN_ACCESS_CODE || 'ARU-ADMIN').toUpperCase();
  const clean = (accessCode || '').trim().toUpperCase();
  if (clean === envAdmin) return; // admin ok
  const member = db.prepare('SELECT * FROM members WHERE UPPER(access_code) = ?').get(clean);
  if (member && member.is_team_leader && !member.is_admin) {
    throw { status: 403, message: 'Team leaders are not allowed to create or modify teams. Please contact your admin.' };
  }
}

// ----------------------------------------------------
// SYSTEM CONFIG (SECURITY & PRODUCTION SETTINGS)
// ----------------------------------------------------
app.get('/api/config', (req, res) => {
  res.json({
    // Hide demo buttons on Vercel unless explicitly enabled via environment variable
    showDemoCodes: false,
    isProduction: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
  });
});

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({ error: 'Please enter your  access code' });
  }

  const cleanCode = accessCode.trim().toUpperCase();

  // Allow custom Admin Code via Environment Variable (e.g. ADMIN_ACCESS_CODE=ARU-MYSECRETKEY)
  const envAdminCode = (process.env.ADMIN_ACCESS_CODE || 'ARU-ADMIN').toUpperCase();
  
  if (cleanCode === envAdminCode) {
    const adminMember = db.prepare('SELECT * FROM members WHERE is_admin = 1 LIMIT 1').get();
    if (adminMember) {
      return res.json({
        message: 'Admin login successful',
        user: {
          id: adminMember.id,
          name: adminMember.name,
          email: adminMember.email,
          role: adminMember.role,
          access_code: cleanCode,
          is_admin: true,
          team_id: adminMember.team_id,
          team_name: 'Product Leadership',
          is_team_leader: false,
          avatar_color: adminMember.avatar_color
        }
      });
    }
  }

  const member = db.prepare(`
    SELECT m.*, tm.name as team_name
    FROM members m
    LEFT JOIN teams tm ON m.team_id = tm.id
    WHERE UPPER(m.access_code) = ?
  `).get(cleanCode);

  if (!member) {
    return res.status(401).json({ error: 'Invalid Access Code. Please check with your Aruvixa admin.' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      access_code: member.access_code,
      is_admin: Boolean(member.is_admin),
      team_id: member.team_id,
      team_name: member.team_name,
      is_team_leader: Boolean(member.is_team_leader),
      avatar_color: member.avatar_color
    }
  });
});

// ----------------------------------------------------
// DASHBOARD METRICS
// ----------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
    const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed'").get().count;
    const inProgressTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'In Progress'").get().count;
    const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status IN ('To Do', 'In Review')").get().count;
    const totalFeedbacks = db.prepare("SELECT COUNT(*) as count FROM feedbacks WHERE status = 'New'").get().count;
    
    const nowIso = new Date().toISOString();
    const overdueTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'Completed' AND due_date < ?").get(nowIso).count;
    const urgentTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'Completed' AND priority = 'Urgent'").get().count;

    res.json({
      totalMembers,
      totalTeams,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      urgentTasks,
      totalFeedbacks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// TEAM CHAT
// ----------------------------------------------------
app.get('/api/chat', (req, res) => {
  try {
    const { team_id } = req.query;

    let query = `
      SELECT c.*, m.access_code as sender_code
      FROM chat_messages c
      LEFT JOIN members m ON c.sender_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (team_id && team_id !== 'general') {
      query += ` AND c.team_id = ?`;
      params.push(team_id);
    } else {
      query += ` AND (c.team_id IS NULL OR c.team_id = 'general')`;
    }

    query += ` ORDER BY c.created_at ASC LIMIT 200`;

    const messages = db.prepare(query).all(...params);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', (req, res) => {
  try {
    const { sender_id, sender_name, sender_role, sender_avatar, team_id, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const msgId = 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    db.prepare(`
      INSERT INTO chat_messages (id, sender_id, sender_name, sender_role, sender_avatar, team_id, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      msgId,
      sender_id || 'mem_guest',
      sender_name || 'Teammate',
      sender_role || '',
      sender_avatar || '#4F46E5',
      team_id && team_id !== 'general' ? team_id : null,
      message.trim()
    );

    const created = db.prepare(`
      SELECT c.*, m.access_code as sender_code
      FROM chat_messages c
      LEFT JOIN members m ON c.sender_id = m.id
      WHERE c.id = ?
    `).get(msgId);

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CONFIDENTIAL FEEDBACK (ADMIN ONLY VISIBILITY)
// ----------------------------------------------------
app.post('/api/feedback', (req, res) => {
  try {
    const { sender_id, sender_name, category, rating, is_anonymous, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Feedback content cannot be empty.' });
    }

    const feedbackId = 'fb_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const finalSenderName = is_anonymous ? 'Anonymous Teammate' : (sender_name || 'Teammate');
    const finalSenderId = is_anonymous ? null : sender_id;

    db.prepare(`
      INSERT INTO feedbacks (id, sender_id, sender_name, category, rating, is_anonymous, content, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'New')
    `).run(
      feedbackId,
      finalSenderId,
      finalSenderName,
      category || 'General Suggestion',
      rating || 5,
      is_anonymous ? 1 : 0,
      content.trim()
    );

    res.status(201).json({ message: 'Thank you! Your confidential feedback has been sent directly to the Admin.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/feedback', (req, res) => {
  try {
    const { access_code } = req.query;

    if (!access_code) {
      return res.status(401).json({ error: 'Admin access code required to view feedback.' });
    }

    const envAdminCode = (process.env.ADMIN_ACCESS_CODE || 'ARU-ADMIN').toUpperCase();
    const cleanCode = access_code.trim().toUpperCase();

    let isAdmin = cleanCode === envAdminCode;
    if (!isAdmin) {
      const member = db.prepare('SELECT is_admin FROM members WHERE UPPER(access_code) = ?').get(cleanCode);
      if (member && member.is_admin) isAdmin = true;
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Access Denied: Confidential feedback can only be viewed by Aruvixa Admins.' });
    }

    const feedbacks = db.prepare('SELECT * FROM feedbacks ORDER BY created_at DESC').all();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/feedback/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, access_code } = req.body;

    if (!access_code) {
      return res.status(401).json({ error: 'Admin access code required.' });
    }

    const envAdminCode = (process.env.ADMIN_ACCESS_CODE || 'ARU-ADMIN').toUpperCase();
    const cleanCode = access_code.trim().toUpperCase();

    let isAdmin = cleanCode === envAdminCode;
    if (!isAdmin) {
      const member = db.prepare('SELECT is_admin FROM members WHERE UPPER(access_code) = ?').get(cleanCode);
      if (member && member.is_admin) isAdmin = true;
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Access Denied: Admin authorization required.' });
    }

    db.prepare('UPDATE feedbacks SET status = ? WHERE id = ?').run(status || 'Reviewed', id);
    const updated = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(id);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// TEAMS MANAGEMENT
// ----------------------------------------------------
app.get('/api/teams', (req, res) => {
  try {
    const teams = db.prepare(`
      SELECT 
        t.*,
        l.name as leader_name,
        l.role as leader_role,
        l.access_code as leader_code,
        l.avatar_color as leader_avatar,
        COUNT(DISTINCT m.id) as total_members,
        COUNT(DISTINCT tk.id) as total_tasks,
        SUM(CASE WHEN tk.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM teams t
      LEFT JOIN members l ON t.leader_id = l.id
      LEFT JOIN members m ON m.team_id = t.id
      LEFT JOIN tasks tk ON tk.team_id = t.id OR tk.assigned_to = m.id
      GROUP BY t.id
      ORDER BY t.created_at ASC
    `).all();

    const members = db.prepare(`
      SELECT id, name, role, email, access_code, avatar_color, team_id, is_team_leader
      FROM members
      WHERE team_id IS NOT NULL
    `).all();

    const result = teams.map(t => ({
      ...t,
      total_members: t.total_members || 0,
      total_tasks: t.total_tasks || 0,
      completed_tasks: t.completed_tasks || 0,
      members: members.filter(m => m.team_id === t.id)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', (req, res) => {
  try {
    const { name, description, leader_id, access_code } = req.body;
    const callerCode = req.headers['x-access-code'] || access_code || '';
    blockTeamLeaderFromTeamMgmt(callerCode);

    if (!name) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    const teamId = 'team_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    db.prepare(`
      INSERT INTO teams (id, name, description, leader_id)
      VALUES (?, ?, ?, ?)
    `).run(teamId, name, description || '', leader_id || null);

    if (leader_id) {
      db.prepare('UPDATE members SET team_id = ?, is_team_leader = 1 WHERE id = ?').run(teamId, leader_id);
    }

    const createdTeam = db.prepare(`
      SELECT t.*, l.name as leader_name, l.role as leader_role, l.access_code as leader_code
      FROM teams t LEFT JOIN members l ON t.leader_id = l.id
      WHERE t.id = ?
    `).get(teamId);

    res.status(201).json({ message: 'Team created successfully!', team: createdTeam });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || String(error) });
  }
});

app.put('/api/teams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, leader_id, access_code } = req.body;
    const callerCode = req.headers['x-access-code'] || access_code || '';
    blockTeamLeaderFromTeamMgmt(callerCode);

    const currentTeam = db.prepare('SELECT leader_id FROM teams WHERE id = ?').get(id);

    if (currentTeam && currentTeam.leader_id && currentTeam.leader_id !== leader_id) {
      db.prepare('UPDATE members SET is_team_leader = 0 WHERE id = ?').run(currentTeam.leader_id);
    }

    db.prepare(`
      UPDATE teams
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          leader_id = ?
      WHERE id = ?
    `).run(name, description, leader_id || null, id);

    if (leader_id) {
      db.prepare('UPDATE members SET team_id = ?, is_team_leader = 1 WHERE id = ?').run(id, leader_id);
    }

    const updated = db.prepare(`
      SELECT t.*, l.name as leader_name, l.role as leader_role, l.access_code as leader_code
      FROM teams t LEFT JOIN members l ON t.leader_id = l.id
      WHERE t.id = ?
    `).get(id);

    res.json({ message: 'Team updated successfully!', team: updated });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || String(error) });
  }
});

app.delete('/api/teams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const callerCode = req.headers['x-access-code'] || req.query.access_code || '';
    blockTeamLeaderFromTeamMgmt(callerCode);

    db.prepare('UPDATE members SET team_id = NULL, is_team_leader = 0 WHERE team_id = ?').run(id);
    db.prepare('UPDATE tasks SET team_id = NULL WHERE team_id = ?').run(id);
    db.prepare('DELETE FROM teams WHERE id = ?').run(id);

    res.json({ message: 'Team removed successfully' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || String(error) });
  }
});

// ----------------------------------------------------
// TEAM MEMBERS MANAGEMENT
// ----------------------------------------------------
app.get('/api/members', (req, res) => {
  try {
    const members = db.prepare(`
      SELECT 
        m.*,
        tm.name as team_name,
        COUNT(t.id) as total_assigned_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks
      FROM members m
      LEFT JOIN teams tm ON m.team_id = tm.id
      LEFT JOIN tasks t ON m.id = t.assigned_to
      GROUP BY m.id
      ORDER BY m.is_admin DESC, m.is_team_leader DESC, m.created_at ASC
    `).all();

    const formatted = members.map(m => ({
      ...m,
      is_admin: Boolean(m.is_admin),
      is_team_leader: Boolean(m.is_team_leader),
      total_assigned_tasks: m.total_assigned_tasks || 0,
      completed_tasks: m.completed_tasks || 0,
      in_progress_tasks: m.in_progress_tasks || 0
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', (req, res) => {
  try {
    const { name, email, role, is_admin, team_id, is_team_leader, avatar_color } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and Role are required fields.' });
    }

    let access_code = generateAccessCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 20) {
      const existing = db.prepare('SELECT id FROM members WHERE access_code = ?').get(access_code);
      if (!existing) {
        isUnique = true;
      } else {
        access_code = generateAccessCode();
      }
      attempts++;
    }

    const memberId = 'mem_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@aruvixa.com`;
    const color = avatar_color || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    db.prepare(`
      INSERT INTO members (id, name, email, role, access_code, is_admin, team_id, is_team_leader, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(memberId, name, userEmail, role, access_code, is_admin ? 1 : 0, team_id || null, is_team_leader ? 1 : 0, color);

    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
    res.status(201).json({
      message: 'Teammate created successfully!',
      member: {
        ...newMember,
        is_admin: Boolean(newMember.is_admin),
        is_team_leader: Boolean(newMember.is_team_leader)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members/:id/generate-code', (req, res) => {
  try {
    const { id } = req.params;
    let newCode = generateAccessCode();
    
    db.prepare('UPDATE members SET access_code = ? WHERE id = ?').run(newCode, id);
    res.json({ message: 'New unique access code generated!', access_code: newCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_admin, team_id, is_team_leader, avatar_color } = req.body;

    db.prepare(`
      UPDATE members
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          role = COALESCE(?, role),
          is_admin = COALESCE(?, is_admin),
          team_id = COALESCE(?, team_id),
          is_team_leader = COALESCE(?, is_team_leader),
          avatar_color = COALESCE(?, avatar_color)
      WHERE id = ?
    `).run(
      name, email, role, 
      is_admin !== undefined ? (is_admin ? 1 : 0) : null,
      team_id !== undefined ? team_id : null,
      is_team_leader !== undefined ? (is_team_leader ? 1 : 0) : null,
      avatar_color, id
    );

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    res.json({ message: 'Teammate updated successfully', member: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE teams SET leader_id = NULL WHERE leader_id = ?').run(id);
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    res.json({ message: 'Teammate removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// TASK & DEADLINE MANAGEMENT
// ----------------------------------------------------
app.get('/api/tasks', (req, res) => {
  try {
    const { assigned_to, team_id, status, priority, search } = req.query;

    let query = `
      SELECT 
        t.*,
        m.name as assignee_name,
        m.role as assignee_role,
        m.avatar_color as assignee_avatar,
        m.access_code as assignee_code,
        tm.name as team_name
      FROM tasks t
      LEFT JOIN members m ON t.assigned_to = m.id
      LEFT JOIN teams tm ON t.team_id = tm.id OR m.team_id = tm.id
      WHERE 1=1
    `;

    const params = [];

    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }

    if (team_id) {
      query += ` AND (t.team_id = ? OR m.team_id = ?)`;
      params.push(team_id, team_id);
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.role_required LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY 
      CASE t.priority 
        WHEN 'Urgent' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
      END ASC,
      t.due_date ASC`;

    const tasks = db.prepare(query).all(...params);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, assigned_to, team_id, role_required, priority, status, due_date, estimated_hours, created_by } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({ error: 'Task Title and Due Date & Time are required!' });
    }

    // Resolve effective team_id first (may come from assignee's team)
    let taskTeamId = team_id || null;
    if (!taskTeamId && assigned_to) {
      const assignedMember = db.prepare('SELECT team_id FROM members WHERE id = ?').get(assigned_to);
      if (assignedMember && assignedMember.team_id) {
        taskTeamId = assignedMember.team_id;
      }
    }

    // Permission check: team leaders can only create tasks for their own team
    if (created_by) {
      authorizeTaskCreation(created_by, taskTeamId);
    }

    const taskId = 'task_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    db.prepare(`
      INSERT INTO tasks (id, title, description, assigned_to, team_id, role_required, priority, status, due_date, estimated_hours, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId, title, description || '', assigned_to || null, taskTeamId,
      role_required || '', priority || 'Medium', status || 'To Do', due_date,
      estimated_hours ? parseFloat(estimated_hours) : 4.0, created_by || 'mem_admin'
    );

    const newTask = db.prepare(`
      SELECT t.*, m.name as assignee_name, m.role as assignee_role, m.avatar_color as assignee_avatar, tm.name as team_name
      FROM tasks t 
      LEFT JOIN members m ON t.assigned_to = m.id 
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `).get(taskId);

    res.status(201).json({ message: 'Task assigned successfully!', task: newTask });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || String(error) });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, team_id, role_required, priority, status, due_date, estimated_hours } = req.body;

    db.prepare(`
      UPDATE tasks
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          assigned_to = COALESCE(?, assigned_to),
          team_id = COALESCE(?, team_id),
          role_required = COALESCE(?, role_required),
          priority = COALESCE(?, priority),
          status = COALESCE(?, status),
          due_date = COALESCE(?, due_date),
          estimated_hours = COALESCE(?, estimated_hours),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, description, assigned_to, team_id, role_required, priority, status, due_date, estimated_hours, id
    );

    const updatedTask = db.prepare(`
      SELECT t.*, m.name as assignee_name, m.role as assignee_role, m.avatar_color as assignee_avatar, tm.name as team_name
      FROM tasks t 
      LEFT JOIN members m ON t.assigned_to = m.id 
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE t.id = ?
    `).get(id);

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export handler for Vercel serverless function
module.exports = app;
