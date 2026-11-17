<!-- agentsync:agent-config-layout:start -->

## Agent config layout

`.agents/` is the canonical source for shared instructions, skills, and commands in this project.

- Instructions: `.agents/AGENTS.md` is the canonical instructions file, and these `symlink` targets
  reflect it directly in `CLAUDE.md`, `.github/copilot-instructions.md`, `GEMINI.md`, `AGENTS.md`,
  `AGENTS.md`.

- Skills: `.agents/skills/` is the canonical skills directory.
    - `.claude/skills` reflects `.agents/skills/` directly because this target uses `symlink`.
    - `.codex/skills` reflects `.agents/skills/` directly because this target uses `symlink`.
    - `.gemini/skills` reflects `.agents/skills/` directly because this target uses `symlink`.
    - `.opencode/skills` reflects `.agents/skills/` directly because this target uses `symlink`.

- Commands: `.agents/commands/` is the canonical commands directory, `agentsync apply` populates
  command entries into `.claude/commands`, `.gemini/commands`, `.opencode/command`,
  `.zcode/commands`, and `agentsync status` validates those destinations as managed container
  directories rather than requiring the destination path itself to be a symlink.

<!-- agentsync:agent-config-layout:end -->

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
