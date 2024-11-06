export const non_tasks = {
    filePath: 'Test Data/non_tasks.md',
    fileContents:
        '# non_tasks\n' +
        '\n' +
        '```tasks\n' +
        'path includes {{query.file.path}}\n' +
        '```\n' +
        '\n' +
        '```\n' +
        '- [ ] I look like a task but am in a code block\n' +
        '```\n' +
        '\n' +
        'Below is an HTML comment in `<!-- .... ->`, so the "task" inside is not seen by Obsidian or any of its task-based plugins.\n' +
        '\n' +
        '<!--\n' +
        '- [ ] I look like a task but am in an HTML comment\n' +
        '-->\n' +
        '\n' +
        'Below is an Obsidian comment in `%% ... %%`, so the "task" inside is not seen by Obsidian or any of its task-based plugins.\n' +
        '\n' +
        '%%\n' +
        '- [ ] I look like a task but am in an Obsidian (percent) comment\n' +
        '%%\n',
    cachedMetadata: {
        headings: [
            {
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 11,
                        offset: 11,
                    },
                },
                heading: 'non_tasks',
                level: 1,
            },
        ],
        sections: [
            {
                type: 'heading',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 11,
                        offset: 11,
                    },
                },
            },
            {
                type: 'code',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 13,
                    },
                    end: {
                        line: 4,
                        col: 3,
                        offset: 59,
                    },
                },
            },
            {
                type: 'code',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 61,
                    },
                    end: {
                        line: 8,
                        col: 3,
                        offset: 116,
                    },
                },
            },
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 10,
                        col: 0,
                        offset: 118,
                    },
                    end: {
                        line: 10,
                        col: 122,
                        offset: 240,
                    },
                },
            },
            {
                type: 'html',
                position: {
                    start: {
                        line: 12,
                        col: 0,
                        offset: 242,
                    },
                    end: {
                        line: 14,
                        col: 3,
                        offset: 301,
                    },
                },
            },
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 16,
                        col: 0,
                        offset: 303,
                    },
                    end: {
                        line: 16,
                        col: 123,
                        offset: 426,
                    },
                },
            },
            {
                type: 'comment',
                position: {
                    start: {
                        line: 18,
                        col: 0,
                        offset: 428,
                    },
                    end: {
                        line: 20,
                        col: 2,
                        offset: 498,
                    },
                },
            },
        ],
    },
    obsidianApiVersion: '1.7.5',
    getAllTags: [],
    parseFrontMatterTags: null,
};
