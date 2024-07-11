export const link_is_broken = {
    filePath: 'Test Data/link_is_broken.md',
    fileContents:
        '# link_is_broken\n' + '\n' + "- [ ] #task Task in 'link_is_broken' [[broken link - do not fix me]]\n",
    cachedMetadata: {
        links: [
            {
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
                link: 'broken link - do not fix me',
                original: '[[broken link - do not fix me]]',
                displayText: 'broken link - do not fix me',
            },
        ],
        tags: [
            {
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
                        col: 16,
                        offset: 16,
                    },
                },
                heading: 'link_is_broken',
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
                parent: -2,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
