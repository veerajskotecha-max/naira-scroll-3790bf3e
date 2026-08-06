# Claude Code config

- `settings.json` — plugin marketplaces and enabled plugins (installed per machine
  from git, not vendored here).
- `skills/` — skills vendored directly into this repo.

## Plugins

`settings.json` registers four plugin marketplaces and enables six plugins.
When you next open this repo in Claude Code you'll be prompted to trust the
folder and install them. Nothing is vendored into this repo — each plugin is
cloned into `~/.claude/plugins/` per machine.

| Plugin | Marketplace | Source | Always-on cost |
| --- | --- | --- | --- |
| `claude-mem` | `thedotmack` | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | ~1,776 tok |
| `ponytail` | `ponytail` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | ~983 tok |
| `document-skills` | `anthropic-agent-skills` | [anthropics/skills](https://github.com/anthropics/skills) | ~1,028 tok |
| `example-skills` | `anthropic-agent-skills` | [anthropics/skills](https://github.com/anthropics/skills) | ~1,221 tok |
| `claude-api` | `anthropic-agent-skills` | [anthropics/skills](https://github.com/anthropics/skills) | ~471 tok |
| `obsidian-skills` | `obsidian-skills` | [qhuang20/obsidian-skills](https://github.com/qhuang20/obsidian-skills) | ~98 tok |

**Total: ~5,577 tokens added to every session** before any skill fires. Re-check
with `claude plugin details <name>`.

## claude-mem

Persistent memory across sessions: captures tool usage, compresses it into
structured observations, and injects relevant context back into later sessions.
Apache-2.0, v13.13.1 at time of writing.

There is no `/mem` slash command. Invoke the skills by name — ask Claude to "use
mem-search to find how we handled X", or run `/claude-mem:mem-search`.

It is broader than a memory skill: **19 skills** (`mem-search`, `babysit`,
`cloud-sync`, `design-is`, `do`, `how-it-works`, `knowledge-agent`,
`learn-codebase`, `make-plan`, `mode-creator`, `oh-my-issues`, `pathfinder`,
`smart-explore`, `standup`, `timeline-report`, `version-bump`, `weekly-digests`,
`what-the`, `wowerpoint`), **6 hooks** (`Setup`, `SessionStart`,
`UserPromptSubmit`, `PostToolUse`, `PreToolUse`, `Stop`), and **1 MCP server**
(`mcp-search`, exposing `search`, `timeline`, `get_observations`).

Needs Node >= 20.12.0 and Bun >= 1.0.0. Auto-installs Bun and `uv` if missing,
and runs a local background HTTP worker backed by SQLite. Memory is stored
locally under `~/.claude-mem/`; cloud sync to cmem.ai is optional and off by
default.

## ponytail

Pushes the agent toward the smallest change that solves the problem — YAGNI,
stdlib first, one line over fifty — to cut *output* tokens and the code you
inherit. Ships a `SessionStart` hook that injects its ruleset automatically, and
a skill you can invoke on demand at `lite`, `full`, or `ultra` intensity.

Note the tradeoff: it costs ~983 always-on tokens to save output tokens, so it
pays off on generative work and is roughly a wash on short sessions. Published
benchmarks vary widely (median ~-10% cost in one paired study, much larger
savings where the agent would otherwise over-build).

## anthropic-agent-skills

Anthropic's official open-source skills, split across three plugins:

- **document-skills** — `xlsx`, `docx`, `pptx`, `pdf`
- **example-skills** — `algorithmic-art`, `brand-guidelines`, `canvas-design`,
  `doc-coauthoring`, `frontend-design`, `internal-comms`, `mcp-builder`,
  `skill-creator`, `slack-gif-creator`, `theme-factory`, `web-artifacts-builder`,
  `webapp-testing`
- **claude-api** — Claude API / SDK reference

> **Overlap warning.** If your Claude account already has the `xlsx`, `docx`,
> `pptx`, `pdf`, `claude-api`, or `skill-creator` skills enabled, then
> `document-skills` and `claude-api` are entirely redundant — about 1,499
> wasted always-on tokens, plus ambiguity about which copy fires. Trim with:
>
> ```sh
> claude plugin disable document-skills@anthropic-agent-skills
> claude plugin disable claude-api@anthropic-agent-skills
> ```
>
> `example-skills` is worth keeping either way — 11 of its 12 skills are not
> duplicated.

## obsidian-skills

Loads a note-taking working style when a session starts inside an Obsidian
vault. It is a no-op for this repo, which is not a vault — it's enabled here
only so it travels with your setup. Move it to your user-level
`~/.claude/settings.json` if you'd rather it not ship to teammates.

## Vendored skills

### website-builder-setup

`skills/website-builder-setup/SKILL.md`, copied verbatim from
[tenfoldmarc/website-builder-setup](https://github.com/tenfoldmarc/website-builder-setup)
(~292 stars, 5 commits, **no LICENSE file** — vendored on the author's own
documented install path, which is to copy it into your Claude config).

It is not a component library. It's a **setup wizard**: invoking
`/website-builder-setup` walks you through four steps. Read this before running
it here, because three of the four are questionable for *this* repo:

| Step | What it does | Status for this repo |
| --- | --- | --- |
| 1 | Checks `node --version` | Fine |
| 2 | `npm install -g uipro-cli && uipro init --ai claude` | **Redundant** — the `ui-ux-pro-max` skill is already enabled on this account |
| 3 | `npm install framer-motion` | **Conflicts** — this project already animates with `gsap@^3.15.0` + `@gsap/react@^2.1.2` and `tailwindcss-animate`. This adds a second, competing animation library |
| 4 | Asks for a 21st.dev API key, writes it into `~/.claude.json` under `mcpServers` | Needs a free key from <https://21st.dev/magic/console>; note it stores the key in plaintext in your global config |

The skill is installed and available — it has **not** been run. If you do want
the 21st.dev component library, step 4 is the only part that adds something this
repo doesn't already have, and you can do it without the wizard.

## Heads up

- claude-mem's and ponytail's hooks run on every session for anyone who opens
  this repo in Claude Code. claude-mem's `PreToolUse`/`PostToolUse` hooks
  observe tool activity.
- All four marketplaces track their default branch rather than a pinned tag, so
  updates arrive automatically. Pin one by adding `"ref": "<tag>"` next to
  `repo` in `settings.json`.

## Opting out

Per machine, without touching this file:

```sh
claude plugin disable <plugin>@<marketplace>
```

To remove everything for everyone, delete `.claude/settings.json`.
