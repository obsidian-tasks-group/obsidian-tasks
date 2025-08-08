import type { Reference } from 'obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Link } from '../../src/Task/Link';
import internal_heading_links from '../Obsidian/__test_data__/internal_heading_links.json';
import link_in_heading from '../Obsidian/__test_data__/link_in_heading.json';
import link_in_task_markdown_link from '../Obsidian/__test_data__/link_in_task_markdown_link.json';
import link_in_task_wikilink from '../Obsidian/__test_data__/link_in_task_wikilink.json';
import link_is_broken from '../Obsidian/__test_data__/link_is_broken.json';

import link_in_file_body from '../Obsidian/__test_data__/link_in_file_body.json';
import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
import { allCacheSampleData } from '../Obsidian/AllCacheSampleData';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import { addBackticks, formatToRepresentType } from '../Scripting/ScriptingTestHelpers';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import { verifyMarkdown } from '../TestingTools/VerifyMarkdown';
import { LinkResolver } from '../../src/Task/LinkResolver';
import { getFirstLinkpathDest, getFirstLinkpathDestFromData } from '../__mocks__/obsidian';

function getLink(data: any, index: number) {
    const rawLink = data.cachedMetadata.links[index];
    const destinationPath = getFirstLinkpathDestFromData(data, rawLink);
    return new Link(rawLink, data.filePath, destinationPath);
}

describe('linkClass', () => {
    it('should construct a Link object', () => {
        const link = getLink(links_everywhere, 0);

        expect(link).toBeDefined();
        expect(link.originalMarkdown).toEqual('[[link_in_file_body]]');
        expect(link.destination).toEqual('link_in_file_body');
        expect(link.displayText).toEqual('link_in_file_body');
        expect(link.markdown).toEqual(link.originalMarkdown);
        expect(link.linksTo('link_in_file_body')).toEqual(true);
        expect(link.linksTo('link_in_file_body.md')).toEqual(true);
    });

    describe('getLink() configures Link.destinationPath automatically', () => {
        it('should set the full path for a resolved link', () => {
            const link = getLink(link_in_heading, 0);
            expect(link.destinationPath).toEqual('Test Data/multiple_headings.md');
        });

        it('should not set the full path for a broken/unresolved link', () => {
            const link = getLink(link_is_broken, 0);
            expect(link.destinationPath).toEqual(null);
        });
    });

    describe('return markdown to navigate to a link', () => {
        // These links are useful
        it('should return the filename if simple [[filename]]', () => {
            const link = getLink(link_in_task_wikilink, 0);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink]]');
            expect(link.markdown).toEqual('[[link_in_task_wikilink]]');
        });

        // For more test examples, see QueryResultsRenderer.test.ts
        it('should return a working link to [[#heading]]', () => {
            const link = getLink(internal_heading_links, 0);

            expect(link.originalMarkdown).toEqual('[[#Basic Internal Links]]');
            expect(link.markdown).toEqual(
                '[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]',
            );
        });

        // ================================
        // WIKILINK TESTS
        // ================================

        // Tests checking against __internal_heading_links__
        it('should return the filename of the containing note if the link is internal [[#heading]]', () => {
            const link = getLink(internal_heading_links, 0);

            expect(link.originalMarkdown).toEqual('[[#Basic Internal Links]]');
            expect(link.markdown).toEqual(
                '[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]',
            );
        });

        it('should return the filename of the containing note if the link is internal and has an alias [[#heading|display text]]', () => {
            const link = getLink(internal_heading_links, 6);

            expect(link.originalMarkdown).toEqual('[[#Header Links With File Reference]]');
            expect(link.markdown).toEqual(
                '[[Test Data/internal_heading_links.md#Header Links With File Reference|Header Links With File Reference]]',
            );
        });

        // Tests checking against __link_in_task_wikilink__
        it('should return the filename if simple [[filename]]', () => {
            const link = getLink(link_in_task_wikilink, 0);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has a path [[path/filename]]', () => {
            const link = getLink(link_in_task_wikilink, 2);

            expect(link.originalMarkdown).toEqual('[[Test Data/link_in_task_wikilink]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has a path and a heading link [[path/filename#heading]]', () => {
            const link = getLink(link_in_task_wikilink, 3);

            expect(link.originalMarkdown).toEqual('[[Test Data/link_in_task_wikilink#heading_link]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has an alias [[filename|alias]]', () => {
            const link = getLink(link_in_task_wikilink, 4);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink|alias]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has a path and an alias [[path/path/filename|alias]]', () => {
            const link = getLink(link_in_task_wikilink, 5);

            expect(link.originalMarkdown).toEqual('[[Test Data/link_in_task_wikilink|alias]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // # is a valid character in a filename or a path but Obsidian does not support it in links
        it('should return the filename if path contains a # [[pa#th/path/filename]]', () => {
            const link = getLink(link_in_task_wikilink, 6);

            expect(link.originalMarkdown).toEqual('[[pa#th/path/link_in_task_wikilink]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // When grouping a Wikilink link expect [[file.md]] to be grouped with [[file]].
        it('should return a filename with no file extension if suffixed with .md [[link_in_task_wikilink.md]]', () => {
            const link = getLink(link_in_task_wikilink, 7);

            expect(link.originalMarkdown).toEqual('[[link_in_task_wikilink.md]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return a filename with corresponding file extension if not markdown [[a_pdf_file.pdf]]', () => {
            const link = getLink(link_in_task_wikilink, 8);

            expect(link.originalMarkdown).toEqual('[[a_pdf_file.pdf]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // Empty Wikilink Tests
        // [[]] is not detected by the obsidian parser as a link

        it('should provide no special functionality for [[|]]; returns "|")', () => {
            const link = getLink(link_in_task_wikilink, 9);

            expect(link.originalMarkdown).toEqual('[[|]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should provide no special functionality for [[|alias]]; returns "|alias".)', () => {
            const link = getLink(link_in_task_wikilink, 10);

            expect(link.originalMarkdown).toEqual('[[|alias]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should provide no special functionality for [[|#alias]]; returns "|".)', () => {
            const link = getLink(link_in_task_wikilink, 11);

            expect(link.originalMarkdown).toEqual('[[|#alias]]');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // ================================
        // MARKDOWN LINK TESTS
        // ================================

        // Tests checking against __link_in_task_markdown_link__

        it('should return the filename if the link is internal [display name](#heading)', () => {
            const link = getLink(link_in_task_markdown_link, 8);

            expect(link.originalMarkdown).toEqual('[heading](#heading)');
            expect(link.markdown).toEqual('[[Test Data/link_in_task_markdown_link.md#heading|heading]]');
        });

        it('should return the filename when a simple markdown link [display name](filename)', () => {
            const link = getLink(link_in_task_markdown_link, 2);

            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](link_in_task_markdown_link.md)');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has a path [link_in_task_markdown_link](path/filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 3);

            expect(link.originalMarkdown).toEqual(
                '[link_in_task_markdown_link](Test%20Data/link_in_task_markdown_link.md)',
            );
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has a path and a heading link [heading_link](path/filename.md#heading)', () => {
            const link = getLink(link_in_task_markdown_link, 4);

            expect(link.originalMarkdown).toEqual('[heading_link](Test%20Data/link_in_task_markdown_link.md#heading)');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has an alias [alias](filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 5);

            expect(link.originalMarkdown).toEqual('[alias](link_in_task_markdown_link.md)');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return the filename if link has a path and an alias [alias](path/path/filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 6);

            expect(link.originalMarkdown).toEqual('[alias](Test%20Data/link_in_task_markdown_link.md)');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // # is a valid character in a filename or a path but Obsidian does not support it in links
        it('should return the string before the # [link_in_task_markdown_link](pa#th/path/filename.md)', () => {
            const link = getLink(link_in_task_markdown_link, 7);

            expect(link.originalMarkdown).toEqual(
                '[link_in_task_markdown_link](pa#th/path/link_in_task_markdown_link.md)',
            );
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // When grouping a Wikilink link expect [[file.md]] to be grouped with [[file]].
        it('should return a filename when no .md extension if the .md exists in markdown link [alias](filename)', () => {
            const link = getLink(link_in_task_markdown_link, 9);

            expect(link.originalMarkdown).toEqual('[link_in_task_markdown_link](link_in_task_markdown_link)');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should return a filename with corresponding file extension if not markdown [a_pdf_file](a_pdf_file.pdf)', () => {
            const link = getLink(link_in_task_markdown_link, 10);

            expect(link.originalMarkdown).toEqual('[a_pdf_file](a_pdf_file.pdf)');
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        it('should handle spaces in the path, filename, and heading link [heading link](path/filename with spaces.md#heading link)', () => {
            const link = getLink(link_in_task_markdown_link, 11);

            expect(link.originalMarkdown).toEqual(
                '[spaces everywhere](Manual%20Testing/Smoke%20Testing%20the%20Tasks%20Plugin#How%20the%20tests%20work)',
            );
            expect(link.markdown).toEqual(link.originalMarkdown);
        });

        // Empty Markdown Link Tests
        // []() and [alias]() are not detected by the obsidian parser as a link
    });

    describe('destinationPath tests', () => {
        it('should accept and return destinationPath', () => {
            const data = link_in_file_body;
            const rawLink = data.cachedMetadata.links[0];
            expect(rawLink.original).toEqual('[[yaml_tags_is_empty]]');
            expect(rawLink.link).toEqual('yaml_tags_is_empty');

            const destinationPath = 'Test Data/yaml_tags_is_empty.md';
            const link = new Link(rawLink, data.filePath, destinationPath);

            expect(link.destinationPath).toEqual(destinationPath);
        });

        it('should return null path if destinationPath not supplied', () => {
            const data = link_in_file_body;
            const rawLink = data.cachedMetadata.links[0];
            expect(rawLink.original).toEqual('[[yaml_tags_is_empty]]');
            expect(rawLink.link).toEqual('yaml_tags_is_empty');

            const link = new Link(rawLink, data.filePath);

            expect(link.destinationPath).toBeNull();
        });
    });

    describe('linksTo() tests', () => {
        it('matches filenames', () => {
            const link = getLink(links_everywhere, 0);

            expect(link.linksTo('link_in_file_body')).toEqual(true);
            expect(link.linksTo('link_in_file_body.md')).toEqual(true);

            expect(link.linksTo('somewhere_else')).toEqual(false);

            expect(link.linksTo('link_in_file_body_but_different')).toEqual(false);
            expect(link.linksTo('link_in_file_')).toEqual(false);
        });

        it('matches without folders', () => {
            const linkToAFile = getLink(link_in_task_wikilink, 0);
            expect(linkToAFile.originalMarkdown).toMatchInlineSnapshot('"[[link_in_task_wikilink]]"');

            expect(linkToAFile.linksTo('link_in_task_wikilink')).toEqual(true);
        });

        it('matches with folders', () => {
            const linkToAFolder = getLink(link_in_task_wikilink, 2);
            expect(linkToAFolder.originalMarkdown).toMatchInlineSnapshot('"[[Test Data/link_in_task_wikilink]]"');

            expect(linkToAFolder.linksTo('link_in_task_wikilink')).toEqual(true);
            expect(linkToAFolder.linksTo('Test Data/link_in_task_wikilink')).toEqual(true);
            expect(linkToAFolder.linksTo('Test Data/link_in_task_wikilink.md')).toEqual(true);
        });

        it('matches TasksFile - only exact paths match', () => {
            const linkToAFolder = getLink(link_in_task_wikilink, 2);
            expect(linkToAFolder.originalMarkdown).toMatchInlineSnapshot('"[[Test Data/link_in_task_wikilink]]"');

            expect(linkToAFolder.linksTo(new TasksFile('Test Data/link_in_task_wikilink.md'))).toEqual(true);
            expect(linkToAFolder.linksTo(new TasksFile('link_in_task_wikilink.md'))).toEqual(false);
            expect(linkToAFolder.linksTo(new TasksFile('Wrong Test Data/link_in_task_wikilink.md'))).toEqual(false);
            expect(linkToAFolder.linksTo(new TasksFile('something_obviously_different.md'))).toEqual(false);
        });
    });
});

describe('visualise links', () => {
    beforeAll(() => {
        LinkResolver.getInstance().setGetFirstLinkpathDestFn((rawLink: Reference, sourcePath: string) => {
            return getFirstLinkpathDest(rawLink, sourcePath);
        });
    });

    afterAll(() => {
        LinkResolver.getInstance().resetGetFirstLinkpathDestFn();
    });

    function createRow(field: string, value: string | undefined): string {
        // We use NBSP - non-breaking spaces - so that the approved file content
        // is correctly aligned when viewed in Obsidian:
        return addBackticks(field.padEnd(26, ' ')) + ': ' + addBackticks(formatToRepresentType(value)) + '\n';
    }

    function visualiseLinks(outlinks: Readonly<Link[]>, file: SimulatedFile) {
        let output = '';

        if (outlinks.length === 0) {
            return output;
        }

        output += `## ${file.filePath}\n\n`;
        outlinks.forEach((link) => {
            output += createRow('link.originalMarkdown', link.originalMarkdown);
            output += createRow('link.markdown', link.markdown);
            output += createRow('link.destination', link.destination);
            output += createRow('link.destinationPath', link.destinationPath ?? 'null');
            output += createRow('link.displayText', link.displayText);
            output += '\n';
        });
        return output;
    }

    it('note bodies', () => {
        let output = '';
        allCacheSampleData().forEach((file) => {
            const tasksFile = getTasksFileFromMockData(file);
            output += visualiseLinks(tasksFile.outlinksInBody, file);
        });
        verifyMarkdown(output);
    });

    it('properties', () => {
        let output = '';
        allCacheSampleData().forEach((file) => {
            const tasksFile = getTasksFileFromMockData(file);
            output += visualiseLinks(tasksFile.outlinksInProperties, file);
        });
        verifyMarkdown(output);
    });

    it('outlinks', () => {
        let output = '';
        allCacheSampleData().forEach((file) => {
            const tasksFile = getTasksFileFromMockData(file);
            output += visualiseLinks(tasksFile.outlinks, file);
        });
        verifyMarkdown(output);
    });
});
