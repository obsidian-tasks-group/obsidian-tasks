# Changelog (fork-specific)

Tracks this fork's own changes on top of each upstream base. See `CLAUDE.md` for the versioning scheme
(this fork's own independent `MAJOR.MINOR.PATCH`, decoupled from upstream's version — see `upstreamVersion`
in `manifest.json`/`package.json`) and the upstream-sync process. Upstream's own changelog is not duplicated
here — see <https://github.com/obsidian-tasks-group/obsidian-tasks/releases>.

## 1.0.0 — upstream base `8.4.0`

Fork setup, no user-facing features yet:

- Renamed plugin id from `obsidian-tasks-plugin` to `upgraded-tasks` (`manifest.json`, `package.json`) so it
  can't be confused with, or conflict with, a real Tasks install.
- Pinned locale for urgency number formatting.
- Fixed a Windows path-separator failure in the `MockDataLoader` test.
- Adopted this fork's own independent versioning scheme, documented in `CLAUDE.md`.
