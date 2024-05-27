export const link_in_file_body = {
    filePath: 'Test Data/link_in_file_body.md',
    fileContents:
        '# link_in_file_body\n' +
        '\n' +
        'I link to [[yaml_tags_is_empty]]\n' +
        '\n' +
        "- [ ] #task Task in 'link_in_file_body'\n",
    cachedMetadata: {
        links: [
            {
                link: 'yaml_tags_is_empty',
                original: '[[yaml_tags_is_empty]]',
                displayText: 'yaml_tags_is_empty',
                position: {
                    start: {
                        line: 2,
                        col: 10,
                        offset: 31,
                    },
                    end: {
                        line: 2,
                        col: 32,
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
                heading: 'link_in_file_body',
                level: 1,
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
                type: 'paragraph',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 21,
                    },
                    end: {
                        line: 2,
                        col: 32,
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
                        col: 39,
                        offset: 94,
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
                        col: 39,
                        offset: 94,
                    },
                },
            },
        ],
    },
};
