export const comments_markdown_style = {
    filePath: 'Test Data/comments_markdown_style.md',
    fileContents:
        '# comments_markdown_style\n' +
        '\n' +
        "Whole task line is ignored by Obsidian's `cachedMetadata`:\n" +
        '%%\n' +
        "- [ ] #task Whole task in 'comments_markdown_style'\n" +
        '%%\n' +
        '\n' +
        "- [ ] #task Whole task in 'comments_markdown_style' - with commented-out tag: %% #i-am-parsed-by-obsidian  %% - is recognised by Obsidian's `cachedMetadata`\n" +
        "- [ ] #task Whole task in 'comments_markdown_style' - with commented-out link: %% [[comments_html_style]]  %% - is recognised by Obsidian's `cachedMetadata`\n",
    cachedMetadata: {
        links: [
            {
                position: {
                    start: {
                        line: 8,
                        col: 82,
                        offset: 384,
                    },
                    end: {
                        line: 8,
                        col: 105,
                        offset: 407,
                    },
                },
                link: 'comments_html_style',
                original: '[[comments_html_style]]',
                displayText: 'comments_html_style',
            },
        ],
        tags: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 95,
                    },
                    end: {
                        line: 4,
                        col: 11,
                        offset: 100,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 6,
                        offset: 151,
                    },
                    end: {
                        line: 7,
                        col: 11,
                        offset: 156,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 81,
                        offset: 226,
                    },
                    end: {
                        line: 7,
                        col: 105,
                        offset: 250,
                    },
                },
                tag: '#i-am-parsed-by-obsidian',
            },
            {
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 308,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 313,
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
                        col: 25,
                        offset: 25,
                    },
                },
                heading: 'comments_markdown_style',
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
                        col: 25,
                        offset: 25,
                    },
                },
            },
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 27,
                    },
                    end: {
                        line: 2,
                        col: 58,
                        offset: 85,
                    },
                },
            },
            {
                type: 'comment',
                position: {
                    start: {
                        line: 3,
                        col: 0,
                        offset: 86,
                    },
                    end: {
                        line: 5,
                        col: 2,
                        offset: 143,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 145,
                    },
                    end: {
                        line: 8,
                        col: 156,
                        offset: 458,
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
                        offset: 145,
                    },
                    end: {
                        line: 7,
                        col: 156,
                        offset: 301,
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
                        offset: 302,
                    },
                    end: {
                        line: 8,
                        col: 156,
                        offset: 458,
                    },
                },
                parent: -7,
                task: ' ',
            },
        ],
    },
};
