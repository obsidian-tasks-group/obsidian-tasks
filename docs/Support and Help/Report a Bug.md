# Report a Bug

## Summary

If you require support with a bug, you can help us to help you.

Please understand that Tasks is mostly maintained by a single person in their free time, and:

- our spending **time dealing with incomplete bug reports means** ...
- ... us spending **less time improving the plugin**.

Please follow the steps in this page **fully** to report a bug, to save your time and ours. Thank you.

## Before reporting a bug

Don't waste your time crafting a careful bug report for something we already knew about!

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

### Give steps to reproduce the bug

> [!Important]
> If we cannot reproduce the bug, we cannot fix it, and your bug-reporting efforts will have been wasted.
>
> We do not have time to spend chasing up incomplete bug reports.

The bug report form has a section **'steps to reproduce'**.

Here, we need an **exact, complete, numbered** list of steps to perform, to reproduce the problem.

And these steps need to work in a vault that **has Tasks as the only enabled plugin**. (See below for what to do if another plugin is involved.)

### Example 'Steps to reproduce'

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

### Text representation

It's crucial that we receive a **text representation** of your files in order to be able to investigate issues.
Trying to reproduce an issue based on a description or screenshot is time-intensive and error-prone.
Especially since there exists a plethora of themes and CSS-snippets which change how your tasks and checkboxes look.

Please understand that we don't have the time to chase after details when a text representation of the vault already includes everything we need.

Here is how you can send us a useful text representation:

1. Find all the files that are required to reproduce the issue
2. Find Tasks' settings file in your vault under `.obsidian/plugins/obsidian-tasks-plugin/data.json`
    - The `.obsidian` directory is in the `/` root of your vault.
    - Note that, on most operating systems, the directory `.obsidian` is hidden by default. Please check your operating system's help to find out how to make it show up in your file browser.
    - `data.json` holds all settings of Obsidian Tasks.
3. Make sure none of the files contain confidential or private information.
4. Create a `.zip` file that contains the files identified above, including `data.json`.

> [!Info]
> It's understandable if you don't want to share your private data.
> In these cases, we kindly request that you create a new vault where you create a minimal example that highlights your issue (including Tasks' settings).

> [!Tip]
> If it is **very** easy to reproduce your issue, you may send only the `data.json` file.
> Instead of adding the content files to the zip archive, simply put the text to reproduce your issue directly into the GitHub issue.
