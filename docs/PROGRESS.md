# Bug Hunt Arena — Progress Tracker

## Status Summary
- **Current Phase**: All Backend APIs Connected in Localhost
- **Date**: October 8, 2026

## Hard Rules Compliance Audit
- [x] **1. Security**: Secrets live in environment variables (`.env`), `.env.example` kept up to date, `.env` ignored. JUDGE0_API_KEY never bundled into client application code or build outputs.
- [x] **2. Puzzle Validation**: 8-point validator (`src/engine/validator.ts`) verifies schema, test pass/fail, determinism, line diff ($\le 3$), bugLine inclusion, hint safety, and explanation completeness.
- [x] **3. Sandboxed Execution**: JavaScript (`jsRunner.ts`) and Python (`pythonRunner.ts`) run inside Web Workers with 3-second timeout protection. Java, C, and C++ run sandboxed via Judge0 with network disabled, 2.0s CPU limit, 10 max processes/threads, and 128 MB memory limit.
- [x] **4. Answer Visibility**: Solutions, explanations, unrevealed hints, and server-side test cases/expected outputs stay strictly hidden on server.
- [x] **5. Code Structure**: All files strictly under 300 lines, 1 component per file, fully typed props.
- [x] **6. Test Suite**: Vitest test suite passing cleanly across all 19 test files (`npm test` — 110/110 passing).
- [x] **7. Dependency Tracking**: No unnecessary dependencies added; modular Vite Connect middleware for dev routing.
- [x] **8. Accessible UI**: Plain language sentence case, visible focus indicators (`focus-visible:ring-2`), keyboard navigable modals and buttons, color-independent indicators, full Lighthouse $\ge 90$ compliance.
- [x] **9. Documentation**: `docs/PROGRESS.md`, `docs/DESIGN.md`, and walkthroughs maintained and updated.
- [x] **10. Central Model ID**: Single source of truth constant `GENERATOR_MODEL_ID = 'gemini-3.6-flash'` in `src/config/models.ts`.

## Recent Changes & Accomplishments
- **API Dev Server Dispatcher ([`api/lib/devMiddleware.ts`](file:///E:/prompt_wars/api/lib/devMiddleware.ts), [`vite.config.ts`](file:///E:/prompt_wars/vite.config.ts))**:
  - Implemented Vite Connect middleware intercepting all `/api/*` HTTP requests in local development.
  - Resolves both static and dynamic parameterized routes (`/api/puzzles/:id/hint`, `/giveup`, `/solve`).
  - Directly executes serverless functions on `http://localhost:5173` without extra proxy ports.
- **Environment & Database Configuration ([`.env`](file:///E:/prompt_wars/.env))**:
  - Configured local environment variables connecting to MongoDB service at `mongodb://localhost:27017`.
  - Configured secure local JWT session secret.
- **Client & Endpoint Harmonization**:
  - Updated [`src/storage/puzzleSource.ts`](file:///E:/prompt_wars/src/storage/puzzleSource.ts) to unwrap daily puzzle response payloads.
  - Verified live account creation (`/api/auth/signup`) and authentication (`/api/auth/login`) with persistent MongoDB documents.
- **Unit & Integration Tests ([`src/test/apiConnection.test.ts`](file:///E:/prompt_wars/src/test/apiConnection.test.ts))**:
  - 12 new automated integration tests covering all 11 endpoints, request dispatching, authentication cookies, sensitive data masking, and error handling.

## Verification
- Unit test suite (`npm test`): **110/110 tests passed** across all 19 test files.
- Production build (`npm run build`): Clean compilation (`tsc && vite build`) with 0 errors.
- Live HTTP verification: Verified signup, login, session 401, daily puzzle retrieval, and rate-limited execution checks.
