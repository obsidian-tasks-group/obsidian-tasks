import { Link } from '../../src/Task/Link';
import { TasksFile } from '../../src/Scripting/TasksFile';

import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
import internal_heading_links from '../Obsidian/__test_data__/internal_heading_links.json';
import link_in_task_wikilink from '../Obsidian/__test_data__/link_in_task_wikilink.json';

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
    it('should return the filename if the link is internal filename [[#heading]]', () => {
        const rawLink = internal_heading_links.cachedMetadata.links[0];
        const link = new Link(rawLink, new TasksFile(internal_heading_links.filePath).filenameWithoutExtension);
        expect(link.destinationFilename).toEqual('internal_heading_links');
    });
    it('should return the filename if the link is internal filename [[#heading|display text]]', () => {
        const rawLink = internal_heading_links.cachedMetadata.links[6];
        const link = new Link(rawLink, new TasksFile(internal_heading_links.filePath).filenameWithoutExtension);
        expect(link.destinationFilename).toEqual('internal_heading_links');
    });
    it('should return the filename if link has a path [[path/filename]]', () => {
        const rawLink = link_in_task_wikilink.cachedMetadata.links[2];
        const link = new Link(rawLink, new TasksFile(link_in_task_wikilink.filePath).filenameWithoutExtension);
        expect(link.destinationFilename).toEqual('link_in_task_wikilink');
    });

    // TODO: test wikiLink format, destination tests for that?
    // TODO: test filename#heading
    // TODO: test path/../filename
    // TODO: test path/../filename#heading
    // TODO: what if file path is ambiguous?

    // TODO: test markdown format
});
