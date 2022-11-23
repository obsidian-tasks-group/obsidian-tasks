# Find tasks in notes with particular tag

Suppose we wanted to find all tasks in notes that had a particular tag in the frontmatter.

This is not currently possible in Tasks directly, but we could get dataview to do the search for us and create a Tasks query.

Note that the following finds all tasks where the tag is present anywhere in the file, not just in the frontmatter.

```dataviewjs
const tag = '#examples'
const matching_files = dv.pagePaths(tag)
if ( matching_files.length > 0 ) {
    const query = `
        not done
        (path includes ${matching_files.join(') OR (path includes ')})

        # you can add any number of extra Tasks instructions, for example:
        group by path
`;

    dv.paragraph('```tasks\n' + query + '\n```');
} else {
    const message = `No files found with tag ${tag}`
    dv.paragraph(message)
}
```

Credit: jonlemon in [this Obsidian Forum thread](https://forum.obsidian.md/t/how-can-i-list-tasks-from-all-notes-with-a-certain-tag-using-the-tasks-plugin/44634).
