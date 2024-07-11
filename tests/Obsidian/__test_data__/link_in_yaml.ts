export const link_in_yaml = {
    filePath: 'Test Data/link_in_yaml.md',
    fileContents:
        '---\n' +
        'test-link: "[[yaml_tags_is_empty]]"\n' +
        '---\n' +
        '\n' +
        '# link_in_yaml\n' +
        '\n' +
        "- [ ] #task Task in 'link_in_yaml'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 67,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 72,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 45,
                    },
                    end: {
                        line: 4,
                        col: 14,
                        offset: 59,
                    },
                },
                heading: 'link_in_yaml',
                level: 1,
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
                        line: 2,
                        col: 3,
                        offset: 43,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 45,
                    },
                    end: {
                        line: 4,
                        col: 14,
                        offset: 59,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 61,
                    },
                    end: {
                        line: 6,
                        col: 34,
                        offset: 95,
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
                        offset: 61,
                    },
                    end: {
                        line: 6,
                        col: 34,
                        offset: 95,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
        frontmatter: {
            'test-link': '[[yaml_tags_is_empty]]',
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 2,
                col: 3,
                offset: 43,
            },
        },
        frontmatterLinks: [
            {
                key: 'test-link',
                link: 'yaml_tags_is_empty',
                original: '[[yaml_tags_is_empty]]',
                displayText: 'yaml_tags_is_empty',
            },
        ],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
