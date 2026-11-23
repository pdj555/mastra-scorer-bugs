// Textual difference scorer: `changes` is 0 for texts that differ only in word order.
import { createTextualDifferenceScorer } from '@mastra/evals/scorers/prebuilt';
import { createAgentTestRun, createTestMessage } from '@mastra/evals/scorers/utils';

const scorer = createTextualDifferenceScorer();

const cases = [
  ['dog bites man', 'man bites dog'],
  ['refund approved not denied', 'refund denied not approved'],
  ['alpha beta gamma delta', 'delta gamma beta alpha'],
  ['a b c', 'a b d'],
];

for (const [input, output] of cases) {
  const result = await scorer.run(
    createAgentTestRun({
      inputMessages: [createTestMessage({ role: 'user', content: input, id: 'q' })],
      output: [createTestMessage({ role: 'assistant', content: output, id: 'a' })],
    }),
  );
  console.log(`${JSON.stringify(input).padEnd(30)} -> ${JSON.stringify(output).padEnd(30)} score=${result.score.toFixed(2)}  changes=${result.preprocessStepResult.changes}`);
}
