import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionSecurity } from './security.js';

const realProductionConfig = {
  NODE_ENV: 'production' as const,
  JWT_SECRET: 'a'.repeat(64),
  DATABASE_URL: 'postgresql://prod:real@db.relationshiptracker.test/app',
  CORS_ORIGINS: 'https://app.relationshiptracker.test',
  PUBLIC_WEB_ORIGIN: 'https://app.relationshiptracker.test',
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
  }), /production_cors_wildcard_forbidden/);
});

test('production requires https public origin', () => {
  assert.throws(() => assertProductionSecurity({
    ...realProductionConfig,
    PUBLIC_WEB_ORIGIN: 'http://app.relationshiptracker.test',
  }), /production_public_web_origin_must_use_https/);
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
