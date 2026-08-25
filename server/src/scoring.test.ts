import assert from 'node:assert/strict';
import test from 'node:test';
import { relationshipScore } from './scoring.js';

const now = Date.now();
const ratings = [
  ...[4,5,4].map((score,i)=>({raterId:'a',score,createdAt:new Date(now-i*1000).toISOString()})),
  ...[4,4,5].map((score,i)=>({raterId:'b',score,createdAt:new Date(now-i*1000).toISOString()})),
];

test('requires balanced feedback from both partners',()=>{
  const result=relationshipScore(ratings,['a','b'],now);
  assert.equal(result.confidence,'balanced');
  assert.equal(result.score,4.33);
});

test('rejects insufficient feedback',()=>{
  const result=relationshipScore(ratings.slice(0,3),['a','b'],now);
  assert.equal(result.score,null);
  assert.equal(result.confidence,'insufficient_feedback');
});

test('penalizes extreme disagreement without deleting feedback',()=>{
  const extreme=[...[5,5,5].map((score,i)=>({raterId:'a',score,createdAt:new Date(now-i*1000).toISOString()})),...[1,1,1].map((score,i)=>({raterId:'b',score,createdAt:new Date(now-i*1000).toISOString()}))];
  const result=relationshipScore(extreme,['a','b'],now);
  assert.equal(result.confidence,'balanced');
  assert.equal(result.score,2.25);
});
