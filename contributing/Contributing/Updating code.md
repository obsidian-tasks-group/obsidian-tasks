# Updating code

<span class="related-pages">#pull-requests</span>

> [!NOTE]
> **February 2026**: Because of the growth of AI-generated PRs that are taking a *lot* of effort to handle, we have had to refine these instructions.

## Before you start coding

**You must have an issue or discussion first.** This is non-negotiable.

1. [ ] An [issue](https://github.com/obsidian-tasks-group/obsidian-tasks/issues) or [Discussion](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions) exists for the change you want to make.
2. [ ] A maintainer has reviewed your proposed approach and agreed it's the right solution.

This prevents wasted effort on changes we don't want or approaches that won't work.

## Branch is required

1. [ ] Create your PR from a feature/fix branch, not from `main`.
   - See [Don’t Start Pull Requests from Your Main Branch](https://hynek.me/articles/pull-requests-branch/)

## PR scope: one thing per PR

**Keep PRs focused and atomic.** Each PR with code changes should address:

- One bug fix, OR
- One new feature, OR
- One refactoring task

Do not combine bug fixes with refactoring. Do not add multiple unrelated features. This makes reviews much faster and easier to revert if needed.

## Quality requirements

### For bug fixes

1. [ ] Add a test using `it.failing()` that demonstrates the current incorrect behaviour (if one doesn't already exist).
   - `it.failing()` is a Jest feature: the test documents what's broken, and will error if the bug is already fixed.
2. [ ] Fix the bug.
3. [ ] Change `it.failing()` to `it()` so the test now passes with your fix.
4. [ ] Update [[About Documentation|documentation]]: remove any references to this bug from "known limitations" or similar sections.

### For new features

1. [ ] Write Jest [[About Testing|tests]] covering the new behaviour.
2. [ ] Write [[About Documentation|user documentation]] explaining how to use the feature. See our docs directory structure for where to place it.

## Code quality checks

Before submitting:

1. [ ] `lefthook` pre-commit and pre-push hooks have passed.

## Creating the PR

1. [ ] Use the PR template.
2. [ ] Write a clear description of what the PR does and why (link to the issue).
3. [ ] Keep the title concise (e.g., "Fix: task completion not saving" or "Feature: add recurring tasks").

Once submitted, maintainers will review when they have capacity.

If we don't receive a response to our feedback within a week, we'll close the PR.

## Dos and Don'ts whilst your PR is open

### Motivation

- **User support**:
  - We make heavy use of [git bisect](https://nathanchance.dev/posts/working-with-git-bisect/) to save time when tracking down unexpected changes in the code's behaviour.
  - This requires **every commit in the history to build and pass tests**.
- **Pull requests**:
  - During code reviews and testing on PRs, we often review the changes one commit at a time, and make Draft review comments.
  - We also keep notes in Obsidian of things to consider mentioning.
  - These review comments and notes refer to the specific `commit id` we were looking at.

### Never ever rebase your PR branch on to `main`

- See Julia Evans' excellent article [git rebase: what can go wrong?](https://jvns.ca/blog/2023/11/06/rebasing-what-can-go-wrong-/)
- A lot of pages, like Atlassian's [Merging vs. rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) will tell you:
  - "the golden rule of `git rebase` is to never use it on *public* branches."
- But this misses the more important point: rebase can create broken intermediate commits regardless of whether the branch is public or not.

### Never force-push to the PR branch

- Force-pushing on to an existing branch changes commit ids for commits that may have already been reviewed.
- This makes the code review process harder, and wastes time.

### Only merge `main` in to your PR branch if we ask you to, during code review

- We prefer any merge-conflicts to be managed by team members who are more familiar changes made outside your branch, and so can more safely handle merge conflicts.
- If GitHub warns about merge conflicts, leave them for us to handle.
