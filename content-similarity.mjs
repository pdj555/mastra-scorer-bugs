// Content similarity scorer: `ignoreWhitespace: false` does not make whitespace count.
import { createContentSimilarityScorer } from '@mastra/evals/scorers/prebuilt';
import { createAgentTestRun, createTestMessage } from '@mastra/evals/scorers/utils';

const pairs = [
  ['New York', 'NewYork'],
  ['a b c d', 'abcd'],
];

for (const ignoreWhitespace of [true, false]) {
  const scorer = createContentSimilarityScorer({ ignoreCase: true, ignoreWhitespace });
  for (const [input, output] of pairs) {
    const result = await scorer.run(
      createAgentTestRun({
        inputMessages: [createTestMessage({ role: 'user', content: input, id: 'q' })],
        output: [createTestMessage({ role: 'assistant', content: output, id: 'a' })],
      }),
    );
    console.log(`ignoreWhitespace=${String(ignoreWhitespace).padEnd(5)} ${JSON.stringify(input).padEnd(10)} vs ${JSON.stringify(output).padEnd(9)} score=${result.score.toFixed(2)}`);
  }
}
