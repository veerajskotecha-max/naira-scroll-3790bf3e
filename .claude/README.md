# Claude Code config

## claude-mem

`settings.json` registers the [`thedotmack`](https://github.com/thedotmack/claude-mem)
marketplace and enables the `claude-mem` plugin (v13.13.1 at time of writing,
Apache-2.0). It gives Claude Code persistent memory across sessions: it captures
tool usage, compresses it into structured observations, and injects relevant
context back at the start of later sessions.

When you next open this repo in Claude Code you'll be prompted to trust the
folder and install the plugin. It is not vendored into this repo — it is cloned
into `~/.claude/plugins/` per machine.

### What it actually installs

More than a memory search skill, so it's worth knowing up front:

- **19 skills** — `mem-search` (query past sessions) plus `babysit`, `cloud-sync`,
  `design-is`, `do`, `how-it-works`, `knowledge-agent`, `learn-codebase`,
  `make-plan`, `mode-creator`, `oh-my-issues`, `pathfinder`, `smart-explore`,
  `standup`, `timeline-report`, `version-bump`, `weekly-digests`, `what-the`,
  `wowerpoint`
- **6 hooks** — `Setup`, `SessionStart`, `UserPromptSubmit`, `PostToolUse`,
  `PreToolUse`, `Stop`
- **1 MCP server** — `mcp-search`, exposing `search`, `timeline`, and
  `get_observations`

There is no `/mem` slash command. Invoke the skills by name, e.g. ask Claude to
"use mem-search to find how we handled X", or run `/claude-mem:mem-search`.

Cost: roughly **1,776 tokens added to every session** for the always-on skill
descriptions, before any skill fires. Check current numbers with
`claude plugin details claude-mem`.

### Requirements

Node >= 20.12.0 and Bun >= 1.0.0. The plugin auto-installs Bun and `uv` (for
vector search) if missing, and runs a local background HTTP worker backed by
SQLite. Memory is stored locally under `~/.claude-mem/`; cloud sync to cmem.ai
is optional and off by default.

### Heads up

The hooks run on every session for anyone who opens this repo in Claude Code,
including `PreToolUse`/`PostToolUse`, which observe tool activity. The
marketplace tracks the default branch rather than a pinned tag, so plugin
updates arrive automatically. Pin it by adding `"ref": "<tag>"` alongside `repo`
in `settings.json` if you'd rather control that.

### Opting out

Per machine, without touching this file:

```sh
claude plugin disable claude-mem@thedotmack
```

To remove it for everyone, delete `.claude/settings.json`.
