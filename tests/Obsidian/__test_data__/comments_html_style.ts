export const comments_html_style = {
    filePath: 'Test Data/comments_html_style.md',
    fileContents:
        '# comments_html_style\n' +
        '\n' +
        "Whole task line is ignored by Obsidian's `cachedMetadata`:\n" +
        '<!--\n' +
        "- [ ] #task Whole task in 'comments_html_style'\n" +
        '-->\n' +
        '\n' +
        "- [ ] #task Whole task in 'comments_html_style' - with commented-out tag: <!-- #i-am-ignored-by-obsidian  --> - is ignored by Obsidian's `cachedMetadata`, but Tasks recognises it\n" +
        "- [ ] #task Whole task in 'comments_html_style' - with commented-out link: <!-- [[comments_markdown_style]]  --> - is ignored by Obsidian's `cachedMetadata`\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 7,
                        col: 6,
                        offset: 146,
                    },
                    end: {
                        line: 7,
                        col: 11,
                        offset: 151,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 325,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 330,
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
                        col: 21,
                        offset: 21,
                    },
                },
                heading: 'comments_html_style',
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
                        col: 21,
                        offset: 21,
                    },
                },
            },
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 23,
                    },
                    end: {
                        line: 2,
                        col: 58,
                        offset: 81,
                    },
                },
            },
            {
                type: 'html',
                position: {
                    start: {
                        line: 3,
                        col: 0,
                        offset: 82,
                    },
                    end: {
                        line: 5,
                        col: 3,
                        offset: 138,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 140,
                    },
                    end: {
                        line: 8,
                        col: 156,
                        offset: 475,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 140,
                    },
                    end: {
                        line: 7,
                        col: 178,
                        offset: 318,
                    },
                },
                parent: -7,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 319,
                    },
                    end: {
                        line: 8,
                        col: 156,
                        offset: 475,
                    },
                },
                parent: -7,
                task: ' ',
            },
        ],
    },
};
