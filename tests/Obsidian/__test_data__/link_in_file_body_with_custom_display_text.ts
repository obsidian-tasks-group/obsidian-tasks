export const link_in_file_body_with_custom_display_text = {
    filePath: 'Test Data/link_in_file_body_with_custom_display_text.md',
    fileContents:
        '# link_in_file_body_with_custom_display_text\n' +
        '\n' +
        'I link to [[yaml_tags_is_empty|a file and use custom display text]]\n' +
        '\n' +
        "- [ ] #task Task in 'link_in_file_body_with_custom_display_text'\n",
    cachedMetadata: {
        links: [
            {
                link: 'yaml_tags_is_empty',
                original: '[[yaml_tags_is_empty|a file and use custom display text]]',
                displayText: 'a file and use custom display text',
                position: {
                    start: {
                        line: 2,
                        col: 10,
                        offset: 56,
                    },
                    end: {
                        line: 2,
                        col: 67,
                        offset: 113,
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
                        offset: 121,
                    },
                    end: {
                        line: 4,
                        col: 11,
                        offset: 126,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'link_in_file_body_with_custom_display_text',
                level: 1,
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 44,
                        offset: 44,
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
                        col: 44,
                        offset: 44,
                    },
                },
            },
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 46,
                    },
                    end: {
                        line: 2,
                        col: 67,
                        offset: 113,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 115,
                    },
                    end: {
                        line: 4,
                        col: 64,
                        offset: 179,
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
                        offset: 115,
                    },
                    end: {
                        line: 4,
                        col: 64,
                        offset: 179,
                    },
                },
            },
        ],
    },
};
