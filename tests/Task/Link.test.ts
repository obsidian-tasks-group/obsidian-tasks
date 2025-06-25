import { Link } from '../../src/Task/Link';
import { TasksFile } from '../../src/Scripting/TasksFile';

import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
import internal_heading_links from '../Obsidian/__test_data__/internal_heading_links.json';
import link_in_task_wikilink from '../Obsidian/__test_data__/link_in_task_wikilink.json';
import link_in_task_markdown_link from '../Obsidian/__test_data__/link_in_task_markdown_link.json';

function getLink(data: any, index: number) {
    const rawLink = data.cachedMetadata.links[index];
    return new Link(rawLink, new TasksFile(data.filePath).filenameWithoutExtension);
}

describe('linkClass', () => {
    it('should construct a Link object', () => {
        const link = getLink(links_everywhere, 0);

        expect(link).toBeDefined();
        expect(link.originalMarkdown).toEqual('[[link_in_file_body]]');
        expect(link.destination).toEqual('link_in_file_body');
        expect(link.displayText).toEqual('link_in_file_body');
        expect(link.destinationFilename).toEqual('link_in_file_body');
    });

    describe('.destinationFilename()', () => {
        // ================================
        // WIKILINK TESTS
        // ================================

        // Tests checking against __internal_heading_links__
        it('should return the filename of the containing note if the link is internal [[#heading]]', () => {
            const link = getLink(internal_heading_links, 0);

            expect(link.originalMarkdown).toEqual('[[#Basic Internal Links]]');
            expect(link.destinationFilename).toEqual('internal_heading_links');
        });

        it('should return the filename of the containing note if the link is internal and has an alias [[#heading|display text]]', () => {
            const link = getLink(internal_heading_links, 6);

            expect(link.originalMarkdown).toEqual('[[#Header Links With File Reference]]');
            expect(link.destinationFilename).toEqual('internal_heading_links');
        });

        // Tests checking against __link_in_task_wikilink__
        it('should return the filename if simple [[filename]]', () => {
            const link = getLink(link_in_task_wikilink, 0);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });

        it('should return the filename if link has a path [[path/filename]]', () => {
            const link = getLink(link_in_task_wikilink, 2);

            expect(link.originalMarkdown).toEqual('[[path/link_in_task_wikilink]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });

        it('should return the filename if link has a path and a heading link [[path/filename#heading]]', () => {
            const link = getLink(link_in_task_wikilink, 3);

            expect(link.originalMarkdown).toEqual('[[path/link_in_task_wikilink#heading_link]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });

        it('should return the filename if link has an alias [[filename|alias]]', () => {
            const link = getLink(link_in_task_wikilink, 4);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink|alias]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });

        it('should return the filename if link has a path and an alias [[path/path/filename|alias]]', () => {
            const link = getLink(link_in_task_wikilink, 5);

            expect(link.originalMarkdown).toEqual('[[path/path/link_in_task_wikilink|alias]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });

        // # is a valid character in a filename or a path but Obsidian does not support it in links
        it('should return the filename if path contains a # [[pa#th/path/filename]]', () => {
            const link = getLink(link_in_task_wikilink, 6);

            expect(link.originalMarkdown).toEqual('[[pa#th/path/link_in_task_wikilink]]');
            expect(link.destinationFilename).toEqual('pa');
        });

        // When grouping a Wikilink link expect [[file.md]] to be grouped with [[file]].
        it('should return a filename with no file extension if suffixed with .md [[link_in_task_wikilink.md]]', () => {
            const link = getLink(link_in_task_wikilink, 7);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink.md]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });

        it('should return a filename with corresponding file extension if not markdown [[a_pdf_file.pdf]]', () => {
            const link = getLink(link_in_task_wikilink, 8);

            expect(link.originalMarkdown).toEqual('[[a_pdf_file.pdf]]');
            expect(link.destinationFilename).toEqual('a_pdf_file.pdf');
        });

        // Empty Wikilink Tests
        // [[]] is not detected by the obsidian parser as a link

        it('should provide no special functionality for [[|]]; returns "|")', () => {
            const link = getLink(link_in_task_wikilink, 9);

            expect(link.originalMarkdown).toEqual('[[|]]');
            expect(link.destinationFilename).toEqual('|');
        });

        it('should provide no special functionality for [[|alias]]; returns "|alias".)', () => {
            const link = getLink(link_in_task_wikilink, 10);

            expect(link.originalMarkdown).toEqual('[[|alias]]');
            expect(link.destinationFilename).toEqual('|alias');
        });

        it('should provide no special functionality for [[|#alias]]; returns "|".)', () => {
            const link = getLink(link_in_task_wikilink, 11);

            expect(link.originalMarkdown).toEqual('[[|#alias]]');
            expect(link.destinationFilename).toEqual('|');
        });

        // ================================
        // MARKDOWN LINK TESTS
        // ================================

        // Tests checking against __link_in_task_markdown_link__

        it('should return the filename if the link is internal [display name](#heading)', () => {
            const link = getLink(link_in_task_markdown_link, 8);

            expect(link.originalMarkdown).toEqual('[heading](#heading)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        it('should return the filename when a simple markdown link [display name](filename)', () => {
            const link = getLink(link_in_task_markdown_link, 2);

            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        it('should return the filename if link has a path [link_in_task_markdown_link](path/filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 3);

            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](path/link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        it('should return the filename if link has a path and a heading link [heading_link](path/filename.md#heading)', () => {
            const link = getLink(link_in_task_markdown_link, 4);

            expect(link.originalMarkdown).toEqual('[heading_link](path/link_in_task_markdown_link.md#heading_link)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        it('should return the filename if link has an alias [alias](filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 5);

            expect(link.originalMarkdown).toEqual('[alias](link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        it('should return the filename if link has a path and an alias [alias](path/path/filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 6);

            expect(link.originalMarkdown).toEqual('[alias](path/path/link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        // # is a valid character in a filename or a path but Obsidian does not support it in links
        it('should return the string before the # [link_in_task_markdown_link](pa#th/path/filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 7);

            expect(link.originalMarkdown).toEqual(
                '[link_in_task_markdown_link](pa#th/path/link_in_task_markdown_link.md)',
            );
            expect(link.destinationFilename).toEqual('pa');
        });

        // When grouping a Wikilink link expect [[file.md]] to be grouped with [[file]].
        it('should return a filename when no .md extension if the .md exists in markdown link [alias](filename)', () => {
            const link = getLink(link_in_task_markdown_link, 9);

            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](link_in_task_markdown_link)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });

        it('should return a filename with corresponding file extension if not markdown [a_pdf_file](a_pdf_file.pdf)', () => {
            const link = getLink(link_in_task_markdown_link, 10);

            expect(link.originalMarkdown).toEqual('[a_pdf_file](a_pdf_file.pdf)');
            expect(link.destinationFilename).toEqual('a_pdf_file.pdf');
        });

        it('should handle spaces in the path, filename, and heading link [heading link](path/filename with spaces.md#heading link)', () => {
            const link = getLink(link_in_task_markdown_link, 11);

            expect(link.originalMarkdown).toEqual(
                '[spaces everywhere](Test%20Data/spaced%20filename%20link.md#spaced%20heading)',
            );
            expect(link.destinationFilename).toEqual('spaced filename link');
        });

        // Empty Markdown Link Tests
        // []() and [alias]() are not detected by the obsidian parser as a link
    });
});
