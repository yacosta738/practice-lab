---
title: "Tokens"
tags:
  - concept
  - token
---

### Tokens: the unit of input, output, and cost

Claude does not read characters or words directly. It reads **tokens**, and the characters-per-token
average depends on the tokenizer of the model at hand and differs between model generations. Treat
any chars-per-token rule of thumb as model-dependent and confirm current tokenizer behavior at build
time. Everything the model processes is counted in tokens: your prompt, the conversation history,
tool definitions, tool results, and the response the model generates. Tokens are the unit of both
pricing and budget, so when you estimate what a feature costs or whether an input fits, you are
counting tokens, not words. A useful habit is to think in tokens, since that is the unit the API
bills in and the context window measures.