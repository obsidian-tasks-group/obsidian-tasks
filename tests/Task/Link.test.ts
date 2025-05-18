import { Link } from '../../src/Task/Link';
import { TasksFile } from '../../src/Scripting/TasksFile';

import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
import internal_heading_links from '../Obsidian/__test_data__/internal_heading_links.json';
import link_in_task_wikilink from '../Obsidian/__test_data__/link_in_task_wikilink.json';
import link_in_task_markdown_link from '../Obsidian/__test_data__/link_in_task_markdown_link.json';

describe('linkClass', () => {
    it('should construct a Link object', () => {
        const rawLink = links_everywhere.cachedMetadata.links[0];
        const link = new Link(rawLink, new TasksFile(links_everywhere.filePath).filenameWithoutExtension);
        expect(link).toBeDefined();
        expect(link.originalMarkdown).toEqual('[[link_in_file_body]]');
        expect(link.destination).toEqual('link_in_file_body');
        expect(link.displayText).toEqual('link_in_file_body');
        expect(link.destinationFilename).toEqual('link_in_file_body');
    });
    describe('.destinationFilename()', () => {
        // Wikilink Tests
        // __internal_heading_links__
        it('should return the filename of the containing note if the link is internal [[#heading]]', () => {
            const rawLink = internal_heading_links.cachedMetadata.links[0];
            const link = new Link(rawLink, new TasksFile(internal_heading_links.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[#Basic Internal Links]]');
            expect(link.destinationFilename).toEqual('internal_heading_links');
        });
        it('should return the filename of the containing note if the link is internal and has an alias [[#heading|display text]]', () => {
            const rawLink = internal_heading_links.cachedMetadata.links[6];
            const link = new Link(rawLink, new TasksFile(internal_heading_links.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[#Header Links With File Reference]]');
            expect(link.destinationFilename).toEqual('internal_heading_links');
        });
        // __link_in_task_wikilink__
        it('should return the filename if simple [[filename]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[0];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });
        it('should return the filename if link has a path [[path/filename]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[2];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[path/link_in_task_wikilink]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });
        it('should return the filename if link has a path and a heading link [[path/filename#heading]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[3];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[path/link_in_task_wikilink#heading_link]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });
        it('should return the filename if link has an alias [[filename|alias]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[4];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink|alias]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });
        it('should return the filename if link has a path and an alias [[path/path/filename|alias]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[5];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[path/path/link_in_task_wikilink|alias]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });
        // Current code targets # and / characters, / is not a valid character in a filename or a path
        // # is a valid character in a filename or a path
        it('should return the filename if path contains a # [[pa#th/path/filename]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[6];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[pa#th/path/link_in_task_wikilink]]');
            expect(link.destinationFilename).toEqual('pa');
        });
        // TODO: How does this affect filtering?
        // When grouping a Wikilink link expect [[file]] to be grouped with [[file.md]]
        it('should return a filename with no file extension if suffixed with .md [[link_in_task_wikilink.md]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[7];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink.md]]');
            expect(link.destinationFilename).toEqual('link_in_task_wikilink');
        });
        it('should return a filename with corresponding file extension if not markdown [[a_pdf_file.pdf]]', () => {
            const rawLink = link_in_task_wikilink.cachedMetadata.links[8];
            const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[[a_pdf_file.pdf]]');
            expect(link.destinationFilename).toEqual('a_pdf_file.pdf');
        });
        // Markdown Links Tests
        it('should return the filename if the link is internal [display name](#heading)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[8];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[heading](#heading)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        it('should return the filename when a simple markdown link [display name](filename)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[2];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        it('should return the filename if link has a path [link_in_task_markdown_link](path/filename.md)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[3];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](path/link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        it('should return the filename if link has a path and a heading link [heading_link](path/filename.md#heading)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[4];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[heading_link](path/link_in_task_markdown_link.md#heading_link)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        it('should return the filename if link has an alias [alias](filename.md)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[5];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[alias](link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        it('should return the filename if link has a path and an alias [alias](path/path/filename.md)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[6];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[alias](path/path/link_in_task_markdown_link.md)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        // // Current code targets # and / characters, / is not a valid character in a filename or a path
        // // # is a valid character in a filename or a path
        it('should return the filename if path contains a # [link_in_task_markdown_link](pa#th/path/filename.md)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[7];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual(
                '[link_in_task_markdown_link](pa#th/path/link_in_task_markdown_link.md)',
            );
            expect(link.destinationFilename).toEqual('pa');
        });
        // // TODO: How does this affect filtering?
        // // When grouping a Wikilink link expect [[file]] to be grouped with [[file.md]]
        it('should return a filename when no .md extension exists in markdown link [alias](filename)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[9];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](link_in_task_markdown_link)');
            expect(link.destinationFilename).toEqual('link_in_task_markdown_link');
        });
        it('should return a filename with corresponding file extension if not markdown [a_pdf_file](a_pdf_file.pdf)', () => {
            const rawLink = link_in_task_markdown_link.cachedMetadata.links[10];
            const link = new Link(rawLink, new TasksFile(link_in_task_markdown_link.filePath).filenameWithoutExtension);
            expect(link.originalMarkdown).toEqual('[a_pdf_file](a_pdf_file.pdf)');
            expect(link.destinationFilename).toEqual('a_pdf_file.pdf');
        });
    });
});
