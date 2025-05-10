import { Link } from '../../src/Task/Link';

import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
import internal_heading_links from '../Obsidian/__test_data__/internal_heading_links.json';
import { TasksFile } from '../../src/Scripting/TasksFile';

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
    it('should return the filename if the link is internal', () => {
        const rawLink = internal_heading_links.cachedMetadata.links[0];
        const link = new Link(rawLink, new TasksFile(internal_heading_links.filePath).filenameWithoutExtension);
        expect(link.destinationFilename).toEqual('internal_heading_links');
    });
});
