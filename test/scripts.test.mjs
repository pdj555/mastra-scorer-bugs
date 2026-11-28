// Entry-point contract tests: each reproduction script runs standalone
// with `node <script>` (the package.json scripts) and prints exactly the
// table the README documents for it. Run with: node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const run = promisify(execFile);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

async function scriptOutput(script) {
  const { stdout } = await run(process.execPath, [path.join(root, script)], { cwd: root });
  return stdout.trim().split('\n');
}

test('tone.mjs prints the three documented lines', async () => {
  const lines = await scriptOutput('tone.mjs');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /^ends with a period\s+score=0\.35\s+sentimentVariance=0\.65$/);
  assert.match(lines[1], /^same text, no final period\s+score=0\.96\s+sentimentVariance=0\.04$/);
  assert.match(lines[2], /^two lines, no punctuation\s+score=1\.00\s+sentimentVariance=0\.00$/);
});

test('textual-difference.mjs prints the four documented lines', async () => {
  const lines = await scriptOutput('textual-difference.mjs');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /"dog bites man"\s+-> "man bites dog"\s+score=0\.54\s+changes=0$/);
  assert.match(lines[1], /"refund approved not denied"\s+-> "refund denied not approved"\s+score=0\.62\s+changes=0$/);
  assert.match(lines[2], /"alpha beta gamma delta"\s+-> "delta gamma beta alpha"\s+score=0\.59\s+changes=0$/);
  assert.match(lines[3], /"a b c"\s+-> "a b d"\s+score=0\.80\s+changes=1$/);
});

test('content-similarity.mjs prints the four documented lines', async () => {
  const lines = await scriptOutput('content-similarity.mjs');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^ignoreWhitespace=true\s+"New York" vs "NewYork"\s+score=1\.00$/);
  assert.match(lines[1], /^ignoreWhitespace=true\s+"a b c d"\s+vs "abcd"\s+score=1\.00$/);
  assert.match(lines[2], /^ignoreWhitespace=false\s+"New York" vs "NewYork"\s+score=1\.00$/);
  assert.match(lines[3], /^ignoreWhitespace=false\s+"a b c d"\s+vs "abcd"\s+score=1\.00$/);
});
