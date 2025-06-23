---
publish: true
---

# ADR-001 - Nomenclature for Reusable Instruction Blocks Feature

## Status

**ACCEPTED** - Decision made on 2025-05-29

## Context

The Tasks plugin is introducing a feature allowing users to define reusable blocks of Tasks instructions in settings and reference them in queries. This feature was initially named "Includes" with the following syntax:

- Direct instruction: `include standard_options`  
- Placeholder syntax: `{{includes.standard_options}}`

However, during pre-release testing, a significant naming collision was identified with the existing text search functionality:

- Existing: `description includes blah` (searches for text containing "blah")
- New feature: `include standard_options` (imports predefined instruction block)

This collision creates cognitive overhead and potential user confusion, necessitating a nomenclature change before public release.

## Decision

We will rename the feature from "Includes" to "Presets" with the following syntax:

- **Direct instruction:** `preset standard_options`
- **Placeholder syntax:** `{{preset.standard_options}}` (singular for consistency)

## Alternatives Considered

The following alternatives were evaluated in priority order:

| Priority | Direct Syntax                 | Placeholder Syntax                 | Assessment                                      |
| -------- | ----------------------------- | ---------------------------------- | ----------------------------------------------- |
| **1**    | `preset standard_options`     | `{{presets.standard_options}}`     | ✅ No conflicts, user-friendly                  |
| 2        | `macro standard_options`      | `{{macros.standard_options}}`      | ✅ No conflicts, technical precision            |
| 3        | `def standard_options`        | `{{defs.standard_options}}`        | ✅ No conflicts, programming-friendly           |
| 4        | `definition standard_options` | `{{definitions.standard_options}}` | ✅ No conflicts, verbose                        |
| 5        | `import standard_options`     | `{{imports.standard_options}}`     | ✅ No conflicts, developer-oriented             |
| 6        | `block standard_options`      | `{{blocks.standard_options}}`      | ⚠️ Potential confusion with Obsidian block refs |
| 7        | `reference standard_options`  | `{{references.standard_options}}`  | ⚠️ Potential confusion with Obsidian links      |
| 8        | `ref standard_options`        | `{{refs.standard_options}}`        | ⚠️ Potential confusion with Obsidian links      |
| 9        | `include standard_options`    | `{{includes.standard_options}}`    | ❌ Conflicts with `description includes text`   |
| 10       | `snippet standard_options`    | `{{snippets.standard_options}}`    | ❌ Conflicts with Obsidian CSS snippets         |
| 11       | `template standard_options`   | `{{templates.standard_options}}`   | ❌ Strong conflict with Obsidian Templates      |

## Rationale

"Preset" was selected as the optimal choice because:

1. **Zero Conflicts:** No collision with existing Tasks functionality or Obsidian features
2. **User Accessibility:** Least programmer-centric terminology among viable options
3. **Familiar Concept:** Widely used across many software applications (camera presets, filter presets, etc.)
4. **Clear Intent:** Immediately conveys the concept of predefined configurations
5. **Broad Appeal:** Accessible to users across all technical levels

The decision to use singular form in placeholder syntax (`{{preset.name}}` instead of `{{presets.name}}`) maintains consistency with other Tasks placeholder patterns.

## Consequences

### Positive

- Eliminates user confusion from naming collision
- Provides clear, accessible terminology
- Maintains feature functionality while improving usability
- Establishes consistent naming pattern for future features

### Negative

- Requires updating developer's own test configurations (feature is pre-release)
- Documentation and examples need updating before public release

### Neutral

- No user impact since feature is unreleased
- Error messages and validation logic require updates

## Implementation Notes

- Update all pre-release documentation and examples to use new terminology
- No user migration needed since feature is unreleased
- Error messages and validation logic should use "preset" terminology
- Release feature publicly with "preset" nomenclature

---

**Decision made by:** Clare Macrae
**Date:** 2025-05-29  
**ADR Number:** 001
