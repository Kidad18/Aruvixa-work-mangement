# Aruvixa Company Portal 🚀

A modern, full-stack Company Management & Work Assignment Portal built for **Aruvixa**.

![Aruvixa Portal](https://img.shields.io/badge/Aruvixa-Portal-indigo) ![Tech](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20React%20%7C%20SQLite-violet)

---

## 🌟 Key Features

1. **Teams & Team Leader Assignment** *(NEW)*:
   - Admins can create custom teams (*e.g., UI/UX Design Studio, Frontend & Mobile, Backend Systems, QA Guild*).
   - Admins can assign a **Team Leader** (👑) to each team.
   - Team Leaders receive supervisory visibility over team workload and member progress.

2. **Teammate Unique Access Code Authentication**:
   - Every teammate logs in with a unique 6-character access code (e.g. `ARU-1024`, `ARU-ADMIN`).
   - 1-click code copy & instant code regeneration for security.

3. **Role & Team Roster Management**:
   - Fix roles for teammates (e.g., *Senior Full Stack Engineer*, *Lead UI/UX Designer*, *Backend Systems Engineer*, *QA Lead*).
   - Assign members to specific teams.

4. **Task & Deadline Timing Management**:
   - Assign work items to teammates or teams with role context.
   - Set exact completion deadlines (Date & Time picker).
   - Dynamic deadline urgency badges (*Overdue*, *Due in X hours*, *Completed*).
   - Estimated completion timing (in hours).

5. **Interactive Workspaces**:
   - **Teams & Leaders View**: Manage teams, assign team leaders, view team completion rates.
   - **All Tasks Board**: Filter by status, priority (*Urgent*, *High*, *Medium*, *Low*), team, assignee, or keyword search.
   - **My Tasks View**: Dedicated workspace for logged-in teammates.
   - **Analytics & Capacity Dashboard**: Real-time metrics on team workload, completion rates, and overdue alerts.
   - **Task Discussion & Work Notes**: Live commenting and work updates.

---

## 🔑 Quick Demo Access Codes & Teams

| Teammate | Assigned Team | Team Leader? | Unique Access Code | Role Level |
|---|---|---|---|---|
| **Ganesh (Aruvixa Lead)** | Product Management | — | `ARU-ADMIN` | **Admin / Manager** |
| **Sethu** | Frontend & Mobile Engineering | 👑 **Team Leader** | `ARU-1024` | Teammate |
| **Priya Sharma** | UI/UX Design Studio | 👑 **Team Leader** | `ARU-2048` | Teammate |
| **Rahul Verma** | Backend Systems & Infra | 👑 **Team Leader** | `ARU-4096` | Teammate |
| **Ananya Roy** | QA & Automation Guild | 👑 **Team Leader** | `ARU-8192` | Teammate |

---

## 🛠️ How to Run

### Single Command Startup (Production Mode):
```bash
npm start
```
*Access the portal at:* **`http://localhost:5000`**

### Development Mode (with Live Reload):
```bash
npm run dev
```
*Frontend runs at `http://localhost:3000` and proxies API calls to `http://localhost:5000`.*
