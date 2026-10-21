import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const RELEASE_STAMP_SCHEMA = 'field-atlas-deployed-build-v1';
export const COMMIT_PATTERN = /^[0-9a-f]{40}$/i;

/**
 * A build stamp identifies a deployed artifact, NOT release approval.
 * It contains no visitor data or credentials.
 */
export function makeBuildStamp(sha, builtAt = new Date().toISOString()) {
  return {
    schema: RELEASE_STAMP_SCHEMA,
    commit: COMMIT_PATTERN.test(sha || '') ? sha.toLowerCase() : 'LOCAL_BUILD',
    builtAt,
    releaseStatus: 'NOT_MANUALLY_APPROVED',
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const stamp=makeBuildStamp(process.env.GITHUB_SHA);
  const path=resolve(process.argv[2] || 'dist/release-info.json');
  writeFileSync(path, JSON.stringify(stamp,null,2)+'\n');
  process.stdout.write('Wrote static build identity '+stamp.commit+'\n');
}
