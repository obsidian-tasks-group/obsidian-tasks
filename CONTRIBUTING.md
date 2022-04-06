# Contribution Guidelines Obsidian Tasks

## FAQs

### How are task updates handled?

### How do I make a release?

1. Check out the `main` branch
2. Check for the current version in `package.json` (e.g. `1.4.1`) and decide on a next version
    - Backwards incompatible change: increase major version
    - New functionality: increase minor version
    - Only bug fixes: increase patch version
3. Check the current version of the obsidian dependency in `package.json` (e.g. `0.13.21`)
4. Run `./release.sh <new tasks version> <obsidian version>`
    - Make sure there are no uncommitted changes. Stash them if necessary.
5. Wait for [GitHub Actions](https://github.com/schemar/obsidian-tasks/actions/workflows/release.yml) to create the new release
6. Update the release description with the changes of the release
7. Optional: Post to
    - Obsidian Discord
    - r/ObsidianMD on Reddit
    - etc.
