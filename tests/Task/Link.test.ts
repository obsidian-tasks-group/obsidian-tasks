import { Link } from '../../src/Task/Link';

import links_everywhere from '../Obsidian/__test_data__/links_everywhere.json';
describe('linkClass', () => {
    it('should construct a Link object', () => {
        const rawLink = links_everywhere.cachedMetadata.links[0];
        const link = new Link(rawLink);
        expect(link).toBeDefined();
        expect(link.originalMarkdown).toEqual('[[link_in_file_body]]');
        expect(link.destination).toEqual('link_in_file_body');
        expect(link.displayText).toEqual('link_in_file_body');
    });
});
