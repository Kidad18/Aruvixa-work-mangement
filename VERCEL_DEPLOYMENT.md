# Deploying Aruvixa Company Portal to Vercel 🚀

The project is pre-configured with `vercel.json` and a serverless API function entry point (`api/index.js`) for seamless 1-click deployment on **Vercel**.

---

## 🛠️ Method 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Aruvixa Company Portal ready for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/aruvixa-company-portal.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in.
   - Click **"Add New..."** → **"Project"**.
   - Select your GitHub repository (`aruvixa-company-portal`).
   - Click **Deploy**.

*Vercel will automatically build your frontend and launch your API endpoints!*

---

## ⚡ Method 2: Deploy via Vercel CLI (Command Line)

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy directly from your project terminal:
   ```bash
   vercel
   ```

3. When prompted, press `Enter` to accept all default settings.

4. For production deployment:
   ```bash
   vercel --prod
   ```

---

## 🔑 Demo Access Codes on Vercel

| Teammate | Assigned Team | Unique Access Code | Access Level |
|---|---|---|---|
| **Ganesh (Aruvixa Lead)** | Product Management | `ARU-ADMIN` | **Admin / Manager** |
| **Sethu** | Frontend & Mobile Engineering | `ARU-1024` | Teammate / Leader |
| **Priya Sharma** | UI/UX Design Studio | `ARU-2048` | Teammate / Leader |
| **Rahul Verma** | Backend Systems & Infra | `ARU-4096` | Teammate / Leader |
| **Ananya Roy** | QA & Automation Guild | `ARU-8192` | Teammate / Leader |
