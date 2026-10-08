# Bug Hunt Arena

A full-stack diagnostic coding game where learners fix AI-generated buggy programs in a safe, sandboxed environment.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, CodeMirror 6
- **Backend**: Node.js HTTP server (`server.ts`) & API handlers in `/api`
- **Database**: MongoDB (Atlas or local `mongod`)
- **Execution Engine**: Browser Web Workers (Python via Pyodide, JavaScript via Blob Worker)
- **Deployment**: Render Web Service & Blueprint (`render.yaml`)
- **Testing**: Vitest, React Testing Library, JSDOM

---

## Hard Rules & Architecture
1. **Security**: Secrets live in `.env` (see `.env.example`). Never committed to client code.
2. **Puzzle Validation**: Every puzzle must pass the 8-point fairness validator in `src/engine/validator.ts`.
3. **Sandboxed Execution**: Code executes off the main thread in Web Workers with timeout protection.
4. **Answer Protection**: `correctCode`, `explanation`, and `hints` stay hidden on the server until unlocked or surrendered.
5. **Single Model Constant**: AI Generator model ID lives in `src/config/models.ts` (`gemini-3.6-flash`).

---

## Local Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables in `.env`:
   - `MONGODB_URI`: MongoDB connection string (e.g. Atlas or `mongodb://localhost:27017`).
   - `MONGODB_DB`: Database name (`bughunt_arena`).
   - `SESSION_SECRET`: Secret key used for signing session cookies.
   - `GEMINI_API_KEY`: Google Gemini API key (for on-demand dynamic generation).

3. Install dependencies:
   ```bash
   npm install
   ```

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

5. Run development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

---

## Deploying to Render

This repository is pre-configured for deployment as a **Render Web Service** with `render.yaml`.

### Option 1: Render Blueprint (Recommended)
1. Push your code to a GitHub repository.
2. Log in to [Render](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository. Render reads `render.yaml` automatically.
5. Fill in the required environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `GEMINI_API_KEY`: Your Gemini API key.
6. Click **Apply**. Render will build and deploy the service.

### Option 2: Manual Render Web Service
1. Click **New +** -> **Web Service** on Render.
2. Connect your GitHub repo.
3. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. In the **Environment Variables** tab, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `MONGODB_DB`: `bughunt_arena`
   - `SESSION_SECRET`: A secure random string
   - `GEMINI_API_KEY`: Your Google AI Gemini key
   - `GENERATION_USER_DAILY_CAP`: `20`
   - `GENERATION_GLOBAL_DAILY_CAP`: `100`
   - `GENERATION_IP_RATE_LIMIT`: `5`
5. Click **Deploy Web Service**.

---

## Pushing to GitHub

To push this repository to GitHub for the first time:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files (respects .gitignore)
git add .

# 3. Create your initial commit
git commit -m "feat: complete bug-hunt-arena with Render deployment configuration"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---

## Testing & Quality Assurance

- **Run all tests**:
  ```bash
  npm test
  ```
- **Type check & build for production**:
  ```bash
  npm run build
  ```
- **Run production server locally**:
  ```bash
  npm start
  ```
