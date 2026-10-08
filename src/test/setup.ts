import '@testing-library/jest-dom';

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
process.env.MONGODB_DB = process.env.MONGODB_DB || 'bughunt_test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test_session_secret_for_vitest';
process.env.MONGODB_TIMEOUT_MS = '1000';
