# How do I make a release?

1. Go to the [CodeQL Actions page](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/codeql-analysis.yml) and click `Run workflow` to run the CodeQL checks
    - Wait for them to succeed
    - If they fail, put the release on hold and fix any issues first. (Failures are very rare.)
2. Check out the `main` branch
3. Check for the current version in [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) (for example, `1.4.1`) and decide on a next version
    - Backwards incompatible change: increase major version
    - New functionality: increase minor version
    - Only bug fixes: increase patch version
4. Having decided on the new version, replace all `X.Y.Z` in the documentation with the new version number.
5. Check the current version of the obsidian dependency in [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) (for example, `0.13.21`)
6. Run `./release.sh <new tasks version> <obsidian version>`
    - Make sure there are no uncommitted changes. Stash them if necessary.
7. Wait for [GitHub Actions](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/release.yml) to create the new release
8. Update the release description with the changes of the release, which will be a Draft.
    - On the release page, GitHub provides a button to auto-generate release notes which works nicely as a good starting point.
9. When you are happy with the release notes, hit the Publish button.
    - At this point, GitHub will send an email automatically to everyone who is subscribed to Tasks releases.
10. Optional: Post to
    - Obsidian Discord
        - Add a post in the `#updates` channel, with detail about the release
        - Add a one-liner in the `#task-management` channel, linking to the first post
    - r/ObsidianMD on Reddit
    - Obsidian Forum Share & Showcase section
    - etc.
