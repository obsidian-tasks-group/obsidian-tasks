import link_in_file_body from '../Obsidian/__test_data__/link_in_file_body.json';
import { LinkResolver } from '../../src/Task/LinkResolver';

describe('LinkResolver', () => {
    it('should resolve a link via local instance', () => {
        const data = link_in_file_body;
        const rawLink = data.cachedMetadata.links[0];

        const resolver = new LinkResolver();
        const link = resolver.resolve(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });

    it('should resolve a link via global instance', () => {
        const data = link_in_file_body;
        const rawLink = data.cachedMetadata.links[0];

        const link = LinkResolver.getInstance().resolve(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });
});
