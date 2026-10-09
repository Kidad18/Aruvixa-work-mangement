const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'aruvixa_portal.db')
  : path.join(__dirname, 'aruvixa_portal.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      leader_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      access_code TEXT UNIQUE NOT NULL,
      is_admin INTEGER DEFAULT 0,
      team_id TEXT,
      is_team_leader INTEGER DEFAULT 0,
      avatar_color TEXT DEFAULT '#4F46E5',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      team_id TEXT,
      role_required TEXT,
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
      status CHECK(status IN ('To Do', 'In Progress', 'In Review', 'Completed')) DEFAULT 'To Do',
      due_date TEXT NOT NULL,
      estimated_hours REAL DEFAULT 4.0,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT,
      sender_avatar TEXT,
      team_id TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      sender_id TEXT,
      sender_name TEXT NOT NULL,
      category TEXT DEFAULT 'General Suggestion',
      rating INTEGER DEFAULT 5,
      is_anonymous INTEGER DEFAULT 0,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safely ensure columns exist for existing tables
  try { db.exec(`ALTER TABLE members ADD COLUMN team_id TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE members ADD COLUMN is_team_leader INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE tasks ADD COLUMN team_id TEXT;`); } catch (e) {}

  // Check if members table has data
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
  if (memberCount === 0) {
    console.log('Seeding initial Aruvixa Members...');
    const insertMember = db.prepare(`
      INSERT INTO members (id, name, email, role, access_code, is_admin, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const membersData = [
      { id: 'mem_admin', name: 'Ganesh (Aruvixa Lead)', email: 'ganesh@aruvixa.com', role: 'Founder & Product Director', access_code: 'ARU-ADMIN', is_admin: 1, avatar_color: '#6366F1' },
      { id: 'mem_1', name: 'Sethu', email: 'sethu@aruvixa.com', role: 'Senior Full Stack Engineer', access_code: 'ARU-1024', is_admin: 0, avatar_color: '#10B981' },
      { id: 'mem_2', name: 'Priya Sharma', email: 'priya@aruvixa.com', role: 'Lead UI/UX Designer', access_code: 'ARU-2048', is_admin: 0, avatar_color: '#EC4899' },
      { id: 'mem_3', name: 'Rahul Verma', email: 'rahul@aruvixa.com', role: 'Backend Systems Engineer', access_code: 'ARU-4096', is_admin: 0, avatar_color: '#F59E0B' },
      { id: 'mem_4', name: 'Ananya Roy', email: 'ananya@aruvixa.com', role: 'QA & Automation Lead', access_code: 'ARU-8192', is_admin: 0, avatar_color: '#8B5CF6' }
    ];

    membersData.forEach(m => insertMember.run(m.id, m.name, m.email, m.role, m.access_code, m.is_admin, m.avatar_color));

    // Sample Tasks
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, assigned_to, role_required, priority, status, due_date, estimated_hours, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tasksData = [
      { id: 'task_1', title: 'Design Aruvixa Mobile App Wireframes', description: 'Create high-fidelity Figma components and flow diagrams for Aruvixa mobile client app.', assigned_to: 'mem_2', role_required: 'Lead UI/UX Designer', priority: 'High', status: 'In Progress', due_date: tomorrow, estimated_hours: 12.0, created_by: 'mem_admin' },
      { id: 'task_2', title: 'Implement OAuth2 & JWT Auth Microservice', description: 'Set up secure token refresh rotators and rate limiting for API authentication gateway.', assigned_to: 'mem_1', role_required: 'Senior Full Stack Engineer', priority: 'Urgent', status: 'To Do', due_date: in3Days, estimated_hours: 8.5, created_by: 'mem_admin' },
      { id: 'task_3', title: 'Optimize Database Query Indexes & Migrations', description: 'Perform EXPLAIN ANALYZE on slow analytics endpoints and configure SQLite WAL connection pooling.', assigned_to: 'mem_3', role_required: 'Backend Systems Engineer', priority: 'Medium', status: 'In Review', due_date: nextWeek, estimated_hours: 6.0, created_by: 'mem_admin' },
      { id: 'task_4', title: 'End-to-End Cypress Integration Test Suite', description: 'Automate checkout and teammate access code verification scenarios in CI/CD pipeline.', assigned_to: 'mem_4', role_required: 'QA & Automation Lead', priority: 'Low', status: 'To Do', due_date: nextWeek, estimated_hours: 10.0, created_by: 'mem_admin' },
      { id: 'task_5', title: 'Brand Assets & Design Guidelines Export', description: 'Finalize brand guidelines, typography rules, color tokens and SVG logo assets.', assigned_to: 'mem_2', role_required: 'Lead UI/UX Designer', priority: 'Medium', status: 'Completed', due_date: yesterday, estimated_hours: 4.0, created_by: 'mem_admin' }
    ];

    tasksData.forEach(t => insertTask.run(t.id, t.title, t.description, t.assigned_to, t.role_required, t.priority, t.status, t.due_date, t.estimated_hours, t.created_by));

    // Seed sample comment
    db.prepare(`
      INSERT INTO task_comments (id, task_id, member_id, member_name, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run('cmt_1', 'task_1', 'mem_2', 'Priya Sharma', 'Figma components updated with dark theme variants!');
  }

  // Seed default teams if empty
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
  if (teamCount === 0) {
    console.log('Seeding Aruvixa Teams & Team Leaders...');

    const insertTeam = db.prepare(`
      INSERT INTO teams (id, name, description, leader_id)
      VALUES (?, ?, ?, ?)
    `);

    const teamsData = [
      { id: 'team_1', name: 'UI/UX Design Studio', description: 'User research, wireframing, component libraries & product design.', leader_id: 'mem_2' },
      { id: 'team_2', name: 'Frontend & Mobile Engineering', description: 'React web portal, mobile apps, and UI component development.', leader_id: 'mem_1' },
      { id: 'team_3', name: 'Backend Systems & Infra', description: 'Database performance, REST APIs, microservices & cloud servers.', leader_id: 'mem_3' },
      { id: 'team_4', name: 'QA & Automation Guild', description: 'End-to-end Cypress test automation & quality assurance.', leader_id: 'mem_4' }
    ];

    teamsData.forEach(t => insertTeam.run(t.id, t.name, t.description, t.leader_id));

    // Update members with team assignments & team leader flags
    const updateMemberTeam = db.prepare('UPDATE members SET team_id = ?, is_team_leader = ? WHERE id = ?');
    updateMemberTeam.run('team_2', 1, 'mem_1'); // Sethu (Leader of Frontend)
    updateMemberTeam.run('team_1', 1, 'mem_2'); // Priya (Leader of UI/UX)
    updateMemberTeam.run('team_3', 1, 'mem_3'); // Rahul (Leader of Backend)
    updateMemberTeam.run('team_4', 1, 'mem_4'); // Ananya (Leader of QA)

    // Update tasks with team IDs
    const updateTaskTeam = db.prepare('UPDATE tasks SET team_id = ? WHERE id = ?');
    updateTaskTeam.run('team_1', 'task_1');
    updateTaskTeam.run('team_2', 'task_2');
    updateTaskTeam.run('team_3', 'task_3');
    updateTaskTeam.run('team_4', 'task_4');
    updateTaskTeam.run('team_1', 'task_5');
  }

  // Seed sample chat messages if empty
  const chatCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get().count;
  if (chatCount === 0) {
    console.log('Seeding initial Aruvixa Team Chat messages...');
    const insertChat = db.prepare(`
      INSERT INTO chat_messages (id, sender_id, sender_name, sender_role, sender_avatar, team_id, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertChat.run('msg_1', 'mem_admin', 'Ganesh (Aruvixa Lead)', 'Founder & Product Director', '#6366F1', null, 'Welcome to the Aruvixa Team Chat! Feel free to share updates and collaborate here.');
    insertChat.run('msg_2', 'mem_1', 'Sethu', 'Senior Full Stack Engineer', '#10B981', null, 'Hey everyone! Working on the authentication microservices today.');
    insertChat.run('msg_3', 'mem_2', 'Priya Sharma', 'Lead UI/UX Designer', '#EC4899', null, 'Updated the Figma designs for the new dashboard tabs!');
  }

  // Seed sample confidential feedbacks if empty
  const feedbackCount = db.prepare('SELECT COUNT(*) as count FROM feedbacks').get().count;
  if (feedbackCount === 0) {
    console.log('Seeding sample confidential feedback for Admin...');
    const insertFeedback = db.prepare(`
      INSERT INTO feedbacks (id, sender_id, sender_name, category, rating, is_anonymous, content, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertFeedback.run('fb_1', 'mem_1', 'Sethu', 'Process Improvement', 5, 0, 'The new task deadline timer feature really helped our sprint planning. Great portal setup!', 'New');
    insertFeedback.run('fb_2', null, 'Anonymous Teammate', 'Work Environment', 4, 1, 'Can we consider flexible working hours on Fridays? Otherwise team workflow is great.', 'New');
  }

  // Turn foreign keys back on
  db.pragma('foreign_keys = ON');
}

initDB();

module.exports = db;
