# Reproductions for three bugs in `@mastra/evals` code scorers

Each script uses only the published packages (`@mastra/evals` 1.10.11, `@mastra/core` 1.85.0). No LLM calls, no API key. Tested on Node 22 and 24.

```bash
npm install
```

## 1. Tone scorer: the last sentence is not scored when it has no final punctuation

```bash
node tone.mjs
```

```text
ends with a period           score=0.35  sentimentVariance=0.65
same text, no final period   score=0.96  sentimentVariance=0.04
two lines, no punctuation    score=1.00  sentimentVariance=0.00
```

The first two lines are the same reply. Removing the final period removes the last sentence from the score.

Patch with tests: [`patches/1-tone-last-sentence.patch`](patches/1-tone-last-sentence.patch)

## 2. Textual difference scorer: `changes` is 0 for texts that differ in word order

```bash
node textual-difference.mjs
```

```text
"dog bites man"                -> "man bites dog"                score=0.54  changes=0
"refund approved not denied"   -> "refund denied not approved"   score=0.62  changes=0
"alpha beta gamma delta"       -> "delta gamma beta alpha"       score=0.59  changes=0
"a b c"                        -> "a b d"                        score=0.80  changes=1
```

Patch with a test: [`patches/2-textual-difference-word-order.patch`](patches/2-textual-difference-word-order.patch)

## 3. Content similarity scorer: `ignoreWhitespace: false` has no effect

```bash
node content-similarity.mjs
```

```text
ignoreWhitespace=true  "New York" vs "NewYork" score=1.00
ignoreWhitespace=true  "a b c d"  vs "abcd"    score=1.00
ignoreWhitespace=false "New York" vs "NewYork" score=1.00
ignoreWhitespace=false "a b c d"  vs "abcd"    score=1.00
```

Patch with a test: [`patches/3-content-similarity-ignore-whitespace.patch`](patches/3-content-similarity-ignore-whitespace.patch)

## Applying a patch

The patches are against `mastra-ai/mastra` at `0d6d030`.

```bash
git apply patches/1-tone-last-sentence.patch
```
