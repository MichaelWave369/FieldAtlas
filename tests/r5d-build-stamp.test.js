import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBuildStamp, RELEASE_STAMP_SCHEMA } from '../scripts/release-stamp.mjs';
import { inspectBuildIdentity } from '../scripts/live-site-audit.mjs';

const valid='0123456789abcdef0123456789abcdef01234567';

test('build stamps include only commit identity and no visitor data',()=>{
  assert.deepEqual(makeBuildStamp(valid,'2026-10-21T00:00:00Z'),{
    schema:RELEASE_STAMP_SCHEMA,commit:valid,builtAt:'2026-10-21T00:00:00Z',
    releaseStatus:'NOT_MANUALLY_APPROVED',
  });
  assert.equal(makeBuildStamp(undefined).commit,'LOCAL_BUILD');
});

test('live audit only certifies the exact merged source commit',()=>{
  const stamp=makeBuildStamp(valid);
  assert.equal(inspectBuildIdentity(stamp,valid).pass,true);
  assert.equal(inspectBuildIdentity(stamp,valid.toUpperCase()).pass,true);
  assert.equal(inspectBuildIdentity(stamp,'ffffffffffffffffffffffffffffffffffffffff').pass,false);
  assert.equal(inspectBuildIdentity(makeBuildStamp(null),valid).pass,false);
  assert.equal(inspectBuildIdentity({},valid).pass,false);
  assert.equal(inspectBuildIdentity(stamp,null).pass,false);
});
