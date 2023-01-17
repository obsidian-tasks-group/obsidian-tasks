# Tasks in Experimental notes

Things I would like to do in the notes in this folder.

```dataviewjs
function callout(text, type, title) {
    const allText = `> [!${type}] ${title}\n` + text;
    const lines = allText.split('\n');
    return lines.join('\n> ') + '\n'
}

const query = `
not done
path includes ${dv.current().file.folder}
sort by due date
sort by description

group by backlink
# hide task count

short mode
`;

dv.paragraph(callout('```tasks\n' + query + '\n```', 'tasks-in-this-file', 'Tasks in this folder'));
```
