export const link_in_heading = {
    filePath: 'Test Data/link_in_heading.md',
    fileContents:
        '# link_in_heading\n' +
        '\n' +
        '## I link to [[multiple_headings]]\n' +
        '\n' +
        "- [ ] #task Task in 'link_in_heading'\n",
    cachedMetadata: {
        links: [
            {
                link: 'multiple_headings',
                original: '[[multiple_headings]]',
                displayText: 'multiple_headings',
                position: {
                    start: {
                        line: 2,
                        col: 13,
                        offset: 32,
                    },
                    end: {
                        line: 2,
                        col: 34,
                        offset: 53,
                    },
                },
            },
        ],
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 61,
                    },
                    end: {
                        line: 4,
                        col: 11,
                        offset: 66,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'link_in_heading',
                level: 1,
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 17,
                        offset: 17,
                    },
                },
            },
            {
                heading: 'I link to [[multiple_headings]]',
                level: 2,
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 19,
                    },
                    end: {
                        line: 2,
                        col: 34,
                        offset: 53,
                    },
                },
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
                        col: 17,
                        offset: 17,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 19,
                    },
                    end: {
                        line: 2,
                        col: 34,
                        offset: 53,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 55,
                    },
                    end: {
                        line: 4,
                        col: 37,
                        offset: 92,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -4,
                task: ' ',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 55,
                    },
                    end: {
                        line: 4,
                        col: 37,
                        offset: 92,
                    },
                },
            },
        ],
    },
};
