export const yaml_2_aliases = {
    filePath: 'Test Data/yaml_2_aliases.md',
    fileContents:
        '---\n' +
        'aliases:\n' +
        '  - YAML Alias 1\n' +
        '  - YAML Alias 2\n' +
        '---\n' +
        '\n' +
        '# yaml_2_aliases\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_2_aliases'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 76,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 81,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 52,
                    },
                    end: {
                        line: 6,
                        col: 16,
                        offset: 68,
                    },
                },
                heading: 'yaml_2_aliases',
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
                        line: 4,
                        col: 3,
                        offset: 50,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 52,
                    },
                    end: {
                        line: 6,
                        col: 16,
                        offset: 68,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 70,
                    },
                    end: {
                        line: 8,
                        col: 36,
                        offset: 106,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 70,
                    },
                    end: {
                        line: 8,
                        col: 36,
                        offset: 106,
                    },
                },
                parent: -8,
                task: ' ',
            },
        ],
        frontmatter: {
            aliases: ['YAML Alias 1', 'YAML Alias 2'],
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 4,
                col: 3,
                offset: 50,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.7.1',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
