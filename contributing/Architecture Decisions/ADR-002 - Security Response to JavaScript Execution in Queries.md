---
publish: true
---

# ADR-002 - Security Response to JavaScript Execution in Queries

## Status

**ACCEPTED** - Decision made on 2026-04-20

Implementation completed on 2026-05-07 after discussion with the Obsidian team.

## Context

### The Reported Vulnerability

A security report (recorded 2026-04-20) described a Remote Code Execution (RCE) vulnerability
in the Tasks plugin, rated high severity (8.6). The report identified a path by which untrusted content could reach code execution:

1. `Expression.ts` uses `new Function()` to compile and execute arbitrary JavaScript strings.
2. `ExpandPlaceholders.ts` feeds the contents of `{{...}}` placeholders directly into that evaluator.
3. `TasksFile.property()` returns raw frontmatter values with no sanitisation.
4. Query parsing calls `expandPlaceholders()` iteratively.

The claimed exploit path was: attacker-controlled note frontmatter → `property()` → inserted into
query string → re-expanded as a placeholder → compiled and executed by `new Function()`.

The reporter also noted a simpler direct exploit requiring no placeholder expansion at all:

```js
filter by function require('child_process').execSync('calc') || true
```

The full report cited four source locations:

- [`src/Scripting/Expression.ts:23`](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/4ac2e5a4a0109cca46a12439def3ecece24211b4/src/Scripting/Expression.ts#L23)
- [`src/Scripting/ExpandPlaceholders.ts:68-70`](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/4ac2e5a4a0109cca46a12439def3ecece24211b4/src/Scripting/ExpandPlaceholders.ts#L68-L70)
- [`src/Query/Query.ts:200`](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/4ac2e5a4a0109cca46a12439def3ecece24211b4/src/Query/Query.ts#L200)
- [`src/Scripting/TasksFile.ts:230`](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/4ac2e5a4a0109cca46a12439def3ecece24211b4/src/Scripting/TasksFile.ts#:L230)

### The `filter|sort|group by function` Feature

The `filter by function`, `sort by function`, and `group by function` instructions are
intentional, documented features that allow users to write arbitrary JavaScript expressions
to filter, sort, and group their tasks. This is a deliberately powerful facility, with
hundreds of documented examples, and is in active use across a large user base.

Example legitimate uses include:

```js
filter by function task.due.moment?.isSameOrBefore(moment(), 'day') || false
filter by function task.file.property("sample_list_property")?.length > 0
filter by function task.tags.find( (tag) => tag.includes('/') ) && true || false
```

The `new Function()` call in `Expression.ts` executing this JavaScript is therefore working
as designed. A user typing `filter by function require('child_process').execSync('calc')`
into their own vault is intentionally running privileged JavaScript inside Obsidian, similar
in effect to running code in the developer console.

### The Placeholder Expansion Path

The iterative placeholder expansion is also legitimate and necessary. The plugin supports:

- `{{query.file.property('task_instruction')}}` — expanding a frontmatter property value into a query
- `{{preset.standard_options}}` — expanding a named preset from plugin settings
- Preset values that themselves contain placeholders (e.g. `{{query.file.folder}}`)
- Frontmatter values (e.g. `TQ_extra_instructions`) that contain multiple query lines, some of which contain `{{preset...}}` or similar placeholders

This means the attack path and the legitimate usage path are structurally identical from
the expander's perspective. Both involve content containing `{{...}}` that resolves through
multiple passes. Blocking re-expansion, or escaping `{{`/`}}` in resolved values, would
break legitimate user workflows.

Some placeholder expressions also use JavaScript-like syntax, for example, function calls
such as `{{query.file.property('task_instruction')}}`. These are safe when they resolve to
known placeholder behaviour, but the syntax means the implementation must distinguish
between documented placeholder forms and arbitrary JavaScript expressions.

### The Obsidian Trust Model

Obsidian plugins run with full access to the user's filesystem and the Node.js/Electron
environment. Obsidian itself is not sandboxed. This means:

- Even if `require('child_process')` were blocked, an attacker could use `app.vault.adapter.fs`
  to access the filesystem directly.
- Any plugin that evaluates user-supplied JavaScript has this same property.
- The vault trust model — where the vault owner is implicitly trusted — is an Obsidian-wide
  concern, not specific to the Tasks plugin.

The reporter cited a Git plugin as a potential vector for introducing malicious vault content.
This is a real concern, but it is a general Obsidian platform issue rather than a Tasks
plugin issue specifically.

An experienced Obsidian plugin developer consulted during this analysis noted:

> The risk is real and it stems from you allowing arbitrary code execution. However,
> Obsidian itself is not really sandboxed, so even with a banned `require()`, you can
> still access the entire file system via `app.vault.adapter.fs`.

## Options Considered

### 1. Do nothing / documentation only

Document clearly that `filter by function` executes JavaScript with full plugin privileges,
and that vault content from untrusted sources carries the same risks as running untrusted
code generally.

**Assessment:** Honest framing of the situation, but "doing nothing is not an option" given
a formal security report has been filed. Insufficient as a sole response.

### 2. Break the re-expansion loop

Only call `expandPlaceholders()` once per query, so injected `{{...}}` content from frontmatter
can never be re-evaluated.

**Assessment:** Rejected. Legitimate use cases (presets containing placeholders,
`TQ_extra_instructions` with `{{preset...}}` references) require iterative expansion.

### 3. Escape `{{`/`}}` in resolved placeholder values

After resolving any `{{query.file.property(...)}}` placeholder, escape the result before
reinserting it into the template.

**Assessment:** Rejected for the same reason as option 2. Legitimate frontmatter values
intentionally contain `{{...}}` that must be further expanded.

### 4. Override `require()` with a safe version

Pass a `safeRequire` function as a parameter to `new Function()`, blocking known dangerous
modules such as `child_process`.

```js
const fn = new Function('require', fnText);
fn(safeRequire);

function safeRequire(id) {
  if (id === 'child_process' || id === 'node:child_process') {
    throw new Error('child_process is banned');
  }
  return window.require(id);
}
```

**Assessment:** Rejected as security theatre. Closes only the specific reported Proof of Concept.
Does not block `app.vault.adapter.fs`, `fetch()`, DOM manipulation, or other Obsidian
API access. Would imply the issue is resolved when it is not, creating false confidence.

### 5. Opt-in plugin setting to enable JavaScript execution

Add a plugin setting, disabled by default, that gates JavaScript execution in Tasks queries.
This includes the `filter|sort|group by function` functionality and arbitrary JavaScript
expressions in placeholders.

Users who wish to use these features must explicitly enable the setting and acknowledge
the associated risk. This is consistent with how some other Obsidian plugins handle the same
situation, for example:

> "Enable JavaScript — Enable features that run user written JavaScript. This is
> potentially DANGEROUS, thus it's disabled by default."

When the feature is disabled and a query contains a `by function` instruction, or an
unsupported placeholder requiring JavaScript evaluation, the query would fail with a clear,
actionable error message directing the user to the setting.

**Assessment:** Selected. See rationale below.

### 6. Improve the core query language to reduce reliance on `by function`

Over time, add built-in query instructions that cover the most common `filter by function`
use cases, reducing the need for users to write JavaScript.

**Assessment:** Worthwhile as an independent product quality improvement, but not a security
mitigation. The `by function` escape hatch would remain in place and in use for years
regardless. Does not address the placeholder expansion path at all.

## Decision

Add a plugin setting — **disabled by default** — that gates JavaScript execution in Tasks
queries.

This setting applies to:

- `filter by function`
- `sort by function`
- `group by function`
- arbitrary JavaScript expressions in placeholders

When the setting is disabled (the default for new installs and existing installs after
the upgrade), any query containing JavaScript execution will fail with a clear error message
that names the setting and explains why it exists.

Documented placeholder forms that can be resolved without arbitrary JavaScript execution
may continue to work while the setting is disabled.

This is a consent and communication response, not a sandbox. Enabling the setting restores
arbitrary JavaScript execution with the privileges available to the Tasks plugin.

Additionally, raise the issue with the Obsidian team, as the underlying vault trust model
is a platform-level concern.

## Rationale

This is the only option that is both technically honest and communicates genuine intent to
users:

- It does not pretend to close a hole that remains open.
- It is consistent with community norms among Obsidian plugins.
- It places informed consent where it belongs — with the user who chooses to enable a
  powerful feature.
- It does not break any existing functionality silently; users receive a clear prompt to act.
- A clear, actionable error message will absorb the majority of support burden from the
  migration.

The breaking-change cost is real but one-time. Users who care enough to use `filter by
function` are engaged enough to find a settings toggle.

## Consequences

### Positive

- Existing users of JavaScript in Tasks queries are unaffected once they enable the setting.
- New users and users upgrading are prompted to make an explicit, informed choice.
- The plugin's position on JavaScript execution is clearly communicated.
- Consistent with the broader Obsidian plugin ecosystem norms.

### Negative

- Breaking change: all existing queries that rely on JavaScript execution stop working until
  the user enables the setting.
- Users will inevitably file bug reports, though a clear error message should reduce these
  significantly compared to a silent failure.
- Users may enable the setting without reading the warning, limiting the practical security
  gain for that population — though this is inherent to any opt-in model.

### Neutral

- The underlying technical capability (`new Function()`) is unchanged.
- The iterative placeholder expansion mechanism is unchanged, but JavaScript evaluation
  during expansion is gated by the setting.
- The Obsidian-level trust model is unchanged; this decision acknowledges that and routes
  the systemic concern appropriately.

## Other Questions

1. Should the setting warning text mention specific risks (filesystem access, data
   exfiltration) or remain general?
    - Yes, it should say enough to convey to users the severity of the concern if they could run untrusted code.
2. Should the error message shown to users when the setting is disabled link to
   documentation?
    - Yes. Implemented.
3. What should the migration story be for users upgrading from an older version — silent
   disable, or a one-time modal prompt?
    - Silent. Because of time limitations and the importance of getting the release out.

## Further Work

- User-facing documentation update explaining the setting and the reasoning behind it.
- Longer-term: continue improving the core query language to reduce the need for
  `by function` in common cases.

---

**Decision made by:** Clare Macrae
**Date:** 2026-04-20
**ADR Number:** 002
