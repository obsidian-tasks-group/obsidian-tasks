---
publish: true
---

# SonarQube

<span class="related-pages">#linting</span>

## Introduction

[SonarQube](https://www.sonarsource.com/products/sonarqube/) runs on all Pull Requests on this project.

You can see its [current report](https://sonarcloud.io/project/overview?id=obsidian-tasks-group_obsidian-tasks).

## Disabled rules

We disable the following rules on the SonarQube cloud service.

If you enable SonarQube in your IDE, such as with the [SonarQube WebStorm plugin](https://plugins.jetbrains.com/plugin/7973-sonarqube-for-ide), you'll need to manually disable these.

| Language   | Rule             | Message                                                             | Name                                                                       | Reason for disabling                                                                                             |
| ---------- | ---------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| TypeScript | typescript:S1135 | Complete the task associated to this "TODO" comment.                | Track uses of "TODO" tags                                                  | There are `TODO` strings all over this project, in the code and tests, far too many to add manual exclusions to. |
| HTML       | Web:S1135        | Complete the task associated to this "TODO" comment.                | Track uses of "TODO" tags                                                  | There are `TODO` strings in many `*.approved.html` test files.                                                   |
| TypeScript | typescript:S1848 | Either remove this useless object instantiation of "..." or use it. | Objects should not be created to be dropped immediately without being used | The `new Notice()` pattern is common in Obsidian code.                                                           |
| TypeScript | typescript:S2699 | Add at least one assertion to this test case.                       | Tests should include assertions                                            | Many of our tests call a function `verify*()` - SonarQube does not recognise these [[Approval Tests]] assertions |

## Useful links for maintainer

- [Tasks TypeScript profile](https://sonarcloud.io/organizations/obsidian-tasks-group/quality_profiles/show?name=Tasks+TypeScript+profile&language=ts)
- [Tasks HTML profile](https://sonarcloud.io/organizations/obsidian-tasks-group/quality_profiles/show?name=Tasks+HTML+profile&language=web)
