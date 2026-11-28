// Characterization tests for the three reproductions in this repo.
//
// These tests pin the behavior the README documents for the published
// packages (@mastra/evals 1.10.11, @mastra/core 1.85.0): each scorer's
// current, buggy output on the reproduction inputs. When an upstream fix
// lands and a pinned value changes, the failing test is the signal to
// update the README table and close the corresponding bug report.
// Run with: node --test test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createToneScorer,
  createTextualDifferenceScorer,
  createContentSimilarityScorer,
} from '@mastra/evals/scorers/prebuilt';
import { createAgentTestRun, createTestMessage } from '@mastra/evals/scorers/utils';

const closeTo = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 0.011, `expected ${actual} to be within 0.011 of ${expected}`);

async function toneResult(content) {
  const scorer = createToneScorer();
  return scorer.run(
    createAgentTestRun({ output: [createTestMessage({ role: 'assistant', content, id: 'a' })] }),
  );
}

async function differenceResult(input, output) {
  const scorer = createTextualDifferenceScorer();
  return scorer.run(
    createAgentTestRun({
      inputMessages: [createTestMessage({ role: 'user', content: input, id: 'q' })],
      output: [createTestMessage({ role: 'assistant', content: output, id: 'a' })],
    }),
  );
}

async function similarityResult(input, output, options) {
  const scorer = createContentSimilarityScorer(options);
  return scorer.run(
    createAgentTestRun({
      inputMessages: [createTestMessage({ role: 'user', content: input, id: 'q' })],
      output: [createTestMessage({ role: 'assistant', content: output, id: 'a' })],
    }),
  );
}

const REPLY = 'Thank you for reaching out. I am happy to help. This is terrible garbage and I hate it';

test('tone: a reply ending with a period scores the negative last sentence', async () => {
  const result = await toneResult(`${REPLY}.`);
  closeTo(result.score, 0.35);
  closeTo(result.preprocessStepResult.sentimentVariance, 0.65);
});

test('tone: dropping the final period removes the last sentence from the score', async () => {
  const withPeriod = await toneResult(`${REPLY}.`);
  const withoutPeriod = await toneResult(REPLY);
  closeTo(withoutPeriod.score, 0.96);
  closeTo(withoutPeriod.preprocessStepResult.sentimentVariance, 0.04);
  assert.ok(
    withoutPeriod.score - withPeriod.score > 0.5,
    'the same reply must score far higher once its last sentence is dropped',
  );
});

test('tone: unpunctuated lines are scored as a single stable tone', async () => {
  const result = await toneResult('I love this\nI hate this awful garbage');
  closeTo(result.score, 1.0);
  closeTo(result.preprocessStepResult.sentimentVariance, 0.0);
});

test('textual difference: word-order-only changes report 0 changes', async () => {
  const cases = [
    ['dog bites man', 'man bites dog', 0.54],
    ['refund approved not denied', 'refund denied not approved', 0.62],
    ['alpha beta gamma delta', 'delta gamma beta alpha', 0.59],
  ];
  for (const [input, output, expectedScore] of cases) {
    const result = await differenceResult(input, output);
    assert.equal(result.preprocessStepResult.changes, 0, `${input} -> ${output}`);
    closeTo(result.score, expectedScore);
    assert.ok(result.score < 1, 'score must still reflect that the texts differ');
  }
});

test('textual difference: a substituted word reports 1 change', async () => {
  const result = await differenceResult('a b c', 'a b d');
  assert.equal(result.preprocessStepResult.changes, 1);
  closeTo(result.score, 0.8);
});

test('textual difference: identical texts report 0 changes and a perfect score', async () => {
  const result = await differenceResult('same words here', 'same words here');
  assert.equal(result.preprocessStepResult.changes, 0);
  assert.equal(result.score, 1);
});

test('content similarity: ignoreWhitespace false still ignores whitespace', async () => {
  for (const ignoreWhitespace of [true, false]) {
    for (const [input, output] of [['New York', 'NewYork'], ['a b c d', 'abcd']]) {
      const result = await similarityResult(input, output, { ignoreCase: true, ignoreWhitespace });
      assert.equal(result.score, 1, `ignoreWhitespace=${ignoreWhitespace} ${input} vs ${output}`);
    }
  }
});

test('content similarity: identical texts score 1 and unrelated texts score 0', async () => {
  const options = { ignoreCase: true, ignoreWhitespace: false };
  assert.equal((await similarityResult('hello world', 'hello world', options)).score, 1);
  assert.equal((await similarityResult('aaaaaaaa', 'zzzzzzzz', options)).score, 0);
});

test('content similarity: ignoreCase still folds case when whitespace counts', async () => {
  const result = await similarityResult('New York', 'new york', { ignoreCase: true, ignoreWhitespace: false });
  assert.equal(result.score, 1);
});
