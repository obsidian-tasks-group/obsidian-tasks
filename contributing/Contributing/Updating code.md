# Updating code

<span class="related-pages">#pull-requests</span>

> [!NOTE]
> **February 2026**: Because of the growth of AI-generated PRs that are taking a *lot* of effort to handle, we have had to refine these instructions.

## Initial issue or discussion is now required

Requirements:

1. [ ] An [issue](https://github.com/obsidian-tasks-group/obsidian-tasks/issues) or [Discussion](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions) of the change already exists,
2. [ ] Ideally, we discussed your implementation in that issue before you open the pull request (PR).

## Branch is required

1. [ ] The PR must be created from a branch, not from `main`.

## Quality of changes

### For bug fixes

As you fix a bug, we expect you to:

1. [ ] Before fixing the bug, add a test that Jest [[About Testing|test]] the shows the current incorrect behaviour of the code (if such a `.failing` test does not already exist).
2. [ ] Fix the bug, and update the test so that it passes and shows the corrected behaviour.
3. [ ] In the [[About Documentation|documentation]] remove any reference to the bug from "known limitations"-type sections.

### For new features

As you implement a feature, we expect you to:

1. [ ] Write Jest [[About Testing|tests]] for the new behaviour.
2. [ ] Write [[About Documentation|user documentation]] showing how to use the feature.

## Creating the PR

Once you want to propose your changes, create a PR and we'll have a look when we have time.
Discussion will take place inside the PR.
