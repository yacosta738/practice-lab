---
title: "Exam Glossary"
type: moc
certification: CCDV-F
status: verified
source_kind: study-synthesis
updated: '2026-11-15'
tags:
- certification/ccdv-f
- type/glossary
---

> Concise active-recall glossary. Prefer opening the linked atomic note instead of memorizing a
> slogan.

| Term                 | Distinction / linked note                                                                                                                     |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Agent                | Model decides intermediate steps inside a bounded harness: [Agent Loop and Termination](../agent-loop-and-termination/)                       |
| Workflow             | Application controls predetermined orchestration: [Workflows versus Agents](../workflows-versus-agents/)                                      |
| Orchestrator–workers | Dynamic decomposition and synthesis: [Orchestrator Worker and Parallelization](../orchestrator-worker-and-parallelization/)                   |
| Subagent             | Specialist context and limited tools: [Subagents and Context Isolation](../subagents-and-context-isolation/)                                  |
| Context window       | Finite working budget: [Tokens Context Window and Sampling](../tokens-context-window-and-sampling/)                                           |
| Tool use             | Client executes tool_use and returns matching tool_result: [Tool Schema and Tool Result Lifecycle](../tool-schema-and-tool-result-lifecycle/) |
| SSE                  | Stream events with typed deltas, not a single final JSON: [Streaming SSE and Recovery](../streaming-sse-and-recovery/)                        |
| Batch API            | Asynchronous request group for latency-tolerant tasks: [Batch Processing and High-Volume Work](../batch-processing-and-high-volume-work/)     |
| Async SDK            | Concurrent nonblocking calls, distinct from batch: [SDK versus REST and Async Client](../sdk-versus-rest-and-async-client/)                   |
| Prompt cache         | Reusable prefix billing optimization: [Prompt Caching Economics](../prompt-caching-economics/)                                                |
| Thinking effort      | Model-specific depth controls: [Model Routing and Thinking Effort](../model-routing-and-thinking-effort/)                                     |
| Strict JSON          | Shape conformity, not business-truth guarantee: [Structured Output and Defensive Parsing](../structured-output-and-defensive-parsing/)        |
| Eval                 | Measured acceptance criterion over representative cases: [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/)   |
| LLM-as-judge         | Rubric scorer calibrated against human labels: [Evaluation Criteria and Grader Design](../evaluation-criteria-and-grader-design/)             |
| Regression gate      | Release constraint on critical failures: [Regression Testing and Release Gates](../regression-testing-and-release-gates/)                     |
| Prompt injection     | Data pretending to be higher-trust instructions: [Prompt Injection and Data Trust Boundaries](../prompt-injection-and-data-trust-boundaries/) |
| Human-in-the-loop    | Approval tied to exact action before side effect: [Human Approval for Irreversible Actions](../human-approval-for-irreversible-actions/)      |
| Least privilege      | Capabilities restricted by caller and task: [Security Boundaries and Least Privilege](../security-boundaries-and-least-privilege/)            |
| MCP tool             | Model-callable exposed operation: [MCP Architecture Tools Resources and Prompts](../mcp-architecture-tools-resources-and-prompts/)            |
| MCP resource         | Server-provided context/data: [MCP Architecture Tools Resources and Prompts](../mcp-architecture-tools-resources-and-prompts/)                |
| MCP prompt           | Reusable prompting template: [MCP Architecture Tools Resources and Prompts](../mcp-architecture-tools-resources-and-prompts/)                 |
| stdio                | Local JSON-RPC over stdin/stdout: [MCP Transport and Authorization](../mcp-transport-and-authorization/)                                      |
| Streamable HTTP      | Remote MCP transport: [MCP Transport and Authorization](../mcp-transport-and-authorization/)                                                  |
| Skill                | Reusable instruction/procedure package: [Skills vs Tools vs MCP vs Subagents](../skills-vs-tools-vs-mcp-vs-subagents/)                        |
| CLAUDE.md            | Durable project instruction context: [Claude Code Settings and Memory Hierarchy](../claude-code-settings-and-memory-hierarchy/)               |
| PreToolUse           | Opportunity to block before execution: [PreToolUse Hooks and Deterministic Controls](../pretooluse-hooks-and-deterministic-controls/)         |
| Provenance           | Traceable authoritative source vs synthesis: [Source Register](../source-register/)                                                           |
