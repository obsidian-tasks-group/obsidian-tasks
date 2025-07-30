import type { Reference } from 'obsidian';
import link_in_file_body from '../Obsidian/__test_data__/link_in_file_body.json';
import { LinkResolver } from '../../src/Task/LinkResolver';

describe('LinkResolver', () => {
    let rawLink: Reference;

    beforeEach(() => {
        rawLink = link_in_file_body.cachedMetadata.links[0];
    });

    it('should resolve a link via local instance', () => {
        const resolver = new LinkResolver();
        const link = resolver.resolve(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });

    it('should resolve a link via global instance', () => {
        const link = LinkResolver.getInstance().resolve(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });
});
