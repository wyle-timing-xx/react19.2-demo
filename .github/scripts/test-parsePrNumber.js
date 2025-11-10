// Local test script for parsePrNumber() from ai-review.js
// Usage: node .github/scripts/test-parsePrNumber.js

function parsePrNumberFromEnv(env) {
  const ref = env.GITHUB_REF || "";
  const fromRefMatch = ref.match(/refs\/pull\/(\d+)\/?.*/);
  if (fromRefMatch && fromRefMatch[1]) return fromRefMatch[1];

  if (env.PR_NUMBER) return String(env.PR_NUMBER);
  return null;
}

const cases = [
  { name: 'standard PR ref', env: { GITHUB_REF: 'refs/pull/123/merge' } },
  { name: 'pr ref with head', env: { GITHUB_REF: 'refs/pull/456/head' } },
  { name: 'branch ref', env: { GITHUB_REF: 'refs/heads/main' } },
  { name: 'tag ref', env: { GITHUB_REF: 'refs/tags/v1.0.0' } },
  { name: 'trailing digits on branch', env: { GITHUB_REF: 'refs/heads/release-2025-11-10-789' } },
  { name: 'explicit PR_NUMBER', env: { PR_NUMBER: '321' } },
  { name: 'both ref and PR_NUMBER', env: { GITHUB_REF: 'refs/heads/main', PR_NUMBER: '999' } },
  { name: 'empty env', env: {} },
];

console.log('Testing parsePrNumber behavior:\n');
for (const c of cases) {
  const result = parsePrNumberFromEnv(c.env);
  console.log(`${c.name.padEnd(30)} -> ${result}`);
}

console.log('\nTo simulate locally, you can also set environment variables and run:');
console.log('GITHUB_REF=refs/pull/123/merge node .github/scripts/test-parsePrNumber.js');
