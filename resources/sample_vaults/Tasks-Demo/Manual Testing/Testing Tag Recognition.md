# Testing Tag Recognition

## Context

- ['group by tags' shows tags that are not recognised by Obsidian](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/929)

### Obsidian Tag Rules

<https://help.obsidian.md/How+to/Working+with+tags>

> The only symbols allowed are:
>
> 1. _ (underscore) and - (dash) to separate words;
> 2. / (forward slash) for [nested tags](https://help.obsidian.md/Plugins/Tag+pane#Nested+tags).
>
> Numbers are allowed in the tag, as long as the tag is not purely numeric. For example, #1984 isn't a valid tag, but #y1984 is a valid one.

So the Tasks code that identifies tags should ignore things that look like tags but only contain numbers.

## Test tasks

### Tasks with things that look like tags, but are not

> [!TODO] Tasks that do not have valid tags
>
> - [ ] #task <mark style="background: #FFF12345;">I do not have a valid tag 1</mark><br>Case: Seeming tag is inside `<mark>...</mark>`
> - [ ] #task [I do not have a valid tag 2 #678](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/678)<br>Case: tag of all-digits is not a valid tag
> - [ ] #task [I do not have a valid tag 3 #920 · obsidian-tasks-group/obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/920)<br>Case: tag of all-digits is not a valid tag
> - [ ] #task I do not have a valid tag #1234<br>Case: tag of all-digits is not a valid tag
> - [ ] #task [I do not have a valid tag](https://cloud.feedly.com/#opml)<br>Case: text inside URL
> - [ ] #task I do not have a valid tag # xxx<br>Case: single # with no other characters
> - [ ] #task I do not have a valid tag #$letters-preceded-by-dollar
> - [ ] #task I do not have a valid tag - tag#inTheMiddleOfAWord
> - [ ] #task I do not have a valid tag - tag.#afterAFullStop
> - [ ] #task I do not have a valid tag - tag-#afterAHyphen

### Tasks with actual Obsidian tags - some with corner cases

> [!TODO] Tasks with valid tags
>
> - [ ] #task I have a valid tag #ValidTag
> - [ ] #task I have a valid tag #y1984
> - [ ] #task I have a valid tag #1_2 - numbers and an underscore
> - [ ] #task I have a valid tag #1-2 - numbers and a hyphen
> - [ ] #task I have a valid tag valid tag #y1984 - numbers and an alphabetical character
> - [ ] #task I have a valid tag but it should not end with a ; #FFF23456;
> - [ ] #task I have a valid tag #FFF34567
> - [ ] #task I have a valid tag #letters-followed-by-asterisk*
> - [ ] #task I have a valid tag #letters-followed-by-dollar$
> - [ ] I have a valid tag inside [some #HyperlinkedText](https://help.obsidian.md/Plugins/Tag+pane#Nested+tags)

## Tasks Searches

### Searching

#### Search for tasks that do not have tags, but Tasks thinks they do

Should give `0 tasks`.

> [!NOTE] Results
>
> ```tasks
> path includes Testing Tag Recognition
> description includes I do not have a valid tag
> tag regex matches /./
> short mode
> ```

#### Search for tasks that do have tags, but Tasks thinks they do not

Should give `0 tasks`.

> [!NOTE] Results
>
> ```tasks
> path includes Testing Tag Recognition
> description includes I have a valid tag
> tag regex does not match /./
> short mode
> ```

### Group by tags

#### Should have tags

- There should be no group headings that are black - and unlinked.
- All the tag group names should be hyperlinked in blue.
- There should be no un-linked characters in any of the headings
- And clicking on each of them should do a tags search that links to the task in this file.
- None of the groups titles should be empty text.

> [!NOTE] Results
>
> ```tasks
> path includes Testing Tag Recognition
> description includes I have a valid tag
> group by tags
> short mode
> ```

#### Should not have any tags

All tasks should be in group `(No tags)`.

Note: There are three tasks that appear at the top of the list, **seemingly with no heading, or an empty heading**.

> [!NOTE] Results
>
> ```tasks
> path includes Testing Tag Recognition
> description includes I do not have a valid tag
> group by tags
> short mode
> ```

### Tasks with incorrect descriptions

I should give `0 tasks`.

If any Tasks match here, it means that they are missing a correctly-spelled description to specify whether or not they have a valid tag.

> [!NOTE] Results
>
> ```tasks
> path includes Testing Tag Recognition
> NOT (description includes I do not have a valid tag)
> NOT (description includes I have a valid tag)
> group by tags
> short mode
> ```
