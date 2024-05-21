export const link_is_broken = {
    filePath: 'Test Data/link_is_broken.md',
    fileContents:
        '# link_is_broken\n' + '\n' + "- [ ] #task Task in 'link_is_broken' [[broken link - do not fix me]]\n",
    cachedMetadata: {
        links: [
            {
                link: 'broken link - do not fix me',
                original: '[[broken link - do not fix me]]',
                displayText: 'broken link - do not fix me',
                position: {
                    start: {
                        line: 2,
                        col: 37,
                        offset: 55,
                    },
                    end: {
                        line: 2,
                        col: 68,
                        offset: 86,
                    },
                },
            },
        ],
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 24,
                    },
                    end: {
                        line: 2,
                        col: 11,
                        offset: 29,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'link_is_broken',
                level: 1,
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 16,
                        offset: 16,
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
                        col: 16,
                        offset: 16,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 18,
                    },
                    end: {
                        line: 2,
                        col: 68,
                        offset: 86,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -2,
                task: ' ',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 18,
                    },
                    end: {
                        line: 2,
                        col: 68,
                        offset: 86,
                    },
                },
            },
        ],
    },
};
