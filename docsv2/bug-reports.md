# Reporting Issues

> [!Important]
> Change the link in `.github/ISSUE_TEMPLATE/bug-report.yaml` once you change/move the filename.

If you require support with a bug, you can help us help you.
Please understand that Tasks is mostly maintained by a single person in her free time.

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
