export const multiple_headings = {
    filePath: 'Test Data/multiple_headings.md',
    fileContents:
        '# multiple_headings\n' +
        '\n' +
        '## Level 2 heading\n' +
        '\n' +
        '### Level 3 heading\n' +
        '\n' +
        "- [ ] #task Task in 'multiple_headings'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 68,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 73,
                    },
                },
                tag: '#task',
            },
        ],
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
                        col: 19,
                        offset: 19,
                    },
                },
                heading: 'multiple_headings',
                level: 1,
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 21,
                    },
                    end: {
                        line: 2,
                        col: 18,
                        offset: 39,
                    },
                },
                heading: 'Level 2 heading',
                level: 2,
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 41,
                    },
                    end: {
                        line: 4,
                        col: 19,
                        offset: 60,
                    },
                },
                heading: 'Level 3 heading',
                level: 3,
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
                        col: 19,
                        offset: 19,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 21,
                    },
                    end: {
                        line: 2,
                        col: 18,
                        offset: 39,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 41,
                    },
                    end: {
                        line: 4,
                        col: 19,
                        offset: 60,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 62,
                    },
                    end: {
                        line: 6,
                        col: 39,
                        offset: 101,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 62,
                    },
                    end: {
                        line: 6,
                        col: 39,
                        offset: 101,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
