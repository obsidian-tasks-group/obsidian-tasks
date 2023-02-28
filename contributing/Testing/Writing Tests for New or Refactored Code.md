# Writing Tests for New or Refactored Code

## Think of it as testing user-visible features

- Tests that test low-level implementation details are hard to maintain over time. Instead, test user-visible features.
- Try to think of the purpose of the code that has missing tests.
  - For example, in `taskFromLine()` in [src/Commands/CreateOrEdit.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Commands/CreateOrEdit.ts) the comments are quite useful in terms of showing the different scenarios being considered. Something like:
        _already a task line with a global filter, already a task line missing the global filter, already a task line and there is no global filter, already a bullet item, not in a bullet item_
  - These then would be good tests to write: specifically, tests to check that each of those scenarios does actually behave as expected.
  - And if the implementation changed in future, those tests would be extremely useful to the maintainer at the time.
  - And if a new behaviour was added in future, it would be obvious how to add a new test for it.

## Location of code

Often, untested code is in locations that you can't call in tests (for example, because it uses some Obsidian code).
All that needs to be done then is to refactor - via 'move method' or 'extract method') the code out to a different source file.
For more about refactoring safely and easily, see the talk [Refactoring Superpowers: Make Your IDE Do Your Work, Faster and More Safely](https://www.youtube.com/watch?v=BX6gh2xNiuU).

## Then start writing tests

If you struggle to name a Jest `it` test, think in terms of _should_: for example, _should convert a line with no bullet to ..._
