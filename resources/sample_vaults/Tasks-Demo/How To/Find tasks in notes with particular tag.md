# Find tasks in notes with particular tag

Suppose we wanted to find all tasks in notes that had a particular tag in the frontmatter.

This is not currently possible in Tasks directly, but we could get dataview to do the search for us and create a Tasks query.

```dataviewjs
const tag = '#examples'

const query = `
not done
(path includes ${dv.pagePaths(tag).join(') OR (path includes ')})

# you can add any number of extra Tasks instructions, for example:
group by path
`;

dv.paragraph('```tasks\n' + query + '\n```');
```
