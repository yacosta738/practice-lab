---
title: "Context Window"
tags:
  - concept
---

The **context window** is the total number of tokens the model can take in for a single request. It
holds everything at once: the system prompt, the full conversation so far, any documents you inject,
every tool result, and the model output. It is a fixed budget with two distinct edge behaviors. A
request whose input is already larger than the window is rejected with a validation error before
generation begins. A request that fits on input can still reach the ceiling during generation.
Current models then stop and return the output generated so far with a model_context_window_exceeded
stop reason rather than raising an error. Either way, keeping a long session running requires the
application to trim or summarize history before each call. In development, the window rarely fills
because test inputs are short. In production, on the other hand, longer inputs and more turns fill
the window faster. This is the failure Module 2 explores in detail.