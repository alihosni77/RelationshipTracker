import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionSecurity } from './security.js';

const realProductionConfig = {
  NODE_ENV: 'production' as const,
  JWT_SECRET: 'a'.repeat(64),
  DATABASE_URL: 'postgresql://prod:real@db.example.com/app',
  CORS_ORIGINS: 'https://app.example.com',
  PUBLIC_WEB_ORIGIN: 'https://app.example.com',
};

test('production rejects placeholder secret', () => {
  assert.throws(() => assertProductionSecurity({
    ...realProductionConfig,
    JWT_SECRET: 'relationship_dev_only_change_me_123456789012345678901234',
  }), /placeholder/);
});

test('production rejects wildcard cors', () => {
  assert.throws(() => assertProductionSecurity({
    ...realProductionConfig,
    CORS_ORIGINS: '*',
  }), /cors_wildcard/);
});

test('production requires https public origin', () => {
  assert.throws(() => assertProductionSecurity({
    ...realProductionConfig,
    PUBLIC_WEB_ORIGIN: 'http://app.example.com',
  }), /https/);
});

test('development permits localhost http configuration', () => {
  assert.doesNotThrow(() => assertProductionSecurity({
    NODE_ENV: 'development',
    JWT_SECRET: 'development-change-me',
    DATABASE_URL: 'postgresql://relationship:relationship_dev_only@localhost/app',
    CORS_ORIGINS: 'http://localhost:8080',
    PUBLIC_WEB_ORIGIN: 'http://localhost:8080',
  }));
});
