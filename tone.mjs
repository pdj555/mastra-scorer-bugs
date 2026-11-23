// Tone scorer, stability mode: text after the last ".", "!" or "?" is not scored.
import { createToneScorer } from '@mastra/evals/scorers/prebuilt';
import { createAgentTestRun, createTestMessage } from '@mastra/evals/scorers/utils';

const scorer = createToneScorer();
const reply = 'Thank you for reaching out. I am happy to help. This is terrible garbage and I hate it';

const cases = [
  ['ends with a period', `${reply}.`],
  ['same text, no final period', reply],
  ['two lines, no punctuation', 'I love this\nI hate this awful garbage'],
];

for (const [label, content] of cases) {
  const result = await scorer.run(
    createAgentTestRun({ output: [createTestMessage({ role: 'assistant', content, id: 'a' })] }),
  );
  const { sentimentVariance } = result.preprocessStepResult;
  console.log(`${label.padEnd(28)} score=${result.score.toFixed(2)}  sentimentVariance=${sentimentVariance.toFixed(2)}`);
}
