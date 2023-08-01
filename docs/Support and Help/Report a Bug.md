# Report a Bug

## Summary

If you require support with a bug, you can help us to help you.

Please understand that Tasks is mostly maintained by a single person in their free time, and:

- our spending **time dealing with incomplete bug reports means** ...
- ... us spending **less time improving the plugin**.

Please follow the steps in this page **fully** when reporting a bug, to save your time and ours. Thank you.

## Before reporting a bug

> [!important]
> Don't waste your time crafting a careful bug report for something we already know about!

- Is it the intended behaviour - or a documented limitation?
  - Read the [User Guide](https://publish.obsidian.md/tasks/Introduction) for the problem feature.
  - We take care to record known limitations, often with a link to an existing issue that you can up-vote with a 👍.
- Is it already known?
  - Review the [existing bug reports](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aissue+is%3Aopen+label%3A%22type%3A+bug%22), to see if yours is listed.
  - If it is, up-vote it with a 👍.
- Check your tasks for broken data
  - Understand why the [order of items in a task matters](https://publish.obsidian.md/tasks/Getting+Started/Auto-Suggest#What+do+I+need+to+know+about+the+order+of+items+in+a+task%3F).
  - If a task is not found by a query, [check the task is formatted correctly](https://publish.obsidian.md/tasks/Getting+Started/Auto-Suggest#How+can+I+check+that+my+Task+is+formatted+correctly%3F).
  - Search for [tasks with invalid dates](https://publish.obsidian.md/tasks/Queries/Filters).
- Get an explanation of your Tasks search.
  - Add the [explain](https://publish.obsidian.md/tasks/Queries/Explaining+Queries) instruction to your query block.
  - Check how it interpreted the dates in your filters.
  - Make sure you have not confused `AND` and `OR`.
- Is it really a problem with Tasks?
  - Run the Obsidian command `Open sandbox vault`.
  - Install and enable Tasks.
  - Confirm that you can reproduce the problem there.
  - Make a note of every individual step you needed to do, to reproduce the problem.

## Report the bug

There is a [form to guide you through submitting a bug report](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/new/choose).

The rest of this section guides you through giving enough information for the bug to be investigated.

> [!warning] Warning: Issues created with GitHub's 'Reference in new issue' will be closed with no action
> Occasionally we receive bug reports or feature requests that were created via GitHub's '[Reference in new issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue#creating-an-issue-from-a-comment)' facility.
>
> Because they by-pass the Issue template mechanism, these do not have the information that we need to be able to act on requests.
>
> We no longer have the time to go back and forth asking for the information manually that the templates request.
>
> Please do not be offended when issues created via 'Reference in new issue' are just closed. It's nothing personal.

### Give us text to copy

It's crucial that we receive a **text representation** of your files in order to be able to investigate issues.

> [!Important]
> Trying to reproduce an issue based on a description or screenshot is time-intensive and error-prone,
> especially since there exists a plethora of themes and CSS-snippets which change how your tasks and checkboxes look.

#### Format tasks

To enable us to copy the raw text of your task, you need to put the task between two lines containing just `~~~`.

For example:

````text
~~~
- [ ] My lovely task with 📅 2023-04-10 that Tasks search does not find
~~~
````

This will display as:

````text
- [ ] My lovely task with 📅 2023-04-10 that Tasks search does not find
````

#### Format Tasks query blocks

Again, to enable us to copy the raw text of your tasks query, you need to put the block between two lines containing just `~~~`.

For example:

````text
~~~
```tasks
not done
due today
```
~~~
````

This will display as:

````text
```tasks
not done
due today
```
````

### Give steps to reproduce the bug

> [!Important]
> If we cannot reproduce the bug, we cannot fix it, and your bug-reporting efforts will have been wasted.
>
> We do not have time to spend chasing up incomplete bug reports.

The bug report form has a section **'steps to reproduce'**.

Here, we need an **exact, complete, numbered** list of steps to perform, to reproduce the problem.

And these steps need to work in a vault that **has Tasks as the only enabled plugin**.

> [!info]
> See [[#Bug involving another plugin]] below for what to do if another plugin is involved.

#### Example 'Steps to reproduce'

This is the level of detail required for a developer to be able to reproduce a bug, taken from [issue #1300](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1300#issuecomment-1306829403):

> [!Example] Example steps to reproduce a particular bug
> Steps to reproduce:
>
> 1. Turn on "Use filename as scheduled date" in Tasks settings and restart Obsidian
> 2. Create a file called `delete me - issue 1300 - 2022-11-02`.
>     - **Note:** The file name matters, as it will be used in the query below
> 3. Paste in to it the following content.
>     - **Note:** You may need to hold down the shift key whilst pasting, to make sure the text is pasted in as raw text.
>
>         ````text
>         # delete me - issue 1300 - 2022-11-02
>
>         ## Tasks
>
>         - [ ] Do stuff
>
>         ## Tasks in This File
>
>         The group heading indicates whether or not the task has a scheduled date:
>
>         ```tasks
>         not done
>         path includes delete me - issue 1300
>         group by scheduled
>         ```
>         ````
>
> 4. View in **Reading Mode**:
>    - Confirm that the group heading in the tasks code block is `2022-11-02 Wednesday`, matching the date in the file name (as opposed to `No scheduled date`, which would mean that the setting has not enabled)
> 5. Click on the Pencil icon to the right of the task in the tasks code block
> 6. Change the scheduled date to `2023-01-13`
> 7. Click Apply
>     - **Actual behaviour**
>         - Nothing changes, as the new scheduled date is not saved.
>     - **Expected behaviour:**
>         - The original task line has `⏳ 2023-01-13`
>         - In the tasks code block:
>           - The group heading changes to `⏳ 2023-01-13 Friday`
>           - The task contains `⏳ 2023-01-13`
> 8. Repeat the editing steps above in **Live Preview** mode
>     - The same thing happens: the edited date is not applied to the task line

## Bug involving another plugin

> [!warning]
> We do not generally work on problems of Tasks interacting with other plugins **unless the author of that plugin is willing to work jointly** on the problem.

Spending time getting familiar another plugin's settings, behaviour and code would take time away from improving Tasks.

> [!important]
> If you choose to still report a bug with another plugin, you **must give us a minimal zipped vault**, with:
>
> - just Tasks and the other plugin installed,
> - one or two notes that demonstrate the problem.

### Before reporting a Tasks bug involving another plugin

1. Create a new Obsidian vault
1. Install Tasks
    - Update the Tasks settings if necessary
1. Install the other plugin
    - Update the other plugin's settings if necessary
1. Set up a new note with **the simplest possible content to demonstrate the problem**
1. Confirm that you can reproduce the problem there.
1. Make a note of every individual step you needed to do to reproduce the problem.

### Give us your minimal vault

Once you have figured out the steps to reproduce the vault:

1. Quit Obsidian
2. Create a .zip file containing the minimal vault
3. Create a [bug report](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/new/choose)
4. Make sure you [[#Give steps to reproduce the bug]]
5. Attach the zip file to the bug report, by dragging the file from your file browser into the bug report form
