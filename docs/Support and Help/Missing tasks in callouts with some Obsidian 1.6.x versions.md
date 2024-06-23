---
publish: true
---

# Missing tasks in callouts with some Obsidian 1.6.x versions

## tl;dr

> [!Info] This page is **very important** to you if:
>
> - you use any Obsidian plugins to manage tasks (such as Tasks or dataview)
>   - *...and...*
> - you use [[#What is a callout with a title?|callouts with titles]] in your vault,
>   - *...and...*
> - you have any task lines inside those callouts,
>   - *...and...*
> - you are using Obsidian 1.6.3 or 1.6.4
>   - (We don't know if 1.6.0, 1.6.1 or 1.6.2 were also affected).

> [!bug] Missing tasks
>
> - If the above are all true:
>   - **Obsidian 1.6.3** has a bug that ==Tasks, dataview and likely other plugins *will* fail to find some of your tasks==.
>   - **Obsidian 1.6.4** fixes the bug when files are edited, but ==still requires manual edits to existing files, to apply the fix==.
> - This page:
>   - Explains the problems with Obsidian [[#Obsidian 1.6.3 fails to find tasks in some callouts|1.6.3]] and [[#Obsidian 1.6.4 partially fixes the bug (for Catalyst users)|1.6.4]].
>   - Gives options for [[#users with Catalyst licences]] and [[#non-Catalyst users]].
>   - Links to the [[#related bug reports]].

### What is a callout with a title?

Here is an example callout with a title:

````text
> [!tip] Callouts can have custom titles
> Like this one.
````

Which displays like this:

> [!tip] Callouts can have custom titles
> Like this one.

## Obsidian problems

### Obsidian 1.6.3 fails to find tasks in some callouts

The following task in a callout ==will **not be found** by Tasks in Obsidian 1.6.3==:

```text
> [!NOTE] Some Title - Remove me to make the task be found
> - [ ] Task in callout
```

The underlying cause is that Obsidian 1.6.3 reports incorrect (too large) line numbers in its [cache](https://docs.obsidian.md/Reference/TypeScript+API/CachedMetadata) for tasks (and other content) inside callouts with titles. Plugins use that cache to locate tasks and other data.

Each nested callout seems to increase the discrepancy in line numbers. So in the following, only `Correction4` would be found:

````text
 > [!Calendar]+ MONTH
 >> [!Check]+ GROUP
 >>> [!Attention]+ Correction TITLE
 >>> Some stuff goes here
 >>> - [ ] Correction1
 >>> - [ ] Correction2
 >>> - [ ] Correction3
 >>> - [ ] Correction4
````

We wrote up the underlying Obsidian issue in: [Tasks inside callouts have incorrect positions in the cache](https://forum.obsidian.md/t/tasks-inside-callouts-have-incorrect-positions-in-the-cache/84057/1).

It's possible the issue was also present in earlier 1.6.x versions: we don't know.

### Obsidian 1.6.4 partially fixes the bug (for Catalyst users)

Obsidian 1.6.4 beta/insider version was released to those with [Catalyst licences](https://help.obsidian.md/Licenses+and+payment/Catalyst+license) on 20 June 2024.

The [Obsidian 1.6.4 changelog](https://obsidian.md/changelog/2024-06-20-desktop-v1.6.4/) reports some fixes to checkboxes and callouts.

However, on initial testing we found that ==the missing tasks are still not found in many cases==.

The Obsidian team have since kindly provided a manual workaround, which we give in [[#Users with Catalyst licences]] below.

## Options for users of Tasks, dataview and similar plugins

### Users with Catalyst licences

At the time of writing (23 June 2024), the newest version of Obsidian available to holders of [Catalyst licences](https://help.obsidian.md/Licenses+and+payment/Catalyst+license) is 1.6.4.

> [!Warning]
> 1.6.4 is a beta version of Obsidian: [do note the warning about risks with beta releases](https://help.obsidian.md/Obsidian/Early+access+versions) in the Obsidian documentation.

It partially fixes the problem, but user intervention is still required to activate the fix in each affected file.

> [!Tip]
> To ensure Obsidian 1.6.4 finds all your tasks in titled callouts, the Obsidian team has advised:
>
> - An ==edit needs to be made anywhere in a file containing any callout with titles==, to make Obsidian re-read the file and generate correct line numbers for callout content.
> - After a couple of seconds of inactivity, Obsidian's cached data will be updated, and missing checkboxes in that file will be found correctly.
> - ==Don't undo the edit==, as apparently the cached data would then be reverted.
>
> You will need to do this in all your files that have tasks in titled callouts.

The good news is that doing this will then ensure that Obsidian 1.6.4 does now report the correct locations of things inside titled callouts.

### Non-Catalyst users

At the time of writing (23 June 2024), the newest public version of Obsidian is the broken 1.6.3.

> [!tip]
> We are aware of these options when using 1.6.3:
>
> 1. Do nothing, and await a full fix from Obsidian.
>     - This may be acceptable if you don't track critical or important tasks in Obsidian.
> 1. Consider purchasing an [Insider tier Catalyst licence](https://help.obsidian.md/Licenses+and+payment/Catalyst+license) for early access to the partial fix.
>     - ==Note [the warning about risks with beta releases](https://help.obsidian.md/Obsidian/Early+access+versions) in the Obsidian documentation==.
>     - Upgrade to the beta Obsidian 1.6.4, then follow [[#Users with Catalyst licences]] above.
> 1. Remove all titles from callouts containing tasks, by changing things like this:
>
>     ```text
>     > [!NOTE] My lovely callout
>     > - [ ] Task in callout
>     ```
>
>     to things like this:
>
>     ```text
>     > [!NOTE]
>     > - [ ] Task in callout
>     ```
>
> 1. Perhaps downgrade to a 1.5 Obsidian release?
>     - We cannot advise how or whether to do this.

## Related bug reports

- **Tasks plugin**:
  - [Error with Tasks in Titled Callouts – Obsidian v1.6.3 (and v1.6.4 until file with callout is edited) · Issue #2890](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2890)
  - [Tasks with nested structures cannot be searched or are searched sporadically. · Issue #2904](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2904)
- **dataview plugin**:
  - [DQL Task Query: Titled callouts cause a shift of results by one · Issue #2365](https://github.com/blacksmithgu/obsidian-dataview/issues/2365)
  - [Issue with the First Task Item in Callout Losing Data · Issue #2359](https://github.com/blacksmithgu/obsidian-dataview/issues/2359)
- **Obsidian**:
  - 1.6.3: [Checkbox tasks in a callout can't be clicked or checks the wrong item](https://forum.obsidian.md/t/last-checkbox-in-a-callout-cant-be-clicked/82742)
  - 1.6.4: [Tasks inside callouts have incorrect positions in the cache](https://forum.obsidian.md/t/tasks-inside-callouts-have-incorrect-positions-in-the-cache/84057)
