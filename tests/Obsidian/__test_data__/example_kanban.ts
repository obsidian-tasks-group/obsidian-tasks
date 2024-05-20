export const example_kanban = {
    filePath: 'Test Data/example_kanban.md',
    fileContents:
        '---\n' +
        '\n' +
        'kanban-plugin: basic\n' +
        '\n' +
        '---\n' +
        '\n' +
        '## Backlog\n' +
        '\n' +
        "- [ ] #task Task in 'example_kanban'\n" +
        '\n' +
        '\n' +
        '%% kanban:settings\n' +
        '```\n' +
        '{"kanban-plugin":"basic"}\n' +
        '```\n' +
        '%%\n',
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 50,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 55,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'Backlog',
                level: 2,
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 32,
                    },
                    end: {
                        line: 6,
                        col: 10,
                        offset: 42,
                    },
                },
            },
        ],
        sections: [
            {
                type: 'yaml',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 4,
                        col: 3,
                        offset: 30,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 32,
                    },
                    end: {
                        line: 6,
                        col: 10,
                        offset: 42,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 44,
                    },
                    end: {
                        line: 8,
                        col: 36,
                        offset: 80,
                    },
                },
            },
            {
                type: 'comment',
                position: {
                    start: {
                        line: 11,
                        col: 0,
                        offset: 83,
                    },
                    end: {
                        line: 15,
                        col: 2,
                        offset: 138,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -8,
                task: ' ',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 44,
                    },
                    end: {
                        line: 8,
                        col: 36,
                        offset: 80,
                    },
                },
            },
        ],
        frontmatter: {
            'kanban-plugin': 'basic',
        },
        frontmatterLinks: [],
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 4,
                col: 3,
                offset: 30,
            },
        },
    },
};
