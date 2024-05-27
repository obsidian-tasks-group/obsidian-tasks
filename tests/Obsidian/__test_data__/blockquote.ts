export const blockquote = {
    filePath: 'Test Data/blockquote.md',
    fileContents:
        '# blockquote\n' +
        '\n' +
        "> - [ ] #task Task in 'blockquote'\n" +
        ">     - [ ] #task Task indented in 'blockquote'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 8,
                        offset: 22,
                    },
                    end: {
                        line: 2,
                        col: 13,
                        offset: 27,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 12,
                        offset: 61,
                    },
                    end: {
                        line: 3,
                        col: 17,
                        offset: 66,
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
                        col: 12,
                        offset: 12,
                    },
                },
                heading: 'blockquote',
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
                        col: 12,
                        offset: 12,
                    },
                },
            },
            {
                type: 'blockquote',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 14,
                    },
                    end: {
                        line: 3,
                        col: 47,
                        offset: 96,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 2,
                        offset: 16,
                    },
                    end: {
                        line: 2,
                        col: 34,
                        offset: 48,
                    },
                },
                parent: -2,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 4,
                        offset: 53,
                    },
                    end: {
                        line: 3,
                        col: 47,
                        offset: 96,
                    },
                },
                parent: 2,
                task: ' ',
            },
        ],
    },
};
